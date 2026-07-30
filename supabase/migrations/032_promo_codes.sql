-- ═══════════════════════════════════════════════════════════════════════════
-- Codes promo
-- ═══════════════════════════════════════════════════════════════════════════
--
-- Un code promo accorde, à l'inscription ou depuis le compte :
--   • des Novas en plus des 600 offerts,
--   • N mois de plan Starter,
--   • N mois de plan Pro.
-- Il est limité à un nombre d'utilisations, et à une seule par personne.
--
-- Ces codes valent de l'argent réel. Le modèle de menace retenu :
--
--  1. Un client ne doit JAMAIS pouvoir lire la table des codes — sinon il
--     lui suffit de les recopier. RLS activée sans aucune policy : même un
--     jeton authentifié valide ne voit rien. Seul service_role accède.
--
--  2. Un client ne doit jamais pouvoir s'accorder quoi que ce soit. Tout
--     passe par redeem_promo_code(), SECURITY DEFINER, dont l'exécution est
--     révoquée pour anon et authenticated. Le trigger
--     protect_sensitive_profile_columns (migration 027) interdit de toute
--     façon d'écrire plan / plan_expires_at hors service_role.
--
--  3. Deux requêtes simultanées ne doivent pas pouvoir consommer la même
--     dernière utilisation. La ligne du code est verrouillée en FOR UPDATE
--     avant toute vérification : le second appelant attend, puis relit un
--     compteur déjà incrémenté et se voit refusé.
--
--  4. Une même personne ne doit pas pouvoir utiliser un code deux fois.
--     Contrainte UNIQUE (code_id, user_id) : même en cas de course, la
--     seconde insertion échoue au niveau de la base, pas du code applicatif.
--
--  5. Le devinage par force brute est traité côté application par le
--     rate limiting existant (check_and_increment_rate_limit), et ici par
--     l'absence de toute distinction observable entre « code inexistant »
--     et « code épuisé » — les deux renvoient la même erreur.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Table des codes ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.promo_codes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Toujours stocké en majuscules sans espaces : la comparaison à la saisie
  -- est donc exacte, sans ILIKE (qui empêcherait d'utiliser l'index unique).
  code          text        NOT NULL UNIQUE
                            CHECK (code = upper(btrim(code)) AND length(code) BETWEEN 4 AND 32),
  label         text,                    -- mémo interne : « partenariat collège X »
  bonus_novas   integer     NOT NULL DEFAULT 0  CHECK (bonus_novas   BETWEEN 0 AND 100000),
  starter_month integer     NOT NULL DEFAULT 0  CHECK (starter_month BETWEEN 0 AND 24),
  pro_month     integer     NOT NULL DEFAULT 0  CHECK (pro_month     BETWEEN 0 AND 24),
  max_uses      integer     NOT NULL            CHECK (max_uses      BETWEEN 1 AND 100000),
  uses_count    integer     NOT NULL DEFAULT 0  CHECK (uses_count >= 0),
  expires_at    timestamptz,
  active        boolean     NOT NULL DEFAULT true,
  created_by    uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),

  -- Un code qui n'accorde rien n'a pas de sens et masquerait une erreur de saisie.
  CONSTRAINT promo_codes_accorde_quelque_chose
    CHECK (bonus_novas > 0 OR starter_month > 0 OR pro_month > 0),
  -- Le compteur ne peut jamais dépasser le plafond, même si du code
  -- applicatif se trompait.
  CONSTRAINT promo_codes_uses_sous_plafond CHECK (uses_count <= max_uses)
);

-- ─── Journal des utilisations ──────────────────────────────────────────────
-- Sert à la fois de garde-fou (UNIQUE) et de piste d'audit : qui a utilisé
-- quoi, quand, et ce qui a réellement été accordé au moment de l'échange.

CREATE TABLE IF NOT EXISTS public.promo_code_redemptions (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id           uuid        NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  user_id           uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_novas     integer     NOT NULL DEFAULT 0,
  granted_starter   integer     NOT NULL DEFAULT 0,
  granted_pro       integer     NOT NULL DEFAULT 0,
  redeemed_at       timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT promo_redemption_unique_par_personne UNIQUE (code_id, user_id)
);

CREATE INDEX IF NOT EXISTS promo_redemptions_user_idx ON public.promo_code_redemptions (user_id);

-- ─── RLS : aucune policy, donc aucun accès client ──────────────────────────
-- Activer RLS sans policy = tout est refusé pour anon et authenticated.
-- service_role contourne RLS par conception. C'est volontaire : la liste des
-- codes ne doit jamais transiter vers un navigateur.

ALTER TABLE public.promo_codes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_code_redemptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.promo_codes            FROM anon, authenticated;
REVOKE ALL ON public.promo_code_redemptions FROM anon, authenticated;

-- La fonction redeem_promo_code est definie dans la migration 033 :
-- elle depend du drapeau app.octroi_de_confiance introduit la-bas.
