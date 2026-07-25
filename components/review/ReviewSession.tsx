'use client'

/**
 * SESSION DE RÉVISION ESPACÉE (SM-2)
 *
 * Boucle : on montre le recto (titre de la fiche), l'élève essaie de se
 * rappeler, il retourne la carte, puis il s'auto-évalue. Le grade choisi est
 * envoyé à submitReview() qui applique applySM2() (lib/sm2.ts) et planifie la
 * prochaine échéance.
 */

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { Brain, Check, RotateCcw, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { submitReview } from '@/lib/supabase/review-actions'
import type { DueCard } from '@/lib/supabase/review-actions'
import type { SM2Grade } from '@/lib/sm2'

const GRADES: Array<{ grade: SM2Grade; label: string; hint: string; className: string }> = [
  { grade: 0, label: 'À revoir',  hint: 'Je ne savais pas',        className: 'bg-red-500 hover:bg-red-600' },
  { grade: 3, label: 'Difficile', hint: 'Retrouvé avec effort',    className: 'bg-orange-500 hover:bg-orange-600' },
  { grade: 4, label: 'Bien',      hint: 'Retrouvé correctement',   className: 'bg-emerald-500 hover:bg-emerald-600' },
  { grade: 5, label: 'Facile',    hint: 'Immédiat, sans hésiter',  className: 'bg-brand hover:bg-brand-hover' },
]

interface ReviewSessionProps {
  cards: DueCard[]
}

export function ReviewSession({ cards }: ReviewSessionProps) {
  const [index, setIndex]       = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [pending, setPending]   = useState(false)
  const [done, setDone]         = useState(0)

  const card  = cards[index]
  const total = cards.length

  const grade = useCallback(async (g: SM2Grade) => {
    if (!card || pending) return
    setPending(true)
    await submitReview(card.id, g)
    setDone(d => d + 1)
    setRevealed(false)
    setIndex(i => i + 1)
    setPending(false)
  }, [card, pending])

  const progressPct = useMemo(
    () => (total === 0 ? 0 : Math.round((done / total) * 100)),
    [done, total],
  )

  // ─── Fin de session ────────────────────────────────────────────────────────
  if (!card) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-card border border-sky-border bg-sky-surface p-10 text-center shadow-card dark:border-night-border dark:bg-night-surface dark:shadow-card-dark">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="font-display text-h3 font-black text-text-main dark:text-text-dark-main">
            Session terminée
          </p>
          <p className="mt-1 font-body text-[14px] text-text-secondary dark:text-text-dark-secondary">
            {done > 0
              ? `${done} fiche${done > 1 ? 's' : ''} révisée${done > 1 ? 's' : ''}. Les prochaines échéances sont calculées automatiquement.`
              : 'Aucune fiche à réviser pour le moment — reviens demain.'}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 rounded-pill bg-brand px-6 py-2.5 font-display text-[14px] font-bold text-white transition hover:bg-brand-hover"
        >
          Retour au tableau de bord <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Progression de la session */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-body text-[13px] text-text-secondary dark:text-text-dark-secondary">
            Fiche {index + 1} sur {total}
          </span>
          <span className="font-display text-[13px] font-bold tabular-nums text-brand dark:text-brand-dark">
            {progressPct} %
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-pill bg-sky-cloud dark:bg-night-border">
          <div
            className="h-full rounded-pill bg-brand transition-all duration-300 dark:bg-brand-dark"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Carte */}
      <div className="rounded-card border border-sky-border bg-sky-surface p-6 shadow-card dark:border-night-border dark:bg-night-surface dark:shadow-card-dark">
        <div className="mb-4 flex items-center gap-2">
          <Brain className="h-4 w-4 text-brand dark:text-brand-dark" />
          <span className="font-display text-[11px] font-bold uppercase tracking-wide text-text-tertiary dark:text-text-dark-tertiary">
            {revealed ? 'Réponse' : 'Essaie de te rappeler'}
          </span>
        </div>

        <p className="font-display text-h3 font-bold leading-snug text-text-main dark:text-text-dark-main">
          {card.title}
        </p>

        {revealed && (
          <p className="animate-fade-in mt-4 whitespace-pre-line border-t border-sky-border pt-4 font-body text-[15px] leading-relaxed text-text-secondary dark:border-night-border dark:text-text-dark-secondary">
            {card.summary}
          </p>
        )}
      </div>

      {/* Actions */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="flex w-full items-center justify-center gap-2 rounded-pill bg-brand py-3 font-display text-[15px] font-bold text-white transition hover:bg-brand-hover active:scale-[0.99]"
        >
          <RotateCcw className="h-4 w-4" /> Voir la réponse
        </button>
      ) : (
        <div>
          <p className="mb-2 text-center font-body text-[13px] text-text-secondary dark:text-text-dark-secondary">
            Tu t&apos;en souvenais&nbsp;?
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map(g => (
              <button
                key={g.grade}
                onClick={() => grade(g.grade)}
                disabled={pending}
                title={g.hint}
                className={cn(
                  'flex flex-col items-center gap-0.5 rounded-card px-3 py-2.5 font-display text-[14px] font-bold text-white transition active:scale-95 disabled:opacity-60',
                  g.className,
                )}
              >
                {g.label}
                <span className="font-body text-[10px] font-normal opacity-85">{g.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
