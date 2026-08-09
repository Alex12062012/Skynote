/**
 * OUVERTURE D'UN COFFRE DE MAÎTRISE
 *
 * Remplace POST /api/boutique/spin (roue de la fortune), supprimé : cf. le
 * bloc d'explication en tête de lib/gamification/config.ts (risque loot-box
 * sur un public mineur).
 *
 * Aucun aléa ici : le serveur vérifie l'effort (QCM parfaits) via le RPC
 * claim_mastery_chest, en déduit le numéro du coffre, et le contenu se lit
 * dans une table fixe avec chestReward(n). Deux élèves au même numéro de
 * coffre obtiennent exactement la même chose.
 */
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  CHEST_SKIN_FALLBACK_COINS,
  MASTERY_CHEST_INTERVAL,
  SKINS,
  chestReward,
  nextSkinToUnlock,
} from '@/lib/gamification/config'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const admin = createAdminClient()

  // 1. Réservation atomique du prochain coffre (vérifie l'effort côté serveur)
  const { data: chestNumber, error: claimErr } = await admin.rpc('claim_mastery_chest', {
    p_user_id:  user.id,
    p_interval: MASTERY_CHEST_INTERVAL,
  })

  if (claimErr) {
    console.error('[chest] claim_mastery_chest error:', claimErr)
    return NextResponse.json({ error: 'Erreur lors de l\'ouverture' }, { status: 500 })
  }

  if (!chestNumber) {
    return NextResponse.json(
      { error: `Aucun coffre à ouvrir — encore quelques QCM en 5/5 et le prochain se débloque.` },
      { status: 400 },
    )
  }

  // 2. Contenu déterministe du coffre
  const tier = chestReward(chestNumber as number)
  let rewardType: string = tier.type
  let rewardValue = tier.value
  let wonSkinId: string | null = null
  let coinsDelta = 0
  let novasDelta = 0

  if (tier.type === 'coins') {
    coinsDelta = tier.value
    const { error } = await admin.rpc('award_coins', {
      p_user_id: user.id, p_amount: tier.value, p_reason: `Coffre de maîtrise n°${chestNumber}`,
    })
    if (error) console.error('[chest] award_coins error:', error)
  }

  if (tier.type === 'nova') {
    novasDelta = tier.value
    const { error } = await admin.rpc('add_novas', {
      p_user_id: user.id, p_amount: tier.value, p_reason: `Coffre de maîtrise n°${chestNumber}`,
    })
    if (error) console.error('[chest] add_novas error:', error)
  }

  if (tier.type === 'boost_x2') {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
    const { error } = await supabase.from('user_boosts').upsert({
      user_id:    user.id,
      boost_type: 'x2_coins',
      expires_at: expiresAt,
    }, { onConflict: 'user_id,boost_type' })
    if (error) console.error('[chest] user_boosts upsert error:', error)
  }

  if (tier.type === 'skin') {
    const { data: owned } = await supabase
      .from('user_inventory').select('item_id')
      .eq('user_id', user.id).eq('item_type', 'frame')

    wonSkinId = nextSkinToUnlock((owned ?? []).map((f: { item_id: string }) => f.item_id))

    if (wonSkinId) {
      const skinEntry = SKINS.find(s => s.id === wonSkinId)
      const { error } = await supabase.from('user_inventory').upsert({
        user_id:   user.id,
        item_type: 'frame',
        item_id:   wonSkinId,
        data: { name: skinEntry?.label ?? 'Skin', tier: skinEntry?.tier ?? 'confirme', secret: skinEntry?.secret ?? false },
      }, { onConflict: 'user_id,item_type,item_id' })
      if (error) console.error('[chest] user_inventory upsert error:', error)
    } else {
      // Collection complète → compensation fixe, annoncée à l'avance
      rewardType  = 'coins'
      rewardValue = CHEST_SKIN_FALLBACK_COINS
      coinsDelta  = CHEST_SKIN_FALLBACK_COINS
      const { error } = await admin.rpc('award_coins', {
        p_user_id: user.id, p_amount: CHEST_SKIN_FALLBACK_COINS,
        p_reason: `Coffre de maîtrise n°${chestNumber} (collection complète)`,
      })
      if (error) console.error('[chest] award_coins fallback error:', error)
    }
  }

  // 3. Compléter la ligne de claim (best-effort, l'ouverture est déjà actée)
  const { error: updErr } = await admin
    .from('mastery_chest_claims')
    .update({
      tier_id:        tier.id,
      reward_type:    rewardType,
      reward_value:   rewardValue,
      reward_item_id: wonSkinId,
    })
    .eq('user_id', user.id)
    .eq('chest_number', chestNumber)
  if (updErr) console.error('[chest] claim update error:', updErr)

  return NextResponse.json({
    chestNumber,
    tier,
    rewardType,
    rewardValue,
    wonSkinId,
    coinsDelta,
    novasDelta,
  })
}
