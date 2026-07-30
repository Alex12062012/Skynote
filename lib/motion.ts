/**
 * Système de mouvement — source unique de vérité.
 *
 * Constat avant écriture de ce fichier : 11 courbes d'easing différentes et
 * 6 durées codées en dur, réparties sur 96 fichiers. Chaque composant avait
 * son propre rythme, donc rien ne semblait appartenir au même produit.
 *
 * Règles retenues (philosophie Emil Kowalski) :
 *  — une entrée décélère (ease out), une sortie accélère (ease in) ;
 *  — une sortie dure ~65 % d'une entrée : partir doit sembler plus rapide
 *    qu'arriver, sinon l'interface traîne ;
 *  — ce qui a une masse (pièce, bouton pressé, carte) utilise un ressort,
 *    pas une courbe ;
 *  — au-delà de 300 ms, une micro-interaction est perçue comme lente. Seul
 *    ce qui est explicatif ou rare (démo, récompense) dépasse ce seuil.
 *
 * Les mêmes valeurs existent en CSS (`--ease-*`, `--dur-*` dans globals.css)
 * pour les animations qui ne passent pas par Framer Motion.
 */

import type { Transition, Variants } from 'framer-motion'

/* ------------------------------------------------------------------ */
/* Courbes                                                             */
/* ------------------------------------------------------------------ */

export const EASE = {
  /** Entrées, révélations, tout ce qui arrive. Décélération franche. */
  out: [0.16, 1, 0.3, 1],
  /** Sorties, fermetures. Accélère puis disparaît. */
  in: [0.7, 0, 0.84, 0],
  /** Déplacement d'un point A à un point B qui reste visible. */
  inOut: [0.65, 0, 0.35, 1],
  /** Léger dépassement, pour le CSS qui ne peut pas faire de ressort. */
  overshoot: [0.34, 1.4, 0.64, 1],
} as const

/* ------------------------------------------------------------------ */
/* Durées (secondes)                                                   */
/* ------------------------------------------------------------------ */

export const DUR = {
  /** Retour de pression, changement de couleur. Sous le seuil de perception. */
  instant: 0.1,
  /** Survol, focus, petites bascules. */
  fast: 0.16,
  /** Défaut pour la majorité des transitions d'interface. */
  base: 0.22,
  /** Panneaux, accordéons, changements de contenu. */
  slow: 0.32,
  /** Modales, tiroirs. Le plafond pour de l'interface. */
  deliberate: 0.45,
} as const

/** Une sortie doit sembler plus rapide qu'une entrée. */
export const exitDur = (enter: number) => Math.round(enter * 0.65 * 100) / 100

/* ------------------------------------------------------------------ */
/* Ressorts — pour ce qui a une masse                                  */
/* ------------------------------------------------------------------ */

export const SPRING = {
  /** Bouton ou carte enfoncée : raide, sans rebond visible. */
  press: { type: 'spring', stiffness: 500, damping: 32, mass: 0.6 },
  /** Apparition d'un élément qui « surgit » : badge, pastille, toast. */
  pop: { type: 'spring', stiffness: 380, damping: 22 },
  /** Déplacement ample et calme : carte qui se repositionne. */
  gentle: { type: 'spring', stiffness: 180, damping: 24 },
  /** Pièce qui tombe ou vole : un peu de masse, un rebond assumé. */
  coin: { type: 'spring', stiffness: 260, damping: 17, mass: 0.9 },
} satisfies Record<string, Transition>

/* ------------------------------------------------------------------ */
/* Transitions prêtes à l'emploi                                       */
/* ------------------------------------------------------------------ */

export const enter = (duration: number = DUR.base): Transition => ({
  duration,
  ease: EASE.out,
})

export const leave = (duration: number = DUR.base): Transition => ({
  duration: exitDur(duration),
  ease: EASE.in,
})

/* ------------------------------------------------------------------ */
/* Variantes communes                                                  */
/* ------------------------------------------------------------------ */

/** Apparition depuis le bas — le motif le plus courant du site. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: enter(DUR.slow) },
  exit: { opacity: 0, y: 8, transition: leave(DUR.slow) },
}

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: enter(DUR.base) },
  exit: { opacity: 0, transition: leave(DUR.base) },
}

/**
 * Conteneur qui fait entrer ses enfants en cascade.
 * 45 ms : perceptible comme une vague, jamais comme une attente. Au-delà de
 * ~8 éléments la cascade devient plus longue que patiente — plafonnée côté
 * appelant en réduisant le pas.
 */
export const stagger = (step = 0.045, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren } },
})

/* ------------------------------------------------------------------ */
/* Interactions                                                        */
/* ------------------------------------------------------------------ */

/**
 * Retour tactile standard. À étaler sur tout élément cliquable qui n'est pas
 * un lien de navigation pure. Le `whileTap` doit rester perceptible sur
 * mobile, d'où un enfoncement net plutôt qu'un frémissement.
 */
export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97, y: 0 },
  transition: SPRING.press,
} as const

/** Variante sans déplacement vertical, pour les éléments déjà en mouvement. */
export const pressableFlat = {
  whileTap: { scale: 0.96 },
  transition: SPRING.press,
} as const
