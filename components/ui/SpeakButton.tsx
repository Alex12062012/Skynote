'use client'

/**
 * BOUTON « ÉCOUTER » — synthèse vocale native du navigateur.
 *
 * Utilise l'API Web Speech (window.speechSynthesis), disponible nativement
 * sur Chrome, Edge, Safari et Firefox : aucune dépendance npm, aucun appel
 * réseau, aucun coût d'API. Si le navigateur ne la supporte pas, le bouton
 * ne s'affiche pas du tout plutôt que d'échouer silencieusement.
 */

import { useCallback, useEffect, useState } from 'react'
import { Volume2, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpeakButtonProps {
  /** Texte à lire à voix haute */
  text: string
  /** Libellé accessible (par défaut : « Écouter ») */
  label?: string
  className?: string
}

export function SpeakButton({ text, label = 'Écouter', className }: SpeakButtonProps) {
  const [supported, setSupported] = useState(false)
  const [speaking, setSpeaking]   = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
  }, [])

  // Couper la lecture si le composant disparaît (changement de fiche, navigation)
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback(() => {
    if (!supported || !text.trim()) return

    // Une lecture en cours : le bouton devient un stop
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang  = 'fr-FR'
    utterance.rate  = 0.95   // légèrement ralenti : plus confortable à l'écoute
    utterance.pitch = 1

    utterance.onend   = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [supported, text])

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={speak}
      aria-label={speaking ? 'Arrêter la lecture' : label}
      title={speaking ? 'Arrêter la lecture' : label}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-3 py-1.5 font-body text-[12px] font-medium transition-colors',
        speaking
          ? 'border-brand bg-brand-soft text-brand dark:border-brand-dark dark:bg-brand-dark-soft dark:text-brand-dark'
          : 'border-sky-border text-text-secondary hover:border-brand/40 hover:text-brand dark:border-night-border dark:text-text-dark-secondary dark:hover:text-brand-dark',
        className,
      )}
    >
      {speaking ? <Square className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
      {speaking ? 'Arrêter' : label}
    </button>
  )
}
