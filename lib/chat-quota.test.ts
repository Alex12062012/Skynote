import { describe, it, expect } from 'vitest'
import {
  CHAT_QUOTA_UNLIMITED,
  FREE_CHAT_QUESTIONS_PER_COURSE_PER_MONTH,
  chatQuotaPeriod,
  computeChatQuota,
  quotaExhaustedMessage,
} from './chat-quota'

describe('computeChatQuota — plan Free', () => {
  const LIMIT = FREE_CHAT_QUESTIONS_PER_COURSE_PER_MONTH

  it('aucune question posée → tout le quota est disponible', () => {
    const q = computeChatQuota(LIMIT, 0)
    expect(q.limited).toBe(true)
    expect(q.remaining).toBe(LIMIT)
    expect(q.allowed).toBe(true)
  })

  it('le plan Free a bien 5 questions par cours et par mois', () => {
    expect(LIMIT).toBe(5)
  })

  it('quota partiellement consommé → reste le complément', () => {
    const q = computeChatQuota(LIMIT, 3)
    expect(q.used).toBe(3)
    expect(q.remaining).toBe(LIMIT - 3)
    expect(q.allowed).toBe(true)
  })

  it('dernière question disponible → toujours autorisé', () => {
    expect(computeChatQuota(LIMIT, LIMIT - 1).allowed).toBe(true)
  })

  it('quota atteint → bloqué, mais remaining reste à 0 (jamais négatif)', () => {
    const q = computeChatQuota(LIMIT, LIMIT)
    expect(q.allowed).toBe(false)
    expect(q.remaining).toBe(0)
  })

  it('consommation incohérente (> limite) → remaining plancher à 0', () => {
    expect(computeChatQuota(LIMIT, 99).remaining).toBe(0)
  })

  it('consommation négative traitée comme 0', () => {
    expect(computeChatQuota(LIMIT, -4).used).toBe(0)
  })
})

describe('computeChatQuota — plans payants', () => {
  it('limite -1 → illimité, jamais bloqué', () => {
    const q = computeChatQuota(CHAT_QUOTA_UNLIMITED, 500)
    expect(q.limited).toBe(false)
    expect(q.allowed).toBe(true)
    expect(q.remaining).toBe(CHAT_QUOTA_UNLIMITED)
  })
})

describe('chatQuotaPeriod', () => {
  it('formate en YYYY-MM', () => {
    expect(chatQuotaPeriod(new Date('2026-07-25T10:00:00Z'))).toBe('2026-07')
  })

  it('pad le mois sur 2 chiffres', () => {
    expect(chatQuotaPeriod(new Date('2026-01-02T00:00:00Z'))).toBe('2026-01')
  })

  it('change de période au changement de mois', () => {
    const jan = chatQuotaPeriod(new Date('2026-01-31T23:00:00Z'))
    const feb = chatQuotaPeriod(new Date('2026-02-01T01:00:00Z'))
    expect(jan).not.toBe(feb)
  })
})

describe('quotaExhaustedMessage', () => {
  const msg = quotaExhaustedMessage(FREE_CHAT_QUESTIONS_PER_COURSE_PER_MONTH)

  it('reste incitatif : mentionne le rechargement et Starter', () => {
    expect(msg).toMatch(/mois prochain/i)
    expect(msg).toMatch(/Starter/)
  })

  it('n\'utilise pas un vocabulaire de porte fermée', () => {
    expect(msg).not.toMatch(/réservé aux abonnés|interdit|impossible/i)
  })
})
