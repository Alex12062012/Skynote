'use client'

/**
 * RÉGLAGES D'ACCESSIBILITÉ
 *
 * Pour l'instant : police dyslexie-friendly (Lexend).
 * La préférence est stockée en localStorage et appliquée par une classe
 * `.dyslexia-mode` sur <html> — la même classe est posée avant le premier
 * rendu par le script inline de app/layout.tsx, donc pas de changement de
 * police visible au chargement.
 */

import { useEffect, useState } from 'react'
import { Type, Accessibility } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'skynote-dyslexia'

export function AccessibilitySettings() {
  const [enabled, setEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Refléter l'état réel du DOM (posé par le script inline) après hydratation
  useEffect(() => {
    setEnabled(document.documentElement.classList.contains('dyslexia-mode'))
    setMounted(true)
  }, [])

  function toggle() {
    const next = !enabled
    setEnabled(next)
    document.documentElement.classList.toggle('dyslexia-mode', next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch { /* stockage indisponible (navigation privée) : l'effet reste actif pour la session */ }
  }

  return (
    <div className="rounded-card border border-sky-border bg-sky-surface p-5 shadow-card dark:border-night-border dark:bg-night-surface dark:shadow-card-dark">
      <h3 className="mb-4 flex items-center gap-2 font-display text-h4 text-text-main dark:text-text-dark-main">
        <Accessibility className="h-5 w-5 text-brand dark:text-brand-dark" />
        Accessibilité
      </h3>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-input bg-brand-soft dark:bg-brand-dark-soft">
            <Type className="h-4 w-4 text-brand dark:text-brand-dark" />
          </div>
          <div>
            <p className="font-body text-sm font-semibold text-text-main dark:text-text-dark-main">
              Police dyslexie-friendly
            </p>
            <p className="mt-0.5 font-body text-xs text-text-tertiary dark:text-text-dark-tertiary">
              Remplace la police de toute l&apos;app par Lexend et aère le texte
              (interlignage et espacement plus larges).
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Activer la police dyslexie-friendly"
          onClick={toggle}
          disabled={!mounted}
          className={cn(
            'relative h-7 w-12 flex-shrink-0 rounded-pill transition-colors disabled:opacity-50',
            enabled
              ? 'bg-brand dark:bg-brand-dark'
              : 'bg-sky-cloud dark:bg-night-border',
          )}
        >
          <span
            className={cn(
              'absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>
    </div>
  )
}
