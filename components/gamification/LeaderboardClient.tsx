'use client'

import { useState, useTransition } from 'react'
import { Coins } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { fadeUp, stagger } from '@/lib/motion'
import { PlayerCard } from './PlayerCard'
import { getLeaderboard, type LeaderboardRow } from '@/lib/supabase/gamification-actions'
import type { LeaderboardMode } from '@/lib/gamification/config'
import { useI18n } from '@/lib/i18n/context'

interface LeaderboardClientProps {
  initialRows: LeaderboardRow[]
  initialMe: (LeaderboardRow & { rank: number }) | null
  initialMode: LeaderboardMode
  currentUserId: string | null
}

export function LeaderboardClient({
  initialRows, initialMe, initialMode, currentUserId,
}: LeaderboardClientProps) {
  const { t } = useI18n()
  const [mode, setMode] = useState<LeaderboardMode>(initialMode)
  const [rows, setRows] = useState(initialRows)
  const [me,   setMe]   = useState(initialMe)
  const [pending, start] = useTransition()

  const switchMode = (m: LeaderboardMode) => {
    if (m === mode) return
    setMode(m)
    start(async () => {
      const next = await getLeaderboard(m)
      setRows(next.rows)
      setMe(next.me)
    })
  }

  const coinField =
    mode === 'weekly'  ? 'weekly_coins'  :
    mode === 'monthly' ? 'monthly_coins' :
                          'sky_coins'  // solde actuel = ce qu'il reste

  const TABS: Array<{ key: LeaderboardMode; label: string; chip: string }> = [
    { key: 'weekly',   label: t('leaderboard.weekly'),   chip: t('leaderboard.weeklyChip') },
    { key: 'monthly',  label: t('leaderboard.monthly'),  chip: t('leaderboard.monthlyChip') },
    { key: 'all_time', label: t('leaderboard.allTime'),  chip: t('leaderboard.allTimeChip') },
  ]

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 rounded-card border border-sky-border bg-sky-surface-2 p-1 dark:border-night-border dark:bg-night-surface-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => switchMode(tab.key)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 rounded-input py-2.5 font-body transition-[background-color,border-color,color,box-shadow,transform,opacity]',
              mode === tab.key
                ? 'bg-sky-surface text-brand shadow-card dark:bg-night-surface dark:text-brand-dark'
                : 'text-text-secondary hover:text-text-main dark:text-text-dark-secondary dark:hover:text-text-dark-main',
            )}
          >
            <span className={cn(
              'font-display text-[10px] font-black uppercase tracking-wider',
              mode === tab.key ? 'text-brand dark:text-brand-dark' : 'text-text-tertiary',
            )}>
              {tab.chip}
            </span>
            <span className="font-display text-[13px] font-bold">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Reset info */}
      <p className="flex items-center justify-center gap-1.5 text-center font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
        {mode === 'weekly'   && t('leaderboard.resetWeekly')}
        {mode === 'monthly'  && t('leaderboard.resetMonthly')}
        {mode === 'all_time' && (<><Coins className="h-3.5 w-3.5" /> {t('leaderboard.rankByBalance')}</>)}
      </p>

      {/* Liste */}
      {/* La cascade est rejouee a chaque changement d'onglet (cle = mode) :
          le classement est un contenu different, pas le meme reordonne.
          Pas 45ms ici mais 25 : jusqu'a 100 lignes, un pas standard rendrait
          la fin de liste plus lente que patiente. */}
      <motion.div
        key={mode}
        className={cn('space-y-2 transition-opacity', pending && 'opacity-60')}
        variants={stagger(0.025)}
        initial="hidden"
        animate="show"
      >
        {rows.length === 0 && (
          <p className="py-12 text-center font-body text-text-tertiary">{t('leaderboard.noOne')}</p>
        )}
        {rows.map((r, i) => (
          <motion.div key={r.id} variants={fadeUp}>
          <PlayerCard
            rank={i + 1}
            player={{
              id: r.id,
              pseudo: r.pseudo,
              user_number: r.user_number,
              prestige_level: r.prestige_level,
              active_title_id: r.active_title_id,
              active_badge_id: r.active_badge_id,
              active_frame_id: r.active_frame_id,
              coins: (r as any)[coinField] ?? 0,
              streak_days: r.streak_days,
              plan: r.plan,
            }}
            isMe={r.id === currentUserId}
            href={r.pseudo ? `/profil/${encodeURIComponent(r.pseudo)}` : undefined}
          />
          </motion.div>
        ))}
      </motion.div>

      {/* Ma position si hors top */}
      {me && !rows.some(r => r.id === me.id) && (
        <>
          <div className="my-2 flex items-center gap-2">
            <div className="h-px flex-1 bg-sky-border dark:bg-night-border" />
            <span className="font-body text-[11px] uppercase tracking-wider text-text-tertiary">{t('leaderboard.yourPosition')}</span>
            <div className="h-px flex-1 bg-sky-border dark:bg-night-border" />
          </div>
          <PlayerCard
            rank={me.rank}
            player={{
              id: me.id,
              pseudo: me.pseudo,
              user_number: me.user_number,
              prestige_level: me.prestige_level,
              active_title_id: me.active_title_id,
              active_badge_id: me.active_badge_id,
              active_frame_id: me.active_frame_id,
              coins: (me as any)[coinField] ?? 0,
              streak_days: me.streak_days,
              plan: me.plan,
            }}
            isMe
          />
        </>
      )}
    </div>
  )
}
