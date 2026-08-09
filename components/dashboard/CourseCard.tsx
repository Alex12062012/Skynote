'use client'

import Link from 'next/link'
import { Clock, FileText, FileType, Camera, Mic, AlertCircle, Loader2 } from 'lucide-react'
import { SubjectBadge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDate, cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n/context'

interface CourseCardProps {
  id: string; title: string; subject: string; color: string
  status: string; progress: number; created_at: string; source_type: string
  studentProgress?: { done: number; total: number; perfect: boolean }
}

// Ic\u00F4nes vectorielles plut\u00F4t qu'emojis : un emoji change de dessin selon la
// plateforme, ne suit pas les tokens de couleur et ne s'aligne pas sur la
// grille d'ic\u00F4nes du reste de l'app.
const SOURCE_ICONS: Record<string, { Icon: typeof FileText; label: string }> = {
  text:  { Icon: FileText, label: 'Cours saisi au clavier' },
  pdf:   { Icon: FileType, label: 'Import\u00E9 depuis un PDF' },
  photo: { Icon: Camera,   label: 'Import\u00E9 depuis une photo' },
  vocal: { Icon: Mic,      label: 'Dict\u00E9 \u00E0 la voix' },
}

export function CourseCard({ id, title, subject, color, status, progress, created_at, source_type, studentProgress }: CourseCardProps) {
  const { t } = useI18n()
  const isReady = status === 'ready'
  const isError = status === 'error'

  return (
    <Link href={`/courses/${id}`}
      className="group flex flex-col gap-3 rounded-card border border-brand-dark/30 bg-gradient-to-br from-brand/10 via-night-surface to-night-surface p-5 transition-[transform,border-color,box-shadow] [transition-duration:var(--dur-fast)] [transition-timing-function:var(--ease-out)] hover:-translate-y-0.5 hover:border-brand-dark/50 hover:shadow-[0_18px_50px_-30px_rgba(37,99,235,0.8)] active:translate-y-0 active:scale-[0.99]">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SubjectBadge subject={subject} />
            {(() => {
              const src = SOURCE_ICONS[source_type] ?? SOURCE_ICONS.text
              return (
                <src.Icon
                  className="h-3.5 w-3.5 text-text-tertiary dark:text-text-dark-tertiary"
                  aria-label={src.label}
                />
              )
            })()}
          </div>
          <h3 className="font-display text-[16px] font-semibold text-text-main line-clamp-2 dark:text-text-dark-main group-hover:text-brand dark:group-hover:text-brand-dark transition-colors">
            {title}
          </h3>
        </div>
        <div className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', isReady ? 'bg-success' : isError ? 'bg-error' : 'bg-amber-400 animate-pulse')} />
      </div>
      {isReady && progress > 0 && (
        <div className="space-y-1">
          <ProgressBar value={progress} />
          <p className="font-body text-[11px] text-text-tertiary dark:text-text-dark-tertiary">{progress}% {t('course.mastered')}</p>
        </div>
      )}
      {!isReady && (
        <span className={cn('w-fit rounded-pill px-2.5 py-0.5 font-body text-[11px] font-medium',
          isError ? 'bg-red-50 text-error dark:bg-red-950/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
        )}>
          <span className="inline-flex items-center gap-1.5">
            {isError
              ? <AlertCircle className="h-3 w-3" aria-hidden />
              : <Loader2 className="h-3 w-3 animate-spin" aria-hidden />}
            {isError ? t('course.error') : t('course.processing')}
          </span>
        </span>
      )}
      <p className="font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatDate(created_at)}
      </p>
    </Link>
  )
}
