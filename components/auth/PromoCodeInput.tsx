'use client'

import { useState } from 'react'
import { Ticket } from 'lucide-react'
import { Input } from '@/components/ui/Input'

interface PromoCodeInputProps {
  value: string
  onChange: (v: string) => void
}

/**
 * Champ de code promo, replié par défaut.
 *
 * Le code est normalisé à la saisie (majuscules, caractères admis seulement)
 * pour que l'élève voie tout de suite la forme attendue. Cette normalisation
 * est un confort d'affichage : le serveur revalide de toute façon, et rien
 * n'est accordé côté client.
 */
export function PromoCodeInput({ value, onChange }: PromoCodeInputProps) {
  const [ouvert, setOuvert] = useState(Boolean(value))

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="inline-flex min-h-[44px] items-center gap-1.5 font-body text-[13px] text-brand hover:underline dark:text-brand-dark"
      >
        <Ticket className="h-4 w-4" aria-hidden />
        J&apos;ai un code promo
      </button>
    )
  }

  return (
    <div className="space-y-1">
      <Input
        id="promo"
        label="Code promo (optionnel)"
        placeholder="RENTREE2026"
        value={value}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={32}
        onChange={e => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
      />
      <p className="font-body text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
        Il sera appliqué automatiquement une fois ton compte créé.
      </p>
    </div>
  )
}
