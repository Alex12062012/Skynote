import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { STRIPE_CONFIG, PLAN_NOVA_ALLOC } from '@/lib/stripe/config'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { plan, billing } = await request.json()
    // plan: 'starter' | 'pro'
    // billing: 'monthly' | 'yearly'

    // Vérifier que Stripe est configuré
    if (!STRIPE_CONFIG.secretKey) {
      return NextResponse.json({
        error: 'Stripe non configuré — ajoute tes clés dans les variables d\'environnement Vercel'
      }, { status: 503 })
    }

    // Import dynamique de Stripe (évite les erreurs si clé vide)
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(STRIPE_CONFIG.secretKey)

    const priceKey = `${plan}_${billing}` as keyof typeof STRIPE_CONFIG.prices
    const priceId = STRIPE_CONFIG.prices[priceKey]

    if (!priceId) {
      return NextResponse.json({ error: 'Prix non configuré dans Stripe' }, { status: 400 })
    }

    // Abonnement déjà actif ? On modifie EN PLACE au lieu de créer un 2e
    // abonnement — sinon Stripe facture les deux en parallèle.
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, stripe_subscription_id, plan')
      .eq('id', user.id)
      .single()

    if (profile?.stripe_subscription_id) {
      const existing = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)

      if (existing.status === 'active' || existing.status === 'trialing') {
        const currentItemId = existing.items.data[0]?.id
        if (!currentItemId) {
          return NextResponse.json({ error: 'Abonnement Stripe invalide' }, { status: 500 })
        }

        const updated = await stripe.subscriptions.update(profile.stripe_subscription_id, {
          items: [{ id: currentItemId, price: priceId }],
          proration_behavior: 'create_prorations',
          metadata: { userId: user.id, plan, billing },
        })

        // Le webhook `customer.subscription.updated` mettra à jour `profiles`,
        // mais on le fait aussi ici pour un retour immédiat côté client
        // (le webhook peut prendre quelques secondes à arriver).
        const expiresAt = new Date((updated as any).current_period_end * 1000)
        await supabase
          .from('profiles')
          .update({ plan, plan_expires_at: expiresAt.toISOString() })
          .eq('id', user.id)

        // Si upgrade vers un plan avec plus de Novas, on complète la différence
        const previousAlloc = PLAN_NOVA_ALLOC[profile.plan as 'starter' | 'pro'] ?? 0
        const newAlloc = PLAN_NOVA_ALLOC[plan as 'starter' | 'pro'] ?? 0
        if (newAlloc > previousAlloc) {
          await supabase.rpc('add_novas', {
            p_user_id: user.id,
            p_amount:  newAlloc - previousAlloc,
            p_reason:  `Changement vers ${plan} — ${newAlloc - previousAlloc} ✦`,
          })
        }

        return NextResponse.json({ updated: true, redirectUrl: STRIPE_CONFIG.successUrl })
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan,
        billing,
      },
      locale: 'fr',
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('[Stripe checkout]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
