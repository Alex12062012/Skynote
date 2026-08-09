-- ============================================================
-- 030_mastery_chests.sql
-- COFFRES DE MAÎTRISE — remplacement de la roue de la fortune
-- ============================================================
-- La roue de la fortune (wheel_spins) était une mécanique de type
-- loot box : mise obligatoire de 50 Sky Coins, résultat aléatoire
-- pondéré, ~38 % de "Perdu", espérance de gain négative, sur un
-- public de mineurs (10-17 ans). Cf. l'en-tête de
-- lib/gamification/config.ts pour le détail du risque régulatoire
-- (Belgique/Pays-Bas : loot boxes = jeu de hasard ; UE : Digital
-- Fairness Act ; France : vigilance DGCCRF sur les mineurs).
--
-- Nouveau système, 100 % déterministe :
--   • 1 coffre débloqué tous les N QCM réussis en 5/5 (effort pur) ;
--   • aucune monnaie dépensée pour ouvrir ;
--   • le contenu du coffre n°X est connu à l'avance (cycle fixe
--     MASTERY_CHEST_TRACK côté application) ;
--   • aucun "Perdu" possible.
--
-- La table wheel_spins est conservée telle quelle (historique des
-- anciens tours, lecture seule) — aucune donnée élève n'est détruite.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.mastery_chest_claims (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- numéro du coffre dans la progression de l'élève (1, 2, 3…)
  chest_number  integer NOT NULL CHECK (chest_number > 0),
  -- palier du cycle fixe (tier_1 … tier_8)
  tier_id       text NOT NULL,
  reward_type   text NOT NULL CHECK (reward_type IN ('coins', 'nova', 'boost_x2', 'skin')),
  reward_value  integer NOT NULL DEFAULT 0,
  -- id du skin obtenu, le cas échéant
  reward_item_id text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, chest_number)
);

CREATE INDEX IF NOT EXISTS mastery_chest_claims_user_idx
  ON public.mastery_chest_claims (user_id, chest_number DESC);

ALTER TABLE public.mastery_chest_claims ENABLE ROW LEVEL SECURITY;

-- L'élève lit ses propres coffres…
DROP POLICY IF EXISTS "Users see own chests" ON public.mastery_chest_claims;
CREATE POLICY "Users see own chests"
  ON public.mastery_chest_claims FOR SELECT
  USING (auth.uid() = user_id);

-- …mais ne peut PAS s'auto-attribuer un coffre : l'insertion passe
-- exclusivement par claim_mastery_chest() (SECURITY DEFINER), qui
-- vérifie l'effort réellement fourni. Aucune policy INSERT/UPDATE.

-- ─── Ouverture atomique d'un coffre ──────────────────────────
-- Vérifie côté serveur que l'élève a bien fourni l'effort requis,
-- puis réserve le prochain numéro de coffre. Renvoie NULL si aucun
-- coffre n'est ouvrable (l'application n'accorde alors rien).
-- L'UNIQUE (user_id, chest_number) + le lock de la ligne profil
-- empêchent le double-claim en cas de double-clic ou de rejeu.
CREATE OR REPLACE FUNCTION public.claim_mastery_chest(
  p_user_id  uuid,
  p_interval integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_perfect  integer;
  v_unlocked integer;
  v_claimed  integer;
  v_next     integer;
BEGIN
  IF p_interval IS NULL OR p_interval <= 0 THEN
    RAISE EXCEPTION 'interval invalide';
  END IF;

  -- Verrou sur la ligne profil : sérialise les ouvertures concurrentes
  SELECT COALESCE(total_qcm_perfect, 0) INTO v_perfect
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_unlocked := floor(v_perfect / p_interval);

  SELECT COUNT(*) INTO v_claimed
  FROM public.mastery_chest_claims
  WHERE user_id = p_user_id;

  IF v_unlocked <= v_claimed THEN
    RETURN NULL;  -- pas encore assez de QCM parfaits
  END IF;

  v_next := v_claimed + 1;

  -- Ligne "réservation" ; le contenu réel est complété par l'app
  INSERT INTO public.mastery_chest_claims (user_id, chest_number, tier_id, reward_type, reward_value)
  VALUES (p_user_id, v_next, 'pending', 'coins', 0);

  RETURN v_next;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_mastery_chest(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.claim_mastery_chest(uuid, integer) TO service_role;
