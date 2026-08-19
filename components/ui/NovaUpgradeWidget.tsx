'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NovaCoin } from '@/components/ui/NovaCoin'

interface NovaUpgradeWidgetProps {
  plan: string
}

const PLAN_LABELS: Record<string, string> = {
  free:    'Forfait Gratuit',
  starter: 'Forfait Starter',
  pro:     'Forfait Pro',
}

export function NovaUpgradeWidget({ plan }: NovaUpgradeWidgetProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('payment') === 'success'

  useEffect(() => {
    // Retour de checkout Stripe : le webhook peut prendre quelques secondes à
    // arriver. On force un refresh serveur pour ne pas laisser la bulle
    // "Mettre à niveau" affichée le temps que `profiles.plan` se mette à jour
    // (le layout dashboard est en `revalidate = 30`, donc sans ça elle peut
    // rester visible jusqu'à 30s après un paiement Pro).
    if (justPaid) router.refresh()
  }, [justPaid, router])

  if (plan === 'pro') return null

  return (
    <div className="lglass-liquid fixed bottom-5 left-5 z-30 hidden items-center gap-2 rounded-pill px-3.5 py-1.5 sm:flex">
      <NovaCoin size={15} />
      <span className="font-body text-[13px] text-text-secondary dark:text-text-dark-secondary">
        {PLAN_LABELS[plan] ?? 'Forfait Gratuit'}
      </span>
      <span className="text-text-tertiary dark:text-text-dark-tertiary">·</span>
      <Link
        href="/pricing"
        className="font-body text-[13px] font-medium text-brand hover:underline dark:text-brand-dark"
      >
        Mettre à niveau
      </Link>
    </div>
  )
}
