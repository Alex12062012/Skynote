import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * DISCLAIMER « ESTIMATION IA »
 *
 * La note /20, la mention et les corrections de la mini-épreuve brevet sont
 * produites par un modèle d'IA à partir des réponses de l'élève. Ce n'est ni
 * une note officielle, ni une prédiction du résultat réel au brevet.
 *
 * Ce composant doit rester DIRECTEMENT sur la carte de résultat : une mention
 * enfouie dans les CGU ne suffit pas — un élève de 3ᵉ (et ses parents) doit
 * comprendre au moment où il lit « 15/20 » que ce chiffre est indicatif.
 */
export function AiEstimateDisclaimer({
  variant = 'card',
  className,
}: {
  /** 'card' : bloc complet sous la note · 'inline' : ligne courte pour une liste */
  variant?: 'card' | 'inline'
  className?: string
}) {
  if (variant === 'inline') {
    return (
      <p className={cn(
        'flex items-center gap-1.5 font-body text-[11px] text-text-tertiary dark:text-text-dark-tertiary',
        className,
      )}>
        <Info className="h-3 w-3 flex-shrink-0" />
        Estimation IA, pas une note officielle.
      </p>
    )
  }

  return (
    <div className={cn(
      'flex items-start gap-2.5 rounded-input border border-amber-300/40 bg-amber-50 px-4 py-3 dark:border-amber-700/30 dark:bg-amber-950/20',
      className,
    )}>
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
      <p className="font-body text-[12px] leading-relaxed text-amber-900 dark:text-amber-200">
        <span className="font-bold">Estimation IA, pas une note officielle.</span>{' '}
        Cette note et cette mention sont générées automatiquement à partir de tes réponses.
        Elles servent à te situer et à progresser — elles ne préjugent pas de ton résultat
        réel au brevet, qui dépend d&apos;un barème et de correcteurs officiels.
      </p>
    </div>
  )
}
