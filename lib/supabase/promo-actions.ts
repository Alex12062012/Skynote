'use server'

/**
 * Codes promo — couche serveur.
 *
 * Ces codes valent de l'argent réel. Trois principes tenus ici :
 *
 *  1. Le client n'envoie qu'une chaîne. Il ne choisit ni le bénéficiaire, ni
 *     le montant, ni la durée : l'identifiant vient de la session serveur, le
 *     reste est lu en base par la fonction SQL.
 *
 *  2. Le devinage par force brute est bloqué avant même de toucher à la table
 *     des codes, par le rate limiter atomique déjà en place.
 *
 *  3. Les messages d'erreur ne permettent pas de distinguer un code
 *     inexistant d'un code épuisé ou expiré — sinon un attaquant pourrait
 *     cartographier les codes valides à coups de tentatives.
 */

import { createClient } from './server'
import { createAdminClient } from './admin'

/** Tentatives d'échange autorisées par personne et par fenêtre. */
const MAX_TENTATIVES = 5
const FENETRE_SECONDES = 15 * 60

/** Codes admissibles : 4 à 32 caractères, lettres, chiffres et tirets. */
const FORMAT_CODE = /^[A-Z0-9-]{4,32}$/

export type ResultatEchange =
  | { ok: true; bonusNovas: number; starterMonth: number; proMonth: number }
  | { ok: false; message: string }

export async function redeemPromoCode(codeSaisi: string): Promise<ResultatEchange> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Tu dois être connecté pour utiliser un code.' }

  const code = (codeSaisi ?? '').trim().toUpperCase()

  // Filtre de forme avant toute requête : évite de consommer une tentative de
  // rate limit — et une requête SQL — pour une saisie qui ne peut pas exister.
  if (!FORMAT_CODE.test(code)) {
    return { ok: false, message: 'Ce code n’est pas valide.' }
  }

  const admin = createAdminClient()

  // Anti-spam AVANT la lecture des codes. Le compteur est incrémenté même en
  // cas d'échec : c'est justement l'essai raté qu'il faut limiter.
  const { data: limite, error: erreurLimite } = await admin.rpc('check_and_increment_rate_limit', {
    p_user_id: user.id,
    p_endpoint: 'promo_redeem',
    p_limit: MAX_TENTATIVES,
    p_window_seconds: FENETRE_SECONDES,
  })

  if (erreurLimite) {
    // En cas de panne du limiteur, on refuse plutôt que d'ouvrir la porte.
    console.error('[promo] rate limiter indisponible:', erreurLimite)
    return { ok: false, message: 'Service momentanément indisponible. Réessaie dans un instant.' }
  }

  if (limite && (limite as any).allowed === false) {
    return {
      ok: false,
      message: 'Trop de tentatives. Réessaie dans une quinzaine de minutes.',
    }
  }

  const { data, error } = await admin.rpc('redeem_promo_code', {
    p_user_id: user.id,
    p_code: code,
  })

  if (error) {
    console.error('[promo] echec redeem_promo_code:', error)
    return { ok: false, message: 'Impossible d’appliquer ce code pour le moment.' }
  }

  const r = data as {
    ok: boolean
    raison?: string
    bonus_novas?: number
    starter_month?: number
    pro_month?: number
  }

  if (!r?.ok) {
    // « invalide » et « epuise » donnent volontairement le même message :
    // les distinguer révélerait quels codes existent.
    const message =
      r?.raison === 'deja_utilise'
        ? 'Tu as déjà utilisé ce code.'
        : 'Ce code n’est pas valide ou n’est plus disponible.'
    return { ok: false, message }
  }

  return {
    ok: true,
    bonusNovas: r.bonus_novas ?? 0,
    starterMonth: r.starter_month ?? 0,
    proMonth: r.pro_month ?? 0,
  }
}
