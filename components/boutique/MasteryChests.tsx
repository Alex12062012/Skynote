'use client'

/**
 * COFFRES DE MAÎTRISE — remplace la roue de la fortune.
 * Voir l'en-tête de lib/gamification/config.ts pour le pourquoi.
 *
 * Principes tenus par ce composant :
 *   • on affiche TOUJOURS le contenu du prochain coffre avant l'ouverture ;
 *   • on affiche la piste complète (les 8 paliers du cycle) ;
 *   • le bouton ne coûte aucune monnaie, il se débloque à l'effort ;
 *   • aucune animation de « tirage » : on ouvre ce qui était annoncé.
 */

import { useCallback, useState } from 'react'
import { Gift, Lock, Sparkles, Check } from 'lucide-react'
import { SkyCoin } from '@/components/ui/SkyCoin'
import { cn } from '@/lib/utils'
import { useCoinReward } from '@/components/providers/CoinRewardProvider'
import {
  MASTERY_CHEST_INTERVAL,
  MASTERY_CHEST_TRACK,
  chestProgress,
  type MasteryChestTier,
} from '@/lib/gamification/config'

interface ChestResult {
  chestNumber: number
  tier: MasteryChestTier
  rewardType: string
  rewardValue: number
  wonSkinId: string | null
  coinsDelta: number
  novasDelta: number
}

interface MasteryChestsProps {
  /** QCM réussis en 5/5 (cumul) — la seule source de déblocage */
  totalPerfectQcm: number
  /** coffres déjà ouverts */
  chestsClaimed: number
  onCoinsEarned?: (amount: number) => void
}

export function MasteryChests({ totalPerfectQcm, chestsClaimed, onCoinsEarned }: MasteryChestsProps) {
  const [claimed, setClaimed] = useState(chestsClaimed)
  const [opening, setOpening] = useState(false)
  const [result, setResult]   = useState<ChestResult | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const { showReward } = useCoinReward()

  const progress = chestProgress(totalPerfectQcm, claimed)
  const canOpen  = progress.claimable > 0 && !opening

  const openChest = useCallback(async () => {
    if (opening || progress.claimable <= 0) return
    setError(null)
    setResult(null)
    setOpening(true)

    try {
      const resp = await fetch('/api/boutique/chest', { method: 'POST' })
      const body = await resp.json()

      if (!resp.ok) {
        setError(body.error ?? 'Erreur serveur')
        return
      }

      const res = body as ChestResult
      setResult(res)
      setClaimed(c => c + 1)

      if (res.coinsDelta > 0) {
        onCoinsEarned?.(res.coinsDelta)
        showReward({ amount: res.coinsDelta, reason: `Coffre de maîtrise n°${res.chestNumber}` })
      }
    } catch {
      setError('Erreur réseau')
    } finally {
      setOpening(false)
    }
  }, [opening, progress.claimable, onCoinsEarned, showReward])

  const stepPct = progress.claimable > 0
    ? 100
    : Math.round((progress.progressInStep / MASTERY_CHEST_INTERVAL) * 100)

  return (
    <div className="flex w-full flex-col items-center gap-5">

      {/* Coffre + état */}
      <div
        className={cn(
          'flex h-32 w-32 items-center justify-center rounded-card border-2 transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-300',
          canOpen
            ? 'animate-glow-pulse border-brand bg-brand-soft dark:border-brand-dark dark:bg-brand-dark-soft'
            : 'border-sky-border bg-sky-surface-2 dark:border-night-border dark:bg-night-surface-2',
        )}
      >
        {progress.claimable > 0
          ? <Gift className="h-14 w-14 text-brand dark:text-brand-dark" />
          : <Lock className="h-12 w-12 text-text-tertiary dark:text-text-dark-tertiary" />}
      </div>

      {/* Progression vers le prochain coffre */}
      <div className="w-full max-w-xs">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="font-display text-[13px] font-bold text-text-main dark:text-text-dark-main">
            Coffre n°{progress.nextChestNumber}
          </span>
          <span className="font-body text-[12px] tabular-nums text-text-secondary dark:text-text-dark-secondary">
            {progress.claimable > 0
              ? `${progress.claimable} prêt${progress.claimable > 1 ? 's' : ''}`
              : `${progress.progressInStep}/${MASTERY_CHEST_INTERVAL} QCM parfaits`}
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-pill bg-sky-cloud dark:bg-night-border">
          <div
            className="h-full rounded-pill bg-brand transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-500 dark:bg-brand-dark"
            style={{ width: `${stepPct}%` }}
          />
        </div>
        <p className="mt-2 font-body text-[12px] text-text-secondary dark:text-text-dark-secondary">
          {progress.claimable > 0
            ? 'Ton coffre est débloqué, tu peux l\'ouvrir.'
            : `Encore ${progress.remainingToUnlock} QCM en 5/5 pour le débloquer.`}
        </p>
      </div>

      {/* Contenu annoncé À L'AVANCE — le cœur de la transparence */}
      <div className="w-full max-w-xs rounded-card border border-sky-border bg-sky-surface-2 px-4 py-3 dark:border-night-border dark:bg-night-surface-2">
        <p className="font-display text-[11px] font-semibold uppercase tracking-wide text-text-tertiary dark:text-text-dark-tertiary">
          Contenu garanti de ce coffre
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: progress.nextReward.color }} />
          <span className="font-display text-[15px] font-bold text-text-main dark:text-text-dark-main">
            {progress.nextReward.desc}
          </span>
        </div>
      </div>

      <button
        onClick={openChest}
        disabled={!canOpen}
        className={cn(
          'flex items-center gap-2 rounded-pill px-8 py-3 font-display text-[16px] font-bold transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-200',
          canOpen
            ? 'bg-brand text-white shadow-btn hover:bg-brand-hover active:scale-95'
            : 'cursor-not-allowed bg-sky-cloud text-text-tertiary dark:bg-night-border dark:text-text-dark-tertiary',
        )}
      >
        {opening ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Ouverture…
          </>
        ) : (
          <>
            <Gift className="h-4 w-4" />
            {progress.claimable > 0 ? 'Ouvrir le coffre — gratuit' : 'Coffre verrouillé'}
          </>
        )}
      </button>

      {error && (
        <p className="rounded-card border border-error/20 bg-red-50 px-4 py-2 font-body text-[13px] text-error dark:bg-red-950/20">
          {error}
        </p>
      )}

      {result && <ChestResultBanner result={result} onClose={() => setResult(null)} />}
    </div>
  )
}

/** Piste complète — l'élève voit les 8 paliers du cycle, dans l'ordre. */
export function ChestTrack({ chestsClaimed }: { chestsClaimed: number }) {
  const currentIdx = chestsClaimed % MASTERY_CHEST_TRACK.length

  return (
    <div className="grid grid-cols-2 gap-2">
      {MASTERY_CHEST_TRACK.map((tier, i) => {
        const isNext = i === currentIdx
        return (
          <div
            key={tier.id}
            className={cn(
              'flex items-center gap-2 rounded-input border px-3 py-2 transition-colors',
              isNext
                ? 'border-brand bg-brand-soft dark:border-brand-dark dark:bg-brand-dark-soft'
                : 'border-sky-border bg-sky-surface-2 dark:border-night-border dark:bg-night-surface-2',
            )}
          >
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: tier.color }} />
            <span className="flex-1 font-body text-[12px] font-medium text-text-secondary dark:text-text-dark-secondary">
              {tier.label}
            </span>
            {isNext && (
              <span className="rounded-pill bg-brand px-1.5 py-0.5 font-body text-[10px] font-bold uppercase text-white">
                Suivant
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** Libellé lisible d'un palier pour l'historique. */
export function formatChestTier(tierId: string): string {
  return MASTERY_CHEST_TRACK.find(t => t.id === tierId)?.desc ?? tierId
}

function ChestResultBanner({ result, onClose }: { result: ChestResult; onClose: () => void }) {
  const isSkin  = result.wonSkinId !== null
  const isNova  = result.rewardType === 'nova'
  const isBoost = result.rewardType === 'boost_x2'

  const title = isSkin
    ? 'Nouveau skin débloqué !'
    : isBoost
    ? 'Boost ×2 coins activé !'
    : isNova
    ? `+${result.rewardValue} Novas ✦`
    : `+${result.rewardValue} Sky Coins`

  return (
    <div className="animate-pop-in w-full max-w-sm rounded-card border border-emerald-300/50 bg-emerald-50 p-5 shadow-card dark:border-emerald-700/40 dark:bg-emerald-950/20">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          {isSkin || isBoost
            ? <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            : <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
        </div>
        <div>
          <p className="font-display text-[18px] font-black leading-tight text-emerald-700 dark:text-emerald-400">
            {title}
          </p>
          <p className="font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
            Coffre n°{result.chestNumber} — exactement ce qui était annoncé
          </p>
        </div>
      </div>

      <p className="mb-4 flex items-center gap-1.5 font-body text-[13px] text-text-secondary dark:text-text-dark-secondary">
        {!isSkin && !isBoost && !isNova && <SkyCoin size={14} />}
        {isSkin && 'Retrouve-le dans l\'onglet Skins de la boutique.'}
        {isBoost && 'Tes gains de Sky Coins sont doublés pendant 1 heure.'}
        {isNova && 'Tes Novas servent à générer fiches et QCM avec l\'IA.'}
        {!isSkin && !isBoost && !isNova && 'Ajoutés à ton solde.'}
      </p>

      <button
        onClick={onClose}
        className="w-full rounded-pill bg-emerald-600 py-2 font-display text-[13px] font-bold text-white transition hover:bg-emerald-700"
      >
        OK
      </button>
    </div>
  )
}
