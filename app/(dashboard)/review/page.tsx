import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Brain, Sparkles, Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getDueCards, getReviewStats } from '@/lib/supabase/review-actions'
import { ReviewSession } from '@/components/review/ReviewSession'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = { title: 'Révision — Skynote' }
export const dynamic = 'force-dynamic'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [cards, stats] = await Promise.all([
    getDueCards(),
    getReviewStats(),
  ])

  return (
    <div className="mx-auto flex max-w-2xl animate-fade-in flex-col gap-8">

      <header>
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-brand dark:text-brand-dark" />
          <h1 className="font-display text-h2 font-black text-text-main dark:text-text-dark-main">
            Révision
          </h1>
        </div>
        <p className="mt-1 font-body text-[14px] text-text-secondary dark:text-text-dark-secondary">
          Répétition espacée : chaque fiche revient juste avant que tu ne l&apos;oublies.
          Plus tu la maîtrises, plus l&apos;intervalle s&apos;allonge.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Brain}    label="À réviser"  value={stats.dueCount} accent />
        <StatCard icon={Sparkles} label="Maîtrisées" value={stats.masteredCount} />
        <StatCard icon={Layers}   label="Total"      value={stats.totalCount} />
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={<Brain className="h-10 w-10 text-text-tertiary dark:text-text-dark-tertiary" />}
          title={stats.totalCount === 0 ? 'Aucune fiche à réviser' : 'Tout est à jour'}
          description={
            stats.totalCount === 0
              ? 'Crée un cours pour générer tes premières fiches — elles entreront automatiquement dans le cycle de révision.'
              : 'Tu as révisé toutes les fiches dues aujourd\'hui. Reviens demain, les prochaines échéances sont déjà planifiées.'
          }
          action={
            <Link href={stats.totalCount === 0 ? '/courses/new' : '/dashboard'}>
              <Button className="gap-2">
                {stats.totalCount === 0 ? 'Créer un cours' : 'Retour au tableau de bord'}
              </Button>
            </Link>
          }
        />
      ) : (
        <ReviewSession cards={cards} />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon, label, value, accent = false,
}: {
  icon: React.ElementType
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-card border border-sky-border bg-sky-surface px-3 py-4 shadow-card dark:border-night-border dark:bg-night-surface dark:shadow-card-dark">
      <Icon className={accent
        ? 'h-4 w-4 text-brand dark:text-brand-dark'
        : 'h-4 w-4 text-text-tertiary dark:text-text-dark-tertiary'} />
      <span className="font-display text-[22px] font-black tabular-nums text-text-main dark:text-text-dark-main">
        {value}
      </span>
      <span className="font-body text-[12px] text-text-secondary dark:text-text-dark-secondary">
        {label}
      </span>
    </div>
  )
}
