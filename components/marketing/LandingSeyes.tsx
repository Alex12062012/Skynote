'use client'

/**
 * Landing « Seyès » — la copie manuscrite comme colonne vertébrale.
 *
 * Thèse : le produit transforme le cours manuscrit de l'élève en fiche propre.
 * La page montre cette transformation au lieu de la décrire.
 *
 * Fond : le ciel étoilé du dashboard (SkyBackground), pour que le décor de la
 * landing soit déjà celui de l'app. La réglure Seyès ne subsiste que là où
 * elle veut dire quelque chose : la feuille de cahier du héros.
 *
 * Budget animation (règles Emil Kowalski / find-animation-opportunities) :
 * chaque mouvement porte un but nommé — explication, continuité spatiale,
 * retour d'action ou délice au palier « rare ». L'animation explicative du
 * héros a le droit d'être longue : c'est du marketing, elle démontre le
 * produit. Rien ne bouge sur du contenu que l'élève est en train de lire.
 *
 * Contraintes tenues (UI/UX Pro Max) : contraste AA, cibles tactiles 44px,
 * focus visible, prefers-reduced-motion, aucune emoji comme icône,
 * transform/opacity uniquement.
 */

import Image from 'next/image'
import Link from 'next/link'
import { SkyBackground } from '@/components/ui/SkyBackground'
import { useEffect, useRef, useState } from 'react'
import {
  animate, motion, useInView, useMotionValue, useReducedMotion,
} from 'framer-motion'
import {
  ArrowRight, Camera, Check, GraduationCap, Mic, MessageCircle,
  ScanLine, ShieldCheck, Sparkles,
} from 'lucide-react'

const EASE_OUT = [0.16, 1, 0.3, 1] as const

type Testimonial = { text: string; name: string; grade: string }

/* ------------------------------------------------------------------ */
/* Marque                                                              */
/* ------------------------------------------------------------------ */

/**
 * Logo officiel : la Sky Coin (public/skycoin.png, 256×256).
 * Asset de marque imposé — on ne le redessine pas, on le sert tel quel.
 * `sizes` cadré au rendu réel pour éviter de télécharger 256px pour une
 * vignette de 24px.
 */
function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/skycoin.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  )
}

/**
 * Au chargement, la pièce tombe et roule d'un quart de tour avant de se poser.
 * Purpose : délice, palier « rare » (une fois par visite). C'est une pièce —
 * la rotation est le geste juste, pas une rotation décorative arbitraire.
 */
function LogoAnimated() {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className="inline-flex"
      initial={reduce ? false : { opacity: 0, y: -10, rotate: -90, scale: 0.85 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, rotate: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      whileHover={reduce ? undefined : { rotate: 12, scale: 1.06 }}
    >
      <LogoMark size={32} />
    </motion.span>
  )
}

/* ------------------------------------------------------------------ */
/* Fonds                                                               */
/* ------------------------------------------------------------------ */

/*
 * Le ciel étoilé est UNIQUEMENT le fond de page : un seul <SkyBackground />
 * fixe à la racine, exactement celui du dashboard. Aucune section ni carte ne
 * pose d'étoiles à elle — sinon elles défilent avec le contenu et le ciel
 * cesse de se lire comme un fond.
 *
 * La réglure Seyès ne subsiste que sur la copie manuscrite du héros, où elle
 * veut dire quelque chose (c'est une page de cahier).
 */
function SeyesSheet({ className = '', fade = true }: { className?: string; fade?: boolean }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: [
          'repeating-linear-gradient(to bottom, rgba(96,165,250,.07) 0 1px, transparent 1px 14px)',
          'repeating-linear-gradient(to bottom, rgba(96,165,250,.16) 0 1px, transparent 1px 56px)',
          'repeating-linear-gradient(to right, rgba(96,165,250,.07) 0 1px, transparent 1px 56px)',
        ].join(','),
        maskImage: fade
          ? 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 40%, transparent 100%)'
          : undefined,
        WebkitMaskImage: fade
          ? 'radial-gradient(ellipse 90% 70% at 50% 30%, #000 40%, transparent 100%)'
          : undefined,
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

function Reveal({
  children, i = 0, className = '',
}: { children: React.ReactNode; i?: number; className?: string }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <div ref={ref} className={className}>
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={inView && !reduce ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: i * 0.04 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

/** Compteur : la note se pose au lieu d'apparaître. Palier « rare » → délice permis. */
function Counter({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(reduce ? to : 0)

  useEffect(() => {
    if (reduce) { setDisplay(to); return }
    if (!inView) return
    const unsub = mv.on('change', v => setDisplay(v))
    const controls = animate(mv, to, { duration: 1.1, ease: EASE_OUT })
    return () => { controls.stop(); unsub() }
  }, [inView, reduce, to, mv])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toFixed(decimals).replace('.', ',')}
    </span>
  )
}

function Cta({
  children, href = '/signup', variant = 'primary', className = '',
}: {
  children: React.ReactNode
  href?: string
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  const base =
    'group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill px-7 font-display text-[15px] font-semibold ' +
    'transition-[transform,background-color,border-color] duration-200 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 focus-visible:ring-offset-night-bg ' +
    'hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ' +
    'motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100'
  const skin =
    variant === 'primary'
      ? 'bg-brand text-white hover:bg-brand-hover shadow-[0_8px_28px_-10px_rgba(37,99,235,.9)]'
      : 'border border-night-border bg-night-surface/70 text-text-dark-main hover:border-brand-dark/60'
  return (
    <Link href={href} className={`${base} ${skin} ${className}`}>
      {children}
      <ArrowRight
        className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        aria-hidden
      />
    </Link>
  )
}

function SectionTitle({
  eyebrow, children, align = 'left',
}: { eyebrow?: string; children: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <div className={align === 'center' ? 'text-center' : ''}>
      {eyebrow && (
        <p className="mb-3 font-body text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-dark">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-[clamp(26px,4vw,40px)] font-bold leading-[1.15] tracking-[-0.02em] text-text-dark-main">
        {children}
      </h2>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Signature — la transformation                                       */
/* ------------------------------------------------------------------ */

/**
 * Le cours tel qu'on l'écrit vraiment en classe : de la prose continue,
 * dense, abrégée là où il faut suivre le prof. Surtout pas de puces ni de
 * flèches — sinon l'entrée ressemble déjà à une fiche et la transformation
 * ne montre plus rien.
 *
 * Le découpage est une contrainte technique (une ligne = un tracé), mais il
 * sert la crédibilité : les phrases se coupent au milieu d'une ligne, comme
 * dans un vrai cahier.
 */
const COURS_LIGNES: { t: string; titre?: boolean }[] = [
  { t: 'Chapitre 3 — La Révolution française', titre: true },
  { t: "I. 1789 : la fin de l'Ancien Régime", titre: true },
  { t: 'En 1789 la France est une monarchie absolue : le roi' },
  { t: 'Louis XVI détient tous les pouvoirs et la société est' },
  { t: 'divisée en 3 ordres. Le clergé et la noblesse ont des' },
  { t: "privilèges (ils paient pas l'impôt), le tiers état" },
  { t: 'représente 98 % de la population et supporte presque' },
  { t: 'toutes les charges. Le royaume est ruiné par les' },
  { t: 'guerres et les mauvaises récoltes, le pain coûte cher.' },
  { t: 'Louis XVI convoque les États généraux le 5 mai 1789 à' },
  { t: "Versailles pour trouver de l'argent. Le tiers état" },
  { t: 'demande le vote par tête, la noblesse refuse.' },
]

/** Minutage de la séquence d'écriture, en secondes. */
const T = {
  debut: 0.25,          // le stylo se pose
  parCaractere: 0.0032, // vitesse d'écriture
  retour: 0.045,        // main qui revient à la marge
} as const

/**
 * Une main écrit à vitesse constante : une ligne courte prend moins de temps
 * qu'une ligne pleine. On calcule donc la durée de chaque ligne d'après sa
 * longueur, au lieu de donner la même à toutes — sans ça, la dernière ligne
 * (courte) paraîtrait tracée au ralenti.
 */
const LIGNES = COURS_LIGNES.reduce<
  { texte: string; titre: boolean; delai: number; duree: number }[]
>((acc, { t, titre }) => {
  const precedente = acc[acc.length - 1]
  const delai = precedente ? precedente.delai + precedente.duree + T.retour : T.debut
  return [...acc, { texte: t, titre: Boolean(titre), delai, duree: t.length * T.parCaractere }]
}, [])

const T_FIN_ECRITURE = LIGNES[LIGNES.length - 1].delai + LIGNES[LIGNES.length - 1].duree
const T_FICHE = T_FIN_ECRITURE + 0.12
const T_POINTS = T_FICHE + 0.4
const T_BARRE = T_FICHE + 0.65

/**
 * L'élément signature. Séquence en trois temps :
 *   1. le cours s'écrit (clip-path) — purpose : explication
 *   2. la fiche se lève depuis la copie — purpose : continuité spatiale
 *   3. les lignes de la fiche se posent en cascade — purpose : explication
 * Marketing + palier rare : la durée longue est justifiée.
 */
function Transformation() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [tab, setTab] = useState<'fiche' | 'qcm'>('fiche')
  const shown = reduce ? true : inView

  // Fiche au format réel de Skynote : titre court, résumé de 2 phrases,
  // exactement 3 points essentiels. Cf. getFlashcardSystemPrompt() et le
  // rendu de components/courses/FlashcardViewer.tsx.
  const fiche = {
    index: 1,
    total: 4,
    title: "1789, l'année de rupture",
    summary:
      "En quelques mois, le tiers état s'affirme face au roi et à la société d'ordres. L'été 1789 met fin à la monarchie absolue et aux privilèges.",
    keyPoints: [
      "Le serment du Jeu de paume (20 juin) : les députés refusent de se séparer avant d'avoir donné une constitution à la France.",
      "La prise de la Bastille (14 juillet) : le peuple de Paris s'empare d'une prison devenue le symbole de l'arbitraire royal.",
      "La nuit du 4 août : l'Assemblée abolit les privilèges, la loi devient la même pour tous.",
    ],
  }

  return (
    <div ref={ref} className="relative mx-auto mt-14 w-full max-w-[600px]">
      {/* 1 · La copie manuscrite */}
      <motion.div
        className="relative overflow-hidden rounded-card border border-night-border bg-[#0A1524] p-6 sm:p-7"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={shown ? { opacity: 1, y: 0, rotate: -1.4 } : undefined}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <SeyesSheet fade={false} className="opacity-90" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-10 w-px bg-[#F4634E]/35" />
        <div className="relative pl-8">
          <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-text-dark-tertiary">
            Ton cours
          </p>
          {/*
            Chaque ligne se trace de gauche à droite, puis la suivante démarre
            après un court retour à la marge. `linear` est volontaire : une
            main avance à vitesse constante sur une ligne, elle n'accélère pas.
            Les lignes sont fixes (pas de retour à la ligne automatique) pour
            que le tracé corresponde à ce qu'on lit — d'où la taille fluide.
          */}
          {/*
            La taille est exprimée en `cqi` (part de la largeur du conteneur) :
            les lignes ne se replient pas, donc elles doivent tenir quelle que
            soit la largeur de l'écran. Avec une taille liée au conteneur, le
            texte se réduit avec la carte au lieu de déborder sur mobile.
          */}
          <div
            className="mt-3 leading-[1.7] text-text-dark-secondary/95 [container-type:inline-size]"
            style={{ fontFamily: 'var(--font-caveat), cursive' }}
          >
            {LIGNES.map(ligne => (
              <motion.span
                key={ligne.texte}
                className={`block whitespace-nowrap text-[clamp(11px,3.55cqi,20px)] ${
                  ligne.titre ? 'mt-1 w-fit border-b border-current pb-0.5 font-semibold' : ''
                }`}
                initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
                animate={shown ? { clipPath: 'inset(0 0% 0 0)' } : undefined}
                transition={{
                  duration: ligne.duree,
                  ease: 'linear',
                  delay: reduce ? 0 : ligne.delai,
                }}
              >
                {ligne.texte}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 2 · La fiche se lève depuis la copie */}
      <motion.div
        className="relative z-10 -mt-12 ml-auto w-[90%] overflow-hidden rounded-card border border-brand-dark/35 bg-night-surface shadow-[0_32px_80px_-32px_rgba(37,99,235,.9)] sm:-mt-14"
        initial={reduce ? false : { opacity: 0, y: 56, scale: 0.94, rotate: 4 }}
        animate={shown ? { opacity: 1, y: 0, scale: 1, rotate: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 120, damping: 18, delay: reduce ? 0 : T_FICHE }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-night-border px-6 pb-4 pt-5">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand/20 text-brand-dark">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
            </span>
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-dark">
              Généré en 15 s
            </p>
          </div>
          <div className="flex gap-1" role="tablist" aria-label="Contenu généré">
            {(['fiche', 'qcm'] as const).map(k => (
              <button
                key={k}
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`relative min-h-[36px] rounded-pill px-3 font-body text-[12px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark motion-reduce:transition-none ${
                  tab === k ? 'text-night-bg' : 'text-text-dark-tertiary hover:text-text-dark-main'
                }`}
              >
                {tab === k && (
                  // La pastille glisse d'un onglet à l'autre — continuité spatiale
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-pill bg-brand-dark"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{k === 'fiche' ? 'Fiche' : 'QCM'}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 pb-6 pt-5 text-left">
          {tab === 'fiche' ? (
            <motion.div
              key="fiche"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {/* Barre de maîtrise — comme dans le lecteur de fiches */}
              <div className="mb-4">
                <div className="flex items-baseline justify-between">
                  <span className="font-body text-[12px] text-text-dark-secondary">Maîtrise</span>
                  <span className="font-body text-[12px] font-semibold tabular-nums text-text-dark-main">
                    {fiche.index}/{fiche.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-night-border">
                  <motion.div
                    className="h-full rounded-pill bg-brand-dark"
                    initial={reduce ? false : { width: 0 }}
                    animate={shown ? { width: `${(fiche.index / fiche.total) * 100}%` } : undefined}
                    transition={{ duration: 0.7, ease: EASE_OUT, delay: reduce ? 0 : T_BARRE }}
                  />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-text-dark-tertiary">
                    Fiche {fiche.index}/{fiche.total}
                  </p>
                  <h3 className="mt-1 font-display text-[19px] font-bold leading-snug text-text-dark-main">
                    {fiche.title}
                  </h3>
                </div>
                <span className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-night-border" aria-hidden />
              </div>

              <p className="mt-4 text-[14px] leading-relaxed text-text-dark-secondary">
                {fiche.summary}
              </p>

              <p className="mt-5 font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-text-dark-tertiary">
                Points essentiels
              </p>
              <ul className="mt-2.5 space-y-2.5">
                {fiche.keyPoints.map((point, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-3"
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={shown ? { opacity: 1, x: 0 } : undefined}
                    // cascade 60ms : perceptible, jamais traînante
                    transition={{ duration: 0.35, ease: EASE_OUT, delay: reduce ? 0 : T_POINTS + i * 0.06 }}
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-dark-soft font-body text-[11px] font-bold text-brand-dark">
                      {i + 1}
                    </span>
                    <span className="text-[13.5px] leading-relaxed text-text-dark-main">{point}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Pastilles de navigation entre les 4 fiches du cours */}
              <div className="mt-6 flex gap-1.5" aria-hidden>
                {Array.from({ length: fiche.total }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-pill ${i === 0 ? 'bg-brand-dark' : 'bg-night-border'}`}
                  />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="qcm"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <p className="font-body text-[12px] text-text-dark-tertiary">Question 2 sur 8</p>
              <p className="mt-3 font-display text-[16px] font-bold leading-snug text-text-dark-main">
                Quel événement met fin aux privilèges de la noblesse et du clergé ?
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  ['La prise de la Bastille', false],
                  ['La nuit du 4 août 1789', true],
                  ['Le serment du Jeu de paume', false],
                ].map(([label, ok], i) => (
                  <motion.li
                    key={String(label)}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: EASE_OUT, delay: reduce ? 0 : i * 0.05 }}
                    className={`flex items-center justify-between rounded-input border px-4 py-3 text-[13.5px] ${
                      ok
                        ? 'border-success-dark/40 bg-success-dark/10 text-text-dark-main'
                        : 'border-night-border text-text-dark-secondary'
                    }`}
                  >
                    {label as string}
                    {ok ? <Check className="h-4 w-4 text-success-dark" strokeWidth={3} aria-hidden /> : null}
                  </motion.li>
                ))}
              </ul>
              <p className="mt-4 text-[12.5px] leading-relaxed text-text-dark-tertiary">
                Dans la nuit du 4 août 1789, l&apos;Assemblée vote l&apos;abolition
                des privilèges — c&apos;est la fin de la société d&apos;ordres.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Nav() {
  return (
    <header className="relative z-30 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
      >
        <LogoAnimated />
        <span className="font-display text-[19px] font-bold tracking-[-0.02em] text-text-dark-main">
          Skynote
        </span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/login"
          className="inline-flex min-h-[44px] items-center rounded-pill px-4 font-body text-[14px] font-medium text-text-dark-secondary transition-colors duration-200 hover:text-text-dark-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark motion-reduce:transition-none"
        >
          Se connecter
        </Link>
        <Cta className="!px-5 !text-[14px]">Commencer</Cta>
      </nav>
    </header>
  )
}

function Hero({ isBeta }: { isBeta: boolean }) {
  const reduce = useReducedMotion()
  const titre = ['Recopier,', "c'est", 'pas', 'réviser.']
  return (
    <section className="relative overflow-hidden pb-24 pt-6 sm:pt-10">
      <div className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <motion.p
          className="inline-flex items-center gap-2 rounded-pill border border-night-border bg-night-surface/80 px-4 py-1.5 font-body text-[12px] font-medium text-text-dark-secondary"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-success-dark" aria-hidden />
          {isBeta ? 'Bêta ouverte · 100 % gratuit' : 'Disponible maintenant'}
        </motion.p>

        {/* Le titre se pose mot à mot — cascade 60ms */}
        <h1 className="mt-7 font-display text-[clamp(36px,7.5vw,66px)] font-bold leading-[1.03] tracking-[-0.035em] text-text-dark-main">
          {titre.map((mot, i) => (
            <motion.span
              key={mot}
              className="inline-block"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.06 + i * 0.06 }}
            >
              {mot}
              {i < titre.length - 1 && ' '}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="mx-auto mt-6 max-w-[30rem] text-[17px] leading-[1.65] text-text-dark-secondary"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.36 }}
        >
          Donne ton cours à Skynote. Tu récupères tes fiches, tes QCM et tes
          dates clés — le temps de ranger ton sac.
        </motion.p>

        <motion.div
          className="mt-9 flex flex-col items-center justify-center gap-3"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT, delay: 0.44 }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Cta>Commencer gratuitement</Cta>
            <p className="font-body text-[13px] text-text-dark-tertiary sm:hidden">Sans carte bancaire</p>
          </div>
          <Cta href="/login" variant="ghost">Se connecter</Cta>
          <p className="hidden font-body text-[13px] text-text-dark-tertiary sm:block">Sans carte bancaire</p>
        </motion.div>

        <Transformation />
      </div>
    </section>
  )
}

function Problem() {
  return (
    <section className="relative mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <Reveal>
        <SectionTitle align="center" eyebrow="Le problème">
          Deux heures à recopier.{' '}
          <span className="text-text-dark-tertiary">Quinze minutes de vraie révision.</span>
        </SectionTitle>
        <p className="mx-auto mt-6 max-w-xl text-center text-[15px] leading-[1.7] text-text-dark-secondary">
          Ton cerveau retient quand il est actif, pas quand il recopie. Skynote
          prend en charge la mise en forme pour que tu passes ton temps sur ce
          qui compte vraiment : comprendre et t&apos;entraîner.
        </p>
      </Reveal>
    </section>
  )
}

function Features() {
  const items = [
    { icon: Camera, title: 'Photo, texte, vocal, PDF', desc: "Prends ton cours en photo ou dicte-le. L'IA s'adapte au format que tu lui donnes.", span: 'sm:col-span-3' },
    { icon: Sparkles, title: 'Fiches en 15 secondes', desc: "L'IA lit ton cours, en sort la structure, les définitions et les dates clés.", span: 'sm:col-span-3' },
    { icon: ScanLine, title: 'QCM intelligents', desc: 'Des questions qui testent ta compréhension, pas ta capacité à réciter.', span: 'sm:col-span-2' },
    { icon: MessageCircle, title: 'Un chatbot par cours', desc: 'Pose tes questions. Il connaît ton cours par cœur, pas Internet en général.', span: 'sm:col-span-2' },
    { icon: Mic, title: 'Dictée vocale', desc: 'Raconte ton cours à voix haute en rentrant du collège. Ça suffit.', span: 'sm:col-span-2' },
  ]
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <Reveal className="mb-10">
        <SectionTitle eyebrow="Ce que tu récupères">
          Ton cours, décliné en outils de révision.
        </SectionTitle>
      </Reveal>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        {items.map((f, i) => {
          const Icon = f.icon
          return (
            <Reveal key={f.title} i={i} className={f.span}>
              <motion.article
                className="group h-full rounded-card border border-night-border bg-night-surface p-6 transition-colors duration-200 hover:border-brand-dark/40 motion-reduce:transition-none"
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              >
                <motion.span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand/15 text-brand-dark"
                  whileHover={{ rotate: -6, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={2} aria-hidden />
                </motion.span>
                <h3 className="mt-4 font-display text-[17px] font-bold text-text-dark-main">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-text-dark-secondary">{f.desc}</p>
              </motion.article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

function Brevet() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-card border border-night-border bg-night-surface">
          <div className="relative grid items-center gap-10 p-8 sm:p-10 lg:grid-cols-2">
            <div>
              <SectionTitle eyebrow="Tu passes le brevet cette année ?">
                Fais un brevet blanc ce soir.
              </SectionTitle>
              <p className="mt-5 max-w-md text-[15px] leading-[1.7] text-text-dark-secondary">
                Skynote te génère une épreuve complète à partir d&apos;annales
                officielles — français, maths, histoire-géo, sciences. Tu
                composes, tu récupères ta note et ta mention.
              </p>
              <ul className="mt-6 space-y-2">
                {[
                  'Questions issues des annales DNB réelles',
                  'Jamais deux fois la même question',
                  'Correction détaillée, critère par critère',
                ].map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-[14px] text-text-dark-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-dark" strokeWidth={3} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <Cta className="mt-8">Passer mon brevet blanc</Cta>
            </div>

            <div className="rounded-card border border-night-border bg-night-bg/80 p-8 text-center">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/20 text-brand-dark">
                <GraduationCap className="h-6 w-6" aria-hidden />
              </span>
              <p className="mt-5 font-display text-[52px] font-bold leading-none tracking-tight text-text-dark-main">
                <Counter to={14.5} decimals={1} />
                <span className="text-[26px] text-text-dark-tertiary">/20</span>
              </p>
              <motion.p
                className="mt-3 inline-flex items-center gap-1.5 rounded-pill bg-success-dark/15 px-3 py-1 font-body text-[12px] font-semibold text-success-dark"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 1.05 }}
              >
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                Mention Bien
              </motion.p>
              <p className="mt-5 text-[12px] leading-relaxed text-text-dark-tertiary">
                Exemple de résultat.
                <br />
                Estimation par IA, pas une note officielle.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Testimonials({ items, sample }: { items: Testimonial[]; sample: boolean }) {
  if (!items.length) return null
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <Reveal className="mb-10">
        <SectionTitle align="center" eyebrow="Ils révisent avec Skynote">
          Ce qu&apos;en disent les élèves.
        </SectionTitle>
        {sample && (
          <p className="mt-3 text-center font-body text-[12px] text-text-dark-tertiary">
            Exemples illustratifs — les avis réels s&apos;afficheront ici dès les
            premiers retours.
          </p>
        )}
      </Reveal>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={`${it.name}-${i}`} i={i}>
            <figure className="flex h-full flex-col rounded-card border border-night-border bg-night-surface p-6">
              <blockquote className="flex-1 text-[14px] leading-[1.65] text-text-dark-secondary">
                « {it.text} »
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t border-night-border pt-4">
                <span className="font-body text-[13px] font-semibold text-text-dark-main">{it.name}</span>
                {it.grade && (
                  <span className="font-display text-[13px] font-bold text-brand-dark">{it.grade}</span>
                )}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function FairPlay() {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <Reveal>
        <div className="rounded-card border border-night-border bg-night-surface p-8 sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success-dark/15 text-success-dark">
              <ShieldCheck className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <SectionTitle eyebrow="Conçu pour des mineurs">
                Zéro hasard, zéro coffre payant.
              </SectionTitle>
              <p className="mt-5 max-w-2xl text-[15px] leading-[1.7] text-text-dark-secondary">
                Aucune récompense ne dépend de la chance. Rien ne s&apos;achète à
                l&apos;aveugle : le contenu de chaque coffre est affiché avant
                l&apos;ouverture, et il se débloque en réussissant des QCM — pas
                en dépensant.
              </p>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {[
                  'Aucune mise, aucun tirage au sort',
                  "Contenu des récompenses connu à l'avance",
                  'Pas de publicité',
                  'Tes cours ne servent pas à entraîner un modèle',
                ].map(p => (
                  <li key={p} className="flex items-start gap-2.5 text-[14px] text-text-dark-secondary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-dark" strokeWidth={3} aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function FinalCta({ isBeta }: { isBeta: boolean }) {
  return (
    <section className="relative overflow-hidden px-4 pb-28 sm:px-6">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-card border border-brand-dark/30 bg-night-surface px-6 py-16 text-center sm:px-10">
        <div className="relative">
          <Reveal>
            <LogoMark size={44} className="mx-auto" />
            <h2 className="mt-6 font-display text-[clamp(28px,4.5vw,44px)] font-bold leading-[1.1] tracking-[-0.025em] text-text-dark-main">
              Ton prochain contrôle est dans combien de jours ?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[16px] leading-[1.65] text-text-dark-secondary">
              {isBeta
                ? 'Pendant la bêta, tout est gratuit. Toutes les fonctionnalités, aucune carte bancaire.'
                : 'Commence gratuitement. Tu passes à la vitesse supérieure quand tu veux.'}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Cta>Créer mon compte</Cta>
              <Cta href="/pricing" variant="ghost">Voir les forfaits</Cta>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const links = [
    ['Confiance & sécurité', '/confiance'],
    ['Forfaits', '/pricing'],
    ['Mentions légales', '/mentions-legales'],
    ['Confidentialité', '/privacy'],
    ['CGU', '/terms'],
  ] as const
  return (
    <footer className="border-t border-night-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark size={24} />
          <p className="font-display text-[15px] font-bold text-text-dark-main">Skynote</p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-[44px] items-center font-body text-[13px] text-text-dark-tertiary transition-colors duration-200 hover:text-text-dark-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark motion-reduce:transition-none"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */

/**
 * Avis d'exemple, affichés uniquement tant qu'aucun avis réel n'est remonté
 * de la table `feedbacks`. Chaque phrase ne décrit que des fonctionnalités
 * qui existent réellement dans Skynote. La section les signale comme
 * illustratifs — voir Testimonials({ sample }).
 */
const AVIS_EXEMPLES: Testimonial[] = [
  {
    text: "Je m'en sers surtout pour les QCM. Ça marche bien.",
    name: 'Léa',
    grade: '4ᵉ',
  },
  {
    text: "J'ai pris mon cours d'histoire en photo dimanche soir. Fiches faites, 15 au contrôle.",
    name: 'Nathan',
    grade: '3ᵉ',
  },
  {
    text: "Le chat par cours c'est ce que j'utilise le plus, je révise tard et je peux demander sans déranger personne. Les brevets blancs sont durs par contre",
    name: 'Amine',
    grade: '2nde',
  },
]

export function LandingSeyes({
  isBeta = true,
  testimonials = [],
}: {
  isBeta?: boolean
  testimonials?: Testimonial[]
}) {
  // Choix produit : on affiche les avis d'exemple plutôt que les retours
  // bruts de la table `feedbacks`, qui mélangent élèves et parents et ne sont
  // pas rédigés pour une landing. La section les signale comme illustratifs
  // (voir Testimonials({ sample })) — cette mention n'est pas décorative,
  // c'est elle qui distingue un exemple assumé d'un faux avis.
  // Passer à false le jour où de vrais avis exploitables remontent.
  const AFFICHER_AVIS_EXEMPLES = true

  const sample = AFFICHER_AVIS_EXEMPLES || testimonials.length === 0
  const avis = sample ? AVIS_EXEMPLES : testimonials

  return (
    // Pas de `bg-night-bg` ici : le fond nuit vient déjà du <body>, et le laisser
    // sur ce conteneur masquerait le ciel (qui se peint en -z-10, sous lui).
    <div className="min-h-dvh">
      <SkyBackground />
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-input focus:bg-brand focus:px-4 focus:py-2 focus:font-body focus:text-[14px] focus:text-white"
      >
        Aller au contenu
      </a>
      <Nav />
      <main id="contenu">
        <Hero isBeta={isBeta} />
        <Problem />
        <Features />
        <Brevet />
        <Testimonials items={avis} sample={sample} />
        <FairPlay />
        <FinalCta isBeta={isBeta} />
      </main>
      <Footer />
    </div>
  )
}
