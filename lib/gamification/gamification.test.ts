import { describe, it, expect } from 'vitest'
import {
  scoreMultiplier,
  streakBonus,
  prestigeCost,
  prestigeMultiplier,
  BADGES,
  DIFFICULTY_COINS,
  MASTERY_TIER_LABELS,
  MASTERY_TIER_ORDER,
  masteryTierLabel,
  normalizeMasteryTier,
  MASTERY_CHEST_INTERVAL,
  MASTERY_CHEST_TRACK,
  SKIN_UNLOCK_ORDER,
  chestProgress,
  chestReward,
  chestsUnlocked,
  nextSkinToUnlock,
} from './config'
import { computeReward } from './rewards'

// ─── scoreMultiplier ──────────────────────────────────────────────────────────
describe('scoreMultiplier', () => {
  it('5/5 → 1.0 (parfait)', () => expect(scoreMultiplier(5, 5)).toBe(1))
  it('4/5 → 0.5 (une erreur)', () => expect(scoreMultiplier(4, 5)).toBe(0.5))
  it('3/5 → 0 (≥ 2 erreurs)', () => expect(scoreMultiplier(3, 5)).toBe(0))
  it('0/5 → 0', () => expect(scoreMultiplier(0, 5)).toBe(0))
  it('total=0 → 0 (pas de division par zéro)', () => expect(scoreMultiplier(0, 0)).toBe(0))
})

// ─── streakBonus ──────────────────────────────────────────────────────────────
describe('streakBonus', () => {
  it('streak 3 → +5 coins', () => expect(streakBonus(3)).toBe(5))
  it('streak 5 → +15 coins', () => expect(streakBonus(5)).toBe(15))
  it('streak 2 → 0 (pas de seuil)', () => expect(streakBonus(2)).toBe(0))
  it('streak 4 → 0 (pas de seuil)', () => expect(streakBonus(4)).toBe(0))
  it('streak 10 → 0 (seuil dépassé)', () => expect(streakBonus(10)).toBe(0))
})

// ─── prestigeCost ─────────────────────────────────────────────────────────────
describe('prestigeCost', () => {
  it('P0 → P1 coûte 100', () => expect(prestigeCost(0)).toBe(100))
  it('P1 → P2 coûte 200', () => expect(prestigeCost(1)).toBe(200))
  it('P2 → P3 coûte 300', () => expect(prestigeCost(2)).toBe(300))
  it('coût croît linéairement', () => {
    expect(prestigeCost(3)).toBe(400)
    expect(prestigeCost(9)).toBe(1000)
  })
})

// ─── prestigeMultiplier ───────────────────────────────────────────────────────
describe('prestigeMultiplier', () => {
  it('P0 → ×1.00', () => expect(prestigeMultiplier(0)).toBe(1))
  it('P1 → ×1.05', () => expect(prestigeMultiplier(1)).toBeCloseTo(1.05))
  it('P5 → ×1.25', () => expect(prestigeMultiplier(5)).toBeCloseTo(1.25))
  it('jamais inférieur à 1', () => expect(prestigeMultiplier(0)).toBeGreaterThanOrEqual(1))
})

// ─── computeReward ────────────────────────────────────────────────────────────
describe('computeReward', () => {
  // totalPerfectBefore = EARLY_GAME_WINDOW pour désactiver le bonus early game
  const base = {
    score: 5, total: 5, difficulty: 'medium' as const,
    prestigeLevel: 0, currentPerfectStreak: 0, totalPerfectBefore: 10,
  }

  it('5/5 medium sans bonus → DIFFICULTY_COINS.medium', () => {
    const r = computeReward(base)
    expect(r.total).toBe(DIFFICULTY_COINS.medium)
    expect(r.perfect).toBe(true)
    expect(r.earlyGameBonus).toBe(0)
  })

  it('4/5 → 50% des coins de base', () => {
    const r = computeReward({ ...base, score: 4 })
    expect(r.earnedBeforeBonuses).toBe(Math.round(DIFFICULTY_COINS.medium * 0.5))
    expect(r.perfect).toBe(false)
  })

  it('3/5 → 0 coins', () => {
    const r = computeReward({ ...base, score: 3 })
    expect(r.total).toBe(0)
  })

  it('streak 3 ajoute le bonus streak', () => {
    const r = computeReward({ ...base, currentPerfectStreak: 2 })
    expect(r.streakBonus).toBe(5)
  })

  it('streak 5 ajoute le bonus streak 15', () => {
    const r = computeReward({ ...base, currentPerfectStreak: 4 })
    expect(r.streakBonus).toBe(15)
  })

  it('early game (< 10 parfaits) ajoute +5', () => {
    const r = computeReward({ ...base, totalPerfectBefore: 5 })
    expect(r.earlyGameBonus).toBe(5)
  })

  it('après la fenêtre early game (≥ 10), pas de bonus', () => {
    const r = computeReward({ ...base, totalPerfectBefore: 10 })
    expect(r.earlyGameBonus).toBe(0)
  })

  it('prestige 2 → multiplicateur ×1.10', () => {
    const r = computeReward({ ...base, prestigeLevel: 2 })
    const expected = Math.round(DIFFICULTY_COINS.medium * prestigeMultiplier(2))
    expect(r.total).toBe(expected)
  })

  it('x2 boost double le total', () => {
    const rNormal = computeReward(base)
    const rBoost  = computeReward({ ...base, hasX2Boost: true })
    expect(rBoost.total).toBe(rNormal.total * 2)
  })

  it('x2 boost + prestige se cumulent', () => {
    const r = computeReward({ ...base, prestigeLevel: 2, hasX2Boost: true })
    const expected = Math.round(DIFFICULTY_COINS.medium * prestigeMultiplier(2) * 2)
    expect(r.total).toBe(expected)
  })

  it('5/5 non-parfait (score < total) → newPerfectStreak reset à 0', () => {
    const r = computeReward({ ...base, score: 4, currentPerfectStreak: 3 })
    expect(r.newPerfectStreak).toBe(0)
  })
})

// ─── COFFRES DE MAÎTRISE (remplace la roue de la fortune) ─────────────────────
// L'ancien bloc `drawWheelSegment` testait le tirage pondéré de la roue : il a
// été retiré en même temps que la mécanique elle-même (risque loot-box mineurs,
// cf. en-tête de config.ts). Les tests ci-dessous garantissent la propriété qui
// remplace ces garanties : le gain ne dépend QUE de l'effort, jamais du hasard.

describe('chestsUnlocked', () => {
  it('0 QCM parfait → aucun coffre', () => expect(chestsUnlocked(0)).toBe(0))
  it('4 QCM parfaits → toujours aucun coffre', () => expect(chestsUnlocked(4)).toBe(0))
  it('5 QCM parfaits → 1 coffre', () => expect(chestsUnlocked(5)).toBe(1))
  it('12 QCM parfaits → 2 coffres', () => expect(chestsUnlocked(12)).toBe(2))
  it('valeur négative → 0 (pas de coffre fantôme)', () => expect(chestsUnlocked(-3)).toBe(0))
  it('1 coffre par palier de MASTERY_CHEST_INTERVAL', () => {
    expect(chestsUnlocked(MASTERY_CHEST_INTERVAL * 7)).toBe(7)
  })
})

describe('chestReward', () => {
  it('est déterministe — même numéro, même récompense', () => {
    for (let n = 1; n <= 50; n++) {
      expect(chestReward(n)).toBe(chestReward(n))
    }
  })

  it('suit le cycle fixe de la piste', () => {
    expect(chestReward(1).id).toBe(MASTERY_CHEST_TRACK[0].id)
    expect(chestReward(MASTERY_CHEST_TRACK.length).id)
      .toBe(MASTERY_CHEST_TRACK[MASTERY_CHEST_TRACK.length - 1].id)
    // le cycle recommence
    expect(chestReward(MASTERY_CHEST_TRACK.length + 1).id).toBe(MASTERY_CHEST_TRACK[0].id)
  })

  it('le contenu du 12ᵉ coffre est connaissable à l\'avance', () => {
    const idx = (12 - 1) % MASTERY_CHEST_TRACK.length
    expect(chestReward(12)).toEqual(MASTERY_CHEST_TRACK[idx])
  })

  it('aucun palier « perdu » — chaque coffre donne quelque chose', () => {
    for (const tier of MASTERY_CHEST_TRACK) {
      const givesSomething = tier.value > 0 || tier.type === 'boost_x2' || tier.type === 'skin'
      expect(givesSomething).toBe(true)
    }
  })

  it('numéro invalide (0 ou négatif) → premier palier, jamais un crash', () => {
    expect(chestReward(0).id).toBe(MASTERY_CHEST_TRACK[0].id)
    expect(chestReward(-5).id).toBe(MASTERY_CHEST_TRACK[0].id)
  })
})

describe('chestProgress', () => {
  it('débutant (0 parfait) → rien à ouvrir, 5 QCM à faire', () => {
    const p = chestProgress(0, 0)
    expect(p.claimable).toBe(0)
    expect(p.remainingToUnlock).toBe(MASTERY_CHEST_INTERVAL)
    expect(p.nextChestNumber).toBe(1)
  })

  it('3 parfaits → 2 QCM restants avant le coffre', () => {
    const p = chestProgress(3, 0)
    expect(p.progressInStep).toBe(3)
    expect(p.remainingToUnlock).toBe(MASTERY_CHEST_INTERVAL - 3)
    expect(p.claimable).toBe(0)
  })

  it('5 parfaits, 0 ouvert → 1 coffre ouvrable', () => {
    const p = chestProgress(5, 0)
    expect(p.claimable).toBe(1)
    expect(p.remainingToUnlock).toBe(0)
  })

  it('15 parfaits, 3 ouverts → plus rien à ouvrir', () => {
    const p = chestProgress(15, 3)
    expect(p.unlocked).toBe(3)
    expect(p.claimable).toBe(0)
    expect(p.nextChestNumber).toBe(4)
  })

  it('annonce le contenu exact du prochain coffre', () => {
    const p = chestProgress(15, 3)
    expect(p.nextReward).toEqual(chestReward(4))
  })

  it('jamais de claimable négatif même si claimed > unlocked', () => {
    expect(chestProgress(5, 99).claimable).toBe(0)
  })
})

// ─── VOCABULAIRE DE MAÎTRISE (remplace Common/Rare/Epic/Legendary) ────────────
describe('paliers de maîtrise', () => {
  it('traduit l\'ancien vocabulaire gacha stocké en base', () => {
    expect(normalizeMasteryTier('common')).toBe('debutant')
    expect(normalizeMasteryTier('rare')).toBe('confirme')
    expect(normalizeMasteryTier('epic')).toBe('expert')
    expect(normalizeMasteryTier('legendary')).toBe('maitre')
    expect(normalizeMasteryTier('default')).toBe('base')
  })

  it('laisse passer le nouveau vocabulaire', () => {
    for (const tier of MASTERY_TIER_ORDER) {
      expect(normalizeMasteryTier(tier)).toBe(tier)
    }
  })

  it('valeur inconnue ou nulle → palier neutre, jamais un crash', () => {
    expect(normalizeMasteryTier(null)).toBe('confirme')
    expect(normalizeMasteryTier('n_importe_quoi')).toBe('confirme')
  })

  it('affiche un libellé de progression, jamais un terme de rareté', () => {
    const labels = MASTERY_TIER_ORDER.map(t => MASTERY_TIER_LABELS[t])
    expect(labels).toEqual(['Standard', 'Débutant', 'Confirmé', 'Expert', 'Maître'])
    for (const label of labels) {
      expect(label.toLowerCase()).not.toMatch(/rare|commun|épique|epique|légendaire|legendaire/)
    }
  })

  it('masteryTierLabel accepte aussi une valeur héritée', () => {
    expect(masteryTierLabel('legendary')).toBe('Maître')
  })

  it('le catalogue de badges n\'utilise plus que des paliers de maîtrise', () => {
    for (const badge of BADGES) {
      expect(MASTERY_TIER_ORDER).toContain(badge.tier)
    }
  })
})

describe('nextSkinToUnlock', () => {
  it('collection vide → premier skin de l\'ordre fixe', () => {
    expect(nextSkinToUnlock([])).toBe(SKIN_UNLOCK_ORDER[0])
  })

  it('premier possédé → deuxième skin (aucun doublon possible)', () => {
    expect(nextSkinToUnlock([SKIN_UNLOCK_ORDER[0]])).toBe(SKIN_UNLOCK_ORDER[1])
  })

  it('collection complète → null', () => {
    expect(nextSkinToUnlock(SKIN_UNLOCK_ORDER)).toBeNull()
  })

  it('est déterministe (aucun tirage)', () => {
    const owned = SKIN_UNLOCK_ORDER.slice(0, 3)
    expect(nextSkinToUnlock(owned)).toBe(nextSkinToUnlock(owned))
  })
})
