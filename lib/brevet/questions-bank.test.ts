import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import {
  pickRandomQuestions,
  QUESTIONS_INDEX,
  REDACTION_INDEX,
  BANK_SIZE,
  type SeenMap,
} from './questions-bank'

/** Rejoue N brevets d'affilée comme le fait la route /api/brevet/generate. */
function simuler(nbEpreuves: number) {
  const seen: SeenMap = new Map()
  const seenRedaction: SeenMap = new Map()
  const epreuves: { ids: string[]; redactionId: string; reused: number }[] = []

  for (let i = 0; i < nbEpreuves; i++) {
    const { questions, redaction, reused } = pickRandomQuestions(seen, seenRedaction)

    // Vieillissement de l'historique : tout ce qui était vu recule d'un cran.
    for (const [id, rank] of seen) seen.set(id, rank + 1)
    for (const [id, rank] of seenRedaction) seenRedaction.set(id, rank + 1)
    for (const q of questions) seen.set(q.id, 0)
    seenRedaction.set(redaction.id, 0)

    epreuves.push({ ids: questions.map(q => q.id), redactionId: redaction.id, reused })
  }
  return epreuves
}

describe('pickRandomQuestions', () => {
  it('sert 17 questions + 1 rédaction', () => {
    const { questions, redaction } = pickRandomQuestions()
    expect(questions).toHaveLength(17)
    expect(redaction).toBeDefined()
  })

  it("n'expose jamais le corrigé ni les critères au client", () => {
    const { questions } = pickRandomQuestions()
    for (const q of questions) {
      expect(q).not.toHaveProperty('corrige')
      expect(q).not.toHaveProperty('criteres')
    }
  })

  it('sert des questions résolvables côté serveur (corrigé retrouvable par id)', () => {
    const { questions, redaction } = pickRandomQuestions()
    for (const q of questions) expect(QUESTIONS_INDEX.get(q.id)).toBeDefined()
    expect(REDACTION_INDEX.get(redaction.id)).toBeDefined()
  })

  it('ne répète aucune question au sein dune même épreuve', () => {
    for (let i = 0; i < 200; i++) {
      const { questions } = pickRandomQuestions()
      const ids = questions.map(q => q.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it("ne ressert jamais une question tant que la banque n'est pas épuisée", () => {
    for (let essai = 0; essai < 100; essai++) {
      const epreuves = simuler(BANK_SIZE.epreuvesInedites)
      const tousLesIds = epreuves.flatMap(e => e.ids)
      expect(new Set(tousLesIds).size).toBe(tousLesIds.length)

      const redactions = epreuves.map(e => e.redactionId)
      expect(new Set(redactions).size).toBe(redactions.length)

      expect(epreuves.every(e => e.reused === 0)).toBe(true)
    }
  })

  it('recycle les questions les plus anciennes une fois la banque épuisée', () => {
    const epreuves = simuler(BANK_SIZE.epreuvesInedites + 1)
    const derniere = epreuves[epreuves.length - 1]

    // La banque est épuisée : on tolère du recyclage...
    expect(derniere.reused).toBeGreaterThan(0)
    // ...mais jamais une question vue à l'épreuve immédiatement précédente
    // tant qu'il reste des questions plus anciennes à recycler.
    const precedente = new Set(epreuves[epreuves.length - 2].ids)
    const chevauchement = derniere.ids.filter(id => precedente.has(id))
    expect(chevauchement).toHaveLength(0)
  })

  it('reste stable même avec un historique incohérent', () => {
    const bidon: SeenMap = new Map([['id-qui-nexiste-pas', 0]])
    const { questions } = pickRandomQuestions(bidon, bidon)
    expect(questions).toHaveLength(17)
  })
})

describe('documents de la banque', () => {
  const toutesLesQuestions = [...QUESTIONS_INDEX.values()]

  it("ne contient aucun lien externe : un élève sans réseau doit pouvoir composer", () => {
    const fautifs: string[] = []
    for (const q of toutesLesQuestions) {
      for (const doc of q.documents ?? []) {
        if (/https?:\/\/|www\./i.test(doc.contenu)) {
          fautifs.push(`${q.id} — ${doc.titre}`)
        }
      }
    }
    expect(fautifs).toEqual([])
  })

  it('ne référence que des images présentes dans public/brevet', () => {
    const manquants: string[] = []
    for (const q of toutesLesQuestions) {
      for (const doc of q.documents ?? []) {
        if (doc.type !== 'image') continue
        // Une image doit être un chemin local, jamais une URL.
        expect(doc.contenu.startsWith('/')).toBe(true)
        const fichier = join(process.cwd(), 'public', doc.contenu)
        if (!existsSync(fichier)) manquants.push(`${q.id} → ${doc.contenu}`)
      }
    }
    expect(manquants).toEqual([])
  })

  it('ne pose pas de question sur un document absent', () => {
    // Une question qui parle de « D2 » doit avoir au moins deux documents.
    const incoherents: string[] = []
    for (const q of toutesLesQuestions) {
      const nbDocs = q.documents?.length ?? 0
      const refs = q.question.match(/\bD(\d)\b/g) ?? []
      for (const ref of refs) {
        if (Number(ref.slice(1)) > nbDocs) incoherents.push(`${q.id} cite ${ref} mais n'a que ${nbDocs} document(s)`)
      }
    }
    expect(incoherents).toEqual([])
  })

  it("n'a aucun identifiant en double", () => {
    const source = readFileSync(join(__dirname, 'questions-bank.ts'), 'utf-8')
    const ids = [...source.matchAll(/^ {4}id: '([^']+)'/gm)].map(m => m[1])
    const doublons = ids.filter((id, i) => ids.indexOf(id) !== i)
    expect(doublons).toEqual([])
  })
})
