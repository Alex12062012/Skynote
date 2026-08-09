/**
 * QUOTA CHATBOT — logique pure, testable sans base de données.
 *
 * Le plan Free n'est plus bloqué par un paywall dur : il dispose de
 * FREE_CHAT_QUESTIONS_PER_COURSE_PER_MONTH questions par cours et par mois.
 * Au-delà, on n'affiche pas une porte fermée mais une invitation à passer
 * Starter — l'élève a pu essayer la fonctionnalité et sait ce qu'il gagne.
 */

/** Questions offertes au plan Free, par cours et par mois. */
export const FREE_CHAT_QUESTIONS_PER_COURSE_PER_MONTH = 5

/** Valeur sentinelle : pas de quota (Starter / Pro / mode beta). */
export const CHAT_QUOTA_UNLIMITED = -1

export interface ChatQuota {
  /** true si un quota s'applique (plan Free) */
  limited: boolean
  /** questions autorisées sur la période, ou -1 si illimité */
  limit: number
  /** questions déjà posées sur ce cours ce mois-ci */
  used: number
  /** questions restantes, ou -1 si illimité */
  remaining: number
  /** l'élève peut-il poser une question maintenant ? */
  allowed: boolean
}

/** Période de comptage : mois calendaire, au format 'YYYY-MM' (UTC). */
export function chatQuotaPeriod(date: Date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** État du quota à partir de la limite du plan et de la consommation. */
export function computeChatQuota(limitPerMonth: number, used: number): ChatQuota {
  const safeUsed = Math.max(0, Math.trunc(used))

  if (limitPerMonth < 0) {
    return {
      limited: false,
      limit: CHAT_QUOTA_UNLIMITED,
      used: safeUsed,
      remaining: CHAT_QUOTA_UNLIMITED,
      allowed: true,
    }
  }

  const remaining = Math.max(0, limitPerMonth - safeUsed)
  return {
    limited: true,
    limit: limitPerMonth,
    used: safeUsed,
    remaining,
    allowed: remaining > 0,
  }
}

/**
 * Message affiché quand le quota gratuit est épuisé.
 * Ton volontairement incitatif : on rappelle ce que l'élève a déjà utilisé et
 * ce que débloque Starter, sans fermer la porte du reste de l'app.
 */
export function quotaExhaustedMessage(limit: number): string {
  return [
    `Tu as utilisé tes ${limit} questions gratuites sur ce cours ce mois-ci.`,
    'Elles se rechargent le 1er du mois prochain — et tu en as 5 autres sur chacun de tes autres cours.',
    'Avec Starter, le chat devient illimité sur tous tes cours : tu peux creuser un chapitre autant que nécessaire.',
  ].join(' ')
}
