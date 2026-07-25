-- ============================================================
-- 031_chat_free_quota.sql
-- QUOTA CHATBOT GRATUIT — fin du paywall dur
-- ============================================================
-- Avant : le plan Free recevait une reponse "Le chatbot est
-- reserve aux abonnes Starter et Pro" — porte fermee, l'eleve ne
-- pouvait jamais essayer la fonctionnalite.
--
-- Apres : 5 questions par cours et par mois pour le plan Free.
-- Au-dela, message incitatif (pas un blocage sec). Les plans
-- Starter et Pro restent illimites (seuls les Novas s'appliquent).
--
-- Le compteur est par (utilisateur, cours, mois) : un eleve qui
-- travaille sur 3 cours dispose de 5 questions sur chacun.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_quota_usage (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  -- periode au format 'YYYY-MM' (mois calendaire)
  period      text NOT NULL,
  used        integer NOT NULL DEFAULT 0 CHECK (used >= 0),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, period)
);

CREATE INDEX IF NOT EXISTS chat_quota_usage_lookup_idx
  ON public.chat_quota_usage (user_id, course_id, period);

ALTER TABLE public.chat_quota_usage ENABLE ROW LEVEL SECURITY;

-- L'eleve peut lire sa consommation (affichage du compteur restant)…
DROP POLICY IF EXISTS "Users see own chat quota" ON public.chat_quota_usage;
CREATE POLICY "Users see own chat quota"
  ON public.chat_quota_usage FOR SELECT
  USING (auth.uid() = user_id);

-- …mais ne peut pas la modifier : l'increment passe par le RPC ci-dessous.

-- ─── Consommation atomique d'une question ────────────────────
-- Incremente et renvoie le nombre de questions utilisees APRES
-- l'appel. Le UPSERT rend l'operation sure en cas d'appels
-- concurrents (double-clic, plusieurs onglets).
CREATE OR REPLACE FUNCTION public.consume_chat_question(
  p_user_id   uuid,
  p_course_id uuid,
  p_period    text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_used integer;
BEGIN
  INSERT INTO public.chat_quota_usage (user_id, course_id, period, used, updated_at)
  VALUES (p_user_id, p_course_id, p_period, 1, now())
  ON CONFLICT (user_id, course_id, period)
  DO UPDATE SET used = public.chat_quota_usage.used + 1, updated_at = now()
  RETURNING used INTO v_used;

  RETURN v_used;
END;
$$;

-- Annulation (remboursement) si l'appel IA echoue apres coup.
CREATE OR REPLACE FUNCTION public.refund_chat_question(
  p_user_id   uuid,
  p_course_id uuid,
  p_period    text
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.chat_quota_usage
  SET used = greatest(0, used - 1), updated_at = now()
  WHERE user_id = p_user_id AND course_id = p_course_id AND period = p_period;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_chat_question(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refund_chat_question(uuid, uuid, text)  FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.consume_chat_question(uuid, uuid, text) TO service_role;
GRANT  EXECUTE ON FUNCTION public.refund_chat_question(uuid, uuid, text)  TO service_role;
