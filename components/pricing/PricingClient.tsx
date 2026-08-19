'use client'

/**
 * Page forfaits.
 *
 * Structure imposée par le pattern « Pricing Page + CTA » (ui-ux-pro-max) :
 * accroche → cartes de prix → tableau comparatif → FAQ → CTA final. Les deux
 * publics sont servis : qui a déjà choisi tranche sur les cartes, qui hésite
 * descend au tableau.
 *
 * Direction artistique alignée sur la landing : ciel étoilé, fond night,
 * une seule famille de teintes. L'ancienne version empilait six palettes sans
 * rapport (violet, indigo, emerald, slate, yellow) : le plan recommandé se
 * signale par la couleur de marque, pas par une teinte inventée par forfait.
 *
 * On n'annonce PAS d'équivalence en nombre de cours. Deux raisons, mesurées :
 * les Novas sont une réserve partagée (26 % de la consommation réelle part
 * dans le chatbot, les QCM regénérés et la lecture de photos), donc un
 * « ~16 cours » serait faux d'un quart ; et l'élève moyen dépense 362 ✦ au
 * total, moins que la dotation gratuite — promettre 16 cours par mois ferait
 * passer le payant pour surdimensionné. La vraie différence entre les
 * forfaits est le renouvellement : une dotation unique contre une recharge
 * mensuelle.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Minus, ArrowLeft, ArrowRight, Settings, Calendar } from 'lucide-react'
import { SkyBackground } from '@/components/ui/SkyBackground'
import { cn } from '@/lib/utils'
import { fadeUp, stagger, SPRING, EASE, DUR } from '@/lib/motion'
import { NOVA_COST_COURSE, NOVA_COST_CHAT, NOVA_COST_QCM_SINGLE, NOVA_COST_OCR } from '@/lib/supabase/nova-constants'

type Billing = 'monthly' | 'yearly'

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    baseline: 'Pour essayer',
    novas: 600,
    recurrent: false,
    price: { monthly: 0, yearly: 0 },
    yearlyTotal: 0,
    /** Uniquement ce qui distingue ce forfait des autres. */
    differences: [
      'Brevet blanc sans la note ni la mention',
      'Chatbot limité à 5 questions par mois et par cours',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    baseline: 'Pour réviser toute l\'année',
    novas: 2000,
    recurrent: true,
    popular: true,
    price: { monthly: 4.90, yearly: 3.90 },
    yearlyTotal: 46.80,
    differences: [
      'Brevet blanc avec note et mention',
      'Chatbot illimité sur chaque cours',
      'Dictée vocale',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    baseline: 'Pour tout réviser sans compter',
    novas: 4000,
    recurrent: true,
    price: { monthly: 6.90, yearly: 5.90 },
    yearlyTotal: 70.80,
    differences: [
      'Brevets blancs illimités',
      'Chatbot illimité sur chaque cours',
      'Dictée vocale',
      'Support prioritaire',
    ],
  },
] as const

/** Ce que tout le monde a — dit une seule fois, au lieu de trois. */
const COMMUN = [
  'Fiches générées par l\'IA',
  'QCM automatiques',
  'Import photo, PDF, texte',
  'Sky Coins, objectifs et boutique',
]

/** Le tableau ne contient que des lignes qui varient d'un forfait à l'autre. */
const COMPARATIF: { critere: string; free: string; starter: string; pro: string }[] = [
  { critere: "Novas à l'inscription", free: '600 ✦',    starter: '600 ✦',   pro: '600 ✦' },
  { critere: 'Recharge mensuelle',    free: '—',        starter: '2 000 ✦', pro: '4 000 ✦' },
  { critere: 'Brevet blanc',        free: 'Sans note',                  starter: '1 noté',                     pro: 'Illimités' },
  { critere: 'Chatbot par cours',   free: '5 questions / mois',         starter: 'Illimité',                   pro: 'Illimité' },
  { critere: 'Dictée vocale',       free: '—',                          starter: 'Oui',                        pro: 'Oui' },
  { critere: 'Support',             free: 'Standard',                   starter: 'Standard',                   pro: 'Prioritaire' },
]

interface PricingClientProps {
  currentPlan: string
  planExpiresAt: string | null
  hasStripeSubscription: boolean
  isLoggedIn: boolean
}

/*
 * Le ciel étoilé est le fond de page et rien d'autre : un seul
 * <SkyBackground /> fixe à la racine, celui du dashboard. Les sections et les
 * cartes ne posent pas d'étoiles à elles — elles défileraient avec le contenu.
 */

export function PricingClient({ currentPlan, planExpiresAt, hasStripeSubscription, isLoggedIn }: PricingClientProps) {
  const router = useRouter()
  const [billing, setBilling] = useState<Billing>('monthly')
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const isPaid = currentPlan === 'starter' || currentPlan === 'pro'

  async function handleCheckout(planId: string) {
    setLoadingPlan(planId)
    setCheckoutError(null)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, billing }),
      })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
      // Changement de plan sur un abonnement déjà actif : pas de redirection
      // Stripe, on rafraîchit direct pour que le nouveau plan s'affiche partout
      // (widget Nova compris) sans attendre le cache de 30s du dashboard.
      if (data.updated) { router.refresh(); setLoadingPlan(null); return }
      // Ni url ni updated : le serveur a répondu une erreur (402/500/...) —
      // avant, ce cas retombait en silence sans que l'utilisateur sache pourquoi.
      setCheckoutError(data.error ?? "Impossible de lancer le paiement. Réessaie dans un instant.")
    } catch {
      setCheckoutError("Impossible de contacter le serveur de paiement. Vérifie ta connexion et réessaie.")
    }
    setLoadingPlan(null)
  }

  async function handleManageSubscription() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) { window.location.href = data.url; return }
    } catch { /* idem */ }
    setPortalLoading(false)
  }

  /** Économie réelle sur l'année, calculée et non annoncée au doigt mouillé. */
  const economie = (p: typeof PLANS[number]) =>
    p.price.monthly === 0 ? 0 : Math.round((p.price.monthly * 12 - p.yearlyTotal) * 100) / 100

  const remiseMax = Math.max(
    ...PLANS.filter(p => p.price.monthly > 0)
      .map(p => Math.round((1 - p.price.yearly / p.price.monthly) * 100))
  )

  return (
    // Pas de fond sur ce conteneur : il vient du <body>, sinon il masquerait le
    // ciel (peint en -z-10, sous lui).
    <div className="min-h-dvh">
      <SkyBackground />
      <div className="relative overflow-hidden px-4 pt-10">
        <div className="relative mx-auto max-w-5xl">
          <Link
            href={isLoggedIn ? '/dashboard' : '/'}
            className="inline-flex min-h-[44px] items-center gap-2 font-body text-[14px] text-text-secondary transition-colors hover:text-text-main dark:text-text-dark-secondary dark:hover:text-text-dark-main"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden /> Retour
          </Link>

          <div className="mb-10 mt-6 text-center">
            <h1 className="font-display text-[clamp(28px,4.5vw,42px)] font-bold leading-[1.1] tracking-[-0.025em] text-text-main dark:text-text-dark-main">
              {isPaid ? 'Ton abonnement' : 'Un forfait, pas une usine à gaz'}
            </h1>
            <p className="mx-auto mt-4 max-w-lg font-body text-[15px] leading-relaxed text-text-secondary dark:text-text-dark-secondary">
              {isPaid
                ? 'Gère ton abonnement et ta facturation.'
                : "Chaque forfait donne les mêmes outils. Ce qui change, c'est de quoi les alimenter : une dotation unique, ou une recharge tous les mois."}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-16">
        {/* Abonnement en cours */}
        {isPaid && (
          <div className="mb-8 rounded-card border border-brand/20 bg-brand-soft p-6 dark:border-brand-dark/20 dark:bg-brand-dark-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-[18px] font-bold text-text-main dark:text-text-dark-main">
                  Plan {currentPlan === 'pro' ? 'Pro' : 'Starter'}
                </p>
                {planExpiresAt && (
                  <p className="mt-0.5 flex items-center gap-1.5 font-body text-[13px] text-text-secondary dark:text-text-dark-secondary">
                    <Calendar className="h-3.5 w-3.5" aria-hidden />
                    Renouvellement le {new Date(planExpiresAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              {hasStripeSubscription && (
                <button
                  onClick={handleManageSubscription}
                  disabled={portalLoading}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-input border border-sky-border bg-sky-surface px-5 font-body text-[14px] font-medium text-text-main transition-colors hover:bg-sky-cloud disabled:opacity-50 dark:border-night-border dark:bg-night-surface dark:text-text-dark-main dark:hover:bg-night-border"
                >
                  <Settings className="h-4 w-4" aria-hidden />
                  {portalLoading ? 'Chargement…' : 'Gérer mon abonnement'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Ce que tout le monde a — dit une fois, pas trois */}
        {!isPaid && (
          <div className="mb-8 rounded-card border border-sky-border bg-sky-surface p-5 dark:border-night-border dark:bg-night-surface">
            <p className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-brand dark:text-brand-dark">
              Dans tous les forfaits, y compris le gratuit
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {COMMUN.map(f => (
                <li key={f} className="flex items-start gap-2.5 font-body text-[14px] text-text-main dark:text-text-dark-main">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success dark:text-success-dark" strokeWidth={3} aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mensuel / annuel */}
        {!isPaid && (
          <div className="mb-8 flex justify-center">
            <div
              role="tablist"
              aria-label="Périodicité de facturation"
              className="inline-flex items-center gap-1 rounded-pill border border-sky-border bg-sky-surface p-1 dark:border-night-border dark:bg-night-surface"
            >
              {(['monthly', 'yearly'] as Billing[]).map(b => (
                <button
                  key={b}
                  role="tab"
                  aria-selected={billing === b}
                  onClick={() => setBilling(b)}
                  className={cn(
                    'relative inline-flex min-h-[40px] items-center gap-2 rounded-pill px-4 font-body text-[14px] font-medium',
                    'transition-colors [transition-duration:var(--dur-fast)]',
                    billing === b ? 'text-white dark:text-night-bg' : 'text-text-secondary dark:text-text-dark-secondary'
                  )}
                >
                  {billing === b && (
                    <motion.span
                      layoutId="pricing-billing-pill"
                      className="absolute inset-0 rounded-pill bg-brand dark:bg-brand-dark"
                      transition={SPRING.gentle}
                    />
                  )}
                  <span className="relative">{b === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
                  {b === 'yearly' && (
                    <span
                      className={cn(
                        'relative rounded-pill px-2 py-0.5 text-[11px] font-bold',
                        billing === 'yearly'
                          ? 'bg-white/20 text-white dark:bg-night-bg/20 dark:text-night-bg'
                          : 'bg-success-soft text-success dark:bg-success-dark/15 dark:text-success-dark'
                      )}
                    >
                      {/* Calculé : l'ancienne page annonçait −15 % alors que Starter est à −20 %. */}
                      jusqu&apos;à −{remiseMax}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {checkoutError && (
          <div className="mb-6 rounded-card border border-error/30 bg-error/10 px-4 py-3 font-body text-[13.5px] text-error">
            {checkoutError}
          </div>
        )}

        {/* Cartes */}
        <motion.div
          className="grid gap-4 lg:grid-cols-3"
          variants={stagger(0.06)}
          initial="hidden"
          animate="show"
        >
          {PLANS.map(plan => {
            const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly
            const isCurrentPlan = plan.id === currentPlan
            const isLoading = loadingPlan === plan.id
            const isDowngrade = (currentPlan === 'pro' && plan.id === 'starter') || (isPaid && plan.id === 'free')
            const misEnAvant = 'popular' in plan && plan.popular && !isPaid

            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                className={cn(
                  'relative flex flex-col rounded-card border bg-sky-surface p-6 dark:bg-night-surface',
                  isCurrentPlan
                    ? 'border-success/50 dark:border-success-dark/50'
                    : misEnAvant
                      ? 'border-brand shadow-[0_20px_60px_-30px_rgba(37,99,235,.8)] dark:border-brand-dark'
                      : 'border-sky-border dark:border-night-border'
                )}
              >
                {(misEnAvant || isCurrentPlan) && (
                  <span
                    className={cn(
                      'absolute -top-3 left-6 rounded-pill px-3 py-1 font-body text-[11px] font-bold',
                      isCurrentPlan
                        ? 'bg-success text-white dark:bg-success-dark dark:text-night-bg'
                        : 'bg-brand text-white dark:bg-brand-dark dark:text-night-bg'
                    )}
                  >
                    {isCurrentPlan ? 'Ton forfait' : 'Le plus choisi'}
                  </span>
                )}

                <p className="font-display text-[18px] font-bold text-text-main dark:text-text-dark-main">
                  {plan.name}
                </p>
                <p className="mt-0.5 font-body text-[13px] text-text-secondary dark:text-text-dark-secondary">
                  {plan.baseline}
                </p>

                {/*
                  On affiche la dotation, pas un nombre de cours.
                  Les Novas sont une reserve partagee : le chatbot, les QCM
                  regeneres et la lecture de photos y puisent aussi — 26 % de
                  la consommation reelle. Annoncer « ~16 cours » serait donc
                  faux d'un quart, et surdimensionne : l'eleve moyen depense
                  362 ✦ au total, moins que la dotation gratuite. La vraie
                  difference entre les forfaits est le renouvellement.
                */}
                <div className="mt-5">
                  <p className="font-display text-[38px] font-bold leading-none tabular-nums text-text-main dark:text-text-dark-main">
                    {plan.novas.toLocaleString('fr-FR')} <span className="text-[26px]">✦</span>
                  </p>
                  <p className="mt-1 font-body text-[13px] font-semibold text-text-main dark:text-text-dark-main">
                    {plan.recurrent ? 'rechargés chaque mois' : 'offerts une seule fois'}
                  </p>
                  <p className="mt-0.5 font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
                    de quoi {plan.recurrent ? 'suivre toutes tes matières' : 'tester sur quelques cours'}
                  </p>
                </div>

                <div className="mt-5 border-t border-sky-border pt-4 dark:border-night-border">
                  {price === 0 ? (
                    <p className="font-display text-[24px] font-bold text-text-main dark:text-text-dark-main">Gratuit</p>
                  ) : (
                    <>
                      <p className="flex items-baseline gap-1">
                        <span className="font-display text-[24px] font-bold text-text-main dark:text-text-dark-main">
                          {price.toFixed(2).replace('.', ',')} €
                        </span>
                        <span className="font-body text-[13px] text-text-tertiary">/ mois</span>
                      </p>
                      {billing === 'yearly' && (
                        <p className="mt-0.5 font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
                          {plan.yearlyTotal.toFixed(2).replace('.', ',')} € par an,
                          soit {economie(plan).toFixed(2).replace('.', ',')} € économisés
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.differences.map(d => (
                    <li key={d} className="flex items-start gap-2.5 font-body text-[13.5px] leading-snug text-text-secondary dark:text-text-dark-secondary">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success dark:text-success-dark" strokeWidth={3} aria-hidden />
                      {d}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrentPlan ? (
                    <p className="flex min-h-[44px] items-center justify-center rounded-input border border-success/30 bg-success/10 font-body text-[14px] font-semibold text-success dark:text-success-dark">
                      Forfait actuel
                    </p>
                  ) : plan.id === 'free' ? (
                    <Link
                      href={isLoggedIn ? '/dashboard' : '/signup'}
                      className="flex min-h-[44px] items-center justify-center rounded-input border border-sky-border font-body text-[14px] font-semibold text-text-secondary transition-colors hover:bg-sky-cloud dark:border-night-border dark:text-text-dark-secondary dark:hover:bg-night-border"
                    >
                      {isLoggedIn ? 'Retour au tableau de bord' : 'Commencer gratuitement'}
                    </Link>
                  ) : isDowngrade ? (
                    <button
                      onClick={handleManageSubscription}
                      disabled={portalLoading}
                      className="flex min-h-[44px] w-full items-center justify-center rounded-input border border-sky-border font-body text-[14px] font-semibold text-text-secondary transition-colors hover:bg-sky-cloud disabled:opacity-50 dark:border-night-border dark:text-text-dark-secondary dark:hover:bg-night-border"
                    >
                      {portalLoading ? 'Chargement…' : 'Changer de forfait'}
                    </button>
                  ) : (
                    <motion.button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={isLoading}
                      whileTap={isLoading ? undefined : { scale: 0.98 }}
                      transition={SPRING.press}
                      className={cn(
                        'flex min-h-[44px] w-full items-center justify-center gap-2 rounded-input font-body text-[14px] font-semibold',
                        'transition-colors [transition-duration:var(--dur-fast)] disabled:opacity-60',
                        misEnAvant
                          ? 'bg-brand text-white hover:bg-brand-hover dark:bg-brand-dark dark:text-night-bg'
                          : 'border border-brand text-brand hover:bg-brand-soft dark:border-brand-dark dark:text-brand-dark dark:hover:bg-brand-dark-soft'
                      )}
                    >
                      {isLoading ? 'Chargement…' : 'Choisir ce forfait'}
                      {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden />}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Tableau comparatif — pour qui veut le détail ligne à ligne */}
        <section className="mt-14">
          <h2 className="mb-4 font-display text-[20px] font-bold text-text-main dark:text-text-dark-main">
            Le détail, ligne par ligne
          </h2>
          <div className="overflow-x-auto rounded-card border border-sky-border dark:border-night-border">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">
                Comparaison des trois forfaits Skynote sur les points qui les distinguent
              </caption>
              <thead>
                <tr className="bg-sky-surface-2 dark:bg-night-surface-2">
                  <th scope="col" className="px-4 py-3 font-body text-[12px] font-semibold uppercase tracking-wide text-text-tertiary dark:text-text-dark-tertiary">
                    Critère
                  </th>
                  {PLANS.map(p => (
                    <th
                      key={p.id}
                      scope="col"
                      className={cn(
                        'px-4 py-3 font-display text-[14px] font-bold',
                        'popular' in p && p.popular
                          ? 'text-brand dark:text-brand-dark'
                          : 'text-text-main dark:text-text-dark-main'
                      )}
                    >
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARATIF.map((ligne, i) => (
                  <tr
                    key={ligne.critere}
                    className={cn(
                      'border-t border-sky-border dark:border-night-border',
                      i % 2 === 1 && 'bg-sky-surface-2/50 dark:bg-night-surface-2/40'
                    )}
                  >
                    <th scope="row" className="px-4 py-3 font-body text-[13.5px] font-medium text-text-main dark:text-text-dark-main">
                      {ligne.critere}
                    </th>
                    {(['free', 'starter', 'pro'] as const).map(k => (
                      <td
                        key={k}
                        className={cn(
                          'px-4 py-3 font-body text-[13.5px]',
                          k === 'starter'
                            ? 'text-text-main dark:text-text-dark-main'
                            : 'text-text-secondary dark:text-text-dark-secondary'
                        )}
                      >
                        {/* Un tiret seul se lit mal au lecteur d'écran : on nomme l'absence. */}
                        {ligne[k] === '—' ? (
                          <span className="inline-flex items-center gap-1.5 text-text-tertiary dark:text-text-dark-tertiary">
                            <Minus className="h-3.5 w-3.5" aria-hidden />
                            <span className="sr-only">Non inclus</span>
                          </span>
                        ) : (
                          ligne[k]
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-[20px] font-bold text-text-main dark:text-text-dark-main">
            Questions fréquentes
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [
                'C\'est quoi les Novas ✦ ?',
                // Chiffres tirés de lib/supabase/nova-constants.ts : l'ancienne
                // FAQ annonçait des coûts que le code contredisait.
                `La monnaie qui alimente l'IA. Importer un cours et générer ses fiches et ses QCM coûte ${NOVA_COST_COURSE} ✦. Une question au chatbot en coûte ${NOVA_COST_CHAT}, un QCM supplémentaire ${NOVA_COST_QCM_SINGLE}, et lire une photo de cours ${NOVA_COST_OCR}. Ils ne périment pas et s'accumulent.`,
              ],
              [
                'Et si je dépasse ma dotation ?',
                'Rien ne se bloque : tes fiches, tes QCM et tes révisions restent accessibles. Tu ne peux simplement plus importer de nouveau cours avant la recharge du mois suivant, ou tu gagnes des Novas en réussissant des QCM.',
              ],
              [
                'Je peux gagner des Novas sans payer ?',
                'Oui. Les coffres de maîtrise en boutique en donnent — un coffre gratuit tous les 5 QCM réussis en 5/5, avec un contenu affiché avant l\'ouverture. Les objectifs en rapportent aussi.',
              ],
              [
                'Comment annuler ?',
                'Depuis « Gérer mon abonnement », qui ouvre le portail Stripe. L\'annulation prend un clic, et ton forfait reste actif jusqu\'à la fin de la période déjà payée.',
              ],
            ].map(([q, a]) => (
              <div key={q} className="rounded-card border border-sky-border bg-sky-surface p-4 dark:border-night-border dark:bg-night-surface">
                <p className="font-display text-[14px] font-bold text-text-main dark:text-text-dark-main">{q}</p>
                <p className="mt-1.5 font-body text-[13px] leading-relaxed text-text-secondary dark:text-text-dark-secondary">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA final */}
        {!isPaid && (
          <motion.div
            className="relative mt-12 overflow-hidden rounded-card border border-brand/30 bg-sky-surface px-6 py-10 text-center dark:border-brand-dark/30 dark:bg-night-surface"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: DUR.slow, ease: EASE.out }}
          >
            <div className="relative">
              <p className="font-display text-[clamp(20px,3vw,28px)] font-bold leading-snug text-text-main dark:text-text-dark-main">
                Commence gratuitement, tu décideras après.
              </p>
              <p className="mx-auto mt-3 max-w-md font-body text-[14px] text-text-secondary dark:text-text-dark-secondary">
                600 ✦ offerts à l&apos;inscription, de quoi générer plusieurs cours. Sans carte bancaire.
              </p>
              <Link
                href={isLoggedIn ? '/dashboard' : '/signup'}
                className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-brand px-7 font-display text-[15px] font-semibold text-white transition-colors hover:bg-brand-hover dark:bg-brand-dark dark:text-night-bg"
              >
                {isLoggedIn ? 'Retour au tableau de bord' : 'Créer mon compte'}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </motion.div>
        )}

        <p className="mt-8 text-center font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
          Paiement sécurisé par Stripe · Annulation à tout moment ·{' '}
          <Link href="/privacy" className="hover:underline">Politique de confidentialité</Link>
        </p>
      </div>
    </div>
  )
}
