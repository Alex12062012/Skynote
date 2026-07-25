import Link from 'next/link'
import { Brain, ArrowRight, Check } from 'lucide-react'

/**
 * Carte dédiée à la répétition espacée (SM-2) sur le tableau de bord.
 * Affiche le nombre de fiches dues aujourd'hui et renvoie vers /review.
 * Toujours rendue, même à 0 fiche due, pour que la fonctionnalité reste
 * visible et compréhensible (et pas seulement quand il y a du retard).
 */
export function ReviewCard({
  dueCount,
  masteredCount,
  totalCount,
}: {
  dueCount: number
  masteredCount: number
  totalCount: number
}) {
  const hasDue = dueCount > 0

  return (
    <Link
      href="/review"
      className="group flex w-full items-center justify-between gap-4 rounded-card border border-sky-border bg-sky-surface px-5 py-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 dark:border-night-border dark:bg-night-surface dark:shadow-card-dark"
    >
      <div className="flex items-center gap-3">
        <div className={
          hasDue
            ? 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-input bg-brand text-white'
            : 'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-input bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'
        }>
          {hasDue ? <Brain className="h-5 w-5" /> : <Check className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-display text-[15px] font-bold text-text-main dark:text-text-dark-main">
            {hasDue
              ? `${dueCount} fiche${dueCount > 1 ? 's' : ''} à réviser aujourd'hui`
              : 'Révisions à jour'}
          </p>
          <p className="font-body text-[12px] text-text-secondary dark:text-text-dark-secondary">
            {totalCount > 0
              ? `Répétition espacée · ${masteredCount}/${totalCount} fiche${totalCount > 1 ? 's' : ''} maîtrisée${masteredCount > 1 ? 's' : ''}`
              : 'Répétition espacée — tes fiches reviennent au bon moment'}
          </p>
        </div>
      </div>
      <ArrowRight className="h-5 w-5 flex-shrink-0 text-brand transition-transform group-hover:translate-x-1 dark:text-brand-dark" />
    </Link>
  )
}
