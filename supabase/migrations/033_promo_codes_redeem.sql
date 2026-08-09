-- ═══════════════════════════════════════════════════════════════════════════
-- Codes promo : fonction d'échange + assouplissement du trigger de protection
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Le trigger protect_sensitive_profile_columns (027) remet silencieusement
-- plan et plan_expires_at à leur ancienne valeur dès que auth.role() n'est
-- pas service_role. Une fonction SECURITY DEFINER ne suffit pas : le trigger
-- regarde le jeton de la requête, pas le propriétaire de la fonction.
-- Sans le correctif ci-dessous, un code promo était consommé sans que
-- l'abonnement soit accordé — l'élève perdait son code pour rien.
--
-- Deux protections, volontairement redondantes :
--
--  1. Un drapeau local à la transaction (app.octroi_de_confiance), posé par
--     redeem_promo_code juste avant son UPDATE. Un client ne peut pas le
--     poser : set_config n'est pas exposé par PostgREST, et il faudrait de
--     toute façon le faire dans la même transaction que l'écriture.
--
--  2. Une vérification après coup qui compare à la valeur ATTENDUE, calculée
--     avant l'UPDATE. Une première version se contentait de vérifier qu'un
--     plan valide existait : sur un compte déjà abonné, cette condition
--     restait vraie même quand l'octroi avait échoué. Si la comparaison
--     échoue, on lève : la transaction est annulée, donc ni le compteur ni
--     le journal ne bougent et l'élève peut réessayer.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Webhooks, cron, admin : gardent la main.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Fonctions internes de confiance (redeem_promo_code) : elles posent ce
  -- drapeau juste avant leur UPDATE, et il retombe a la fin de la transaction.
  IF coalesce(current_setting('app.octroi_de_confiance', true), '') = 'on' THEN
    RETURN NEW;
  END IF;

  NEW.plan                := OLD.plan;
  NEW.plan_expires_at     := OLD.plan_expires_at;
  NEW.sky_coins           := OLD.sky_coins;
  NEW.total_coins_earned  := OLD.total_coins_earned;
  NEW.weekly_coins        := OLD.weekly_coins;
  NEW.monthly_coins       := OLD.monthly_coins;
  NEW.prestige_level      := OLD.prestige_level;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_promo_code(
  p_user_id uuid,
  p_code    text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code       public.promo_codes%ROWTYPE;
  v_normalise  text;
  v_maintenant timestamptz := now();
  v_base       timestamptz;
  v_attendu    timestamptz;
  v_obtenu     timestamptz;
  v_plan_apres text;
  v_mois       integer;
  v_plan       text;
BEGIN
  v_normalise := upper(btrim(coalesce(p_code, '')));

  IF length(v_normalise) < 4 THEN
    RETURN jsonb_build_object('ok', false, 'raison', 'invalide');
  END IF;

  -- Verrou de ligne AVANT toute verification : deux echanges simultanes sur
  -- la derniere utilisation disponible ne peuvent pas passer tous les deux.
  SELECT * INTO v_code
    FROM public.promo_codes
   WHERE code = v_normalise
     FOR UPDATE;

  -- « Inexistant », « desactive » et « expire » renvoient la meme reponse :
  -- distinguer les cas permettrait de deviner quels codes existent.
  IF NOT FOUND
     OR NOT v_code.active
     OR (v_code.expires_at IS NOT NULL AND v_code.expires_at <= v_maintenant) THEN
    RETURN jsonb_build_object('ok', false, 'raison', 'invalide');
  END IF;

  IF v_code.uses_count >= v_code.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'raison', 'epuise');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.promo_code_redemptions
     WHERE code_id = v_code.id AND user_id = p_user_id
  ) THEN
    RETURN jsonb_build_object('ok', false, 'raison', 'deja_utilise');
  END IF;

  INSERT INTO public.promo_code_redemptions
    (code_id, user_id, granted_novas, granted_starter, granted_pro)
  VALUES
    (v_code.id, p_user_id, v_code.bonus_novas, v_code.starter_month, v_code.pro_month);

  UPDATE public.promo_codes
     SET uses_count = uses_count + 1
   WHERE id = v_code.id;

  IF v_code.bonus_novas > 0 THEN
    PERFORM public.add_novas(p_user_id, v_code.bonus_novas::bigint,
                             'Code promo ' || v_code.code);
  END IF;

  -- Pro l'emporte sur Starter si le code accorde les deux.
  IF v_code.pro_month > 0 THEN
    v_plan := 'pro';  v_mois := v_code.pro_month;
  ELSIF v_code.starter_month > 0 THEN
    v_plan := 'starter'; v_mois := v_code.starter_month;
  END IF;

  IF v_plan IS NOT NULL THEN
    -- On prolonge une periode deja payee au lieu de l'ecraser.
    SELECT GREATEST(coalesce(plan_expires_at, v_maintenant), v_maintenant)
      INTO v_base
      FROM public.profiles
     WHERE id = p_user_id;

    v_attendu := v_base + (v_mois || ' months')::interval;

    PERFORM set_config('app.octroi_de_confiance', 'on', true);

    UPDATE public.profiles
       SET plan            = v_plan,
           plan_expires_at = v_attendu
     WHERE id = p_user_id;

    PERFORM set_config('app.octroi_de_confiance', 'off', true);

    SELECT plan, plan_expires_at INTO v_plan_apres, v_obtenu
      FROM public.profiles WHERE id = p_user_id;

    IF v_plan_apres IS DISTINCT FROM v_plan
       OR v_obtenu IS DISTINCT FROM v_attendu THEN
      RAISE EXCEPTION
        'octroi du plan % refuse pour % (attendu %, obtenu % / %)',
        v_plan, p_user_id, v_attendu, v_plan_apres, v_obtenu
        USING ERRCODE = 'raise_exception';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok',            true,
    'code',          v_code.code,
    'bonus_novas',   v_code.bonus_novas,
    'starter_month', v_code.starter_month,
    'pro_month',     v_code.pro_month
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_promo_code(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.redeem_promo_code(uuid, text) TO service_role;
