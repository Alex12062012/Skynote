import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateQcmQuestions } from '@/lib/ai/generate'
import type { QcmDifficulty } from '@/lib/ai/prompts'
import { NOVA_COST_QCM_BATCH, deductNovasForUser, addNovasForUser } from '@/lib/supabase/nova-actions'

export const maxDuration = 60

const ALL_DIFFICULTIES: QcmDifficulty[] = ['peaceful', 'easy', 'medium', 'hard']

export async function POST(request: NextRequest) {
  let novaDeducted = false
  let userId: string | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    userId = user.id

    const body = await request.json()
    const { flashcardId, courseId } = body

    if (!flashcardId || !courseId) {
      return NextResponse.json({ error: 'flashcardId et courseId requis' }, { status: 400 })
    }

    // Verifier que la fiche appartient a l'utilisateur
    const { data: flashcard } = await supabase
      .from('flashcards')
      .select('id, title, summary, key_points, course_id, user_id')
      .eq('id', flashcardId)
      .eq('user_id', user.id)
      .single()

    if (!flashcard) {
      return NextResponse.json({ error: 'Fiche introuvable' }, { status: 404 })
    }

    // Deduire les Novas AVANT l'appel IA — sinon cette route regenere les 4
    // niveaux de difficulte gratuitement, a l'infini, sur n'importe quelle fiche.
    const deductResult = await deductNovasForUser(
      user.id,
      NOVA_COST_QCM_BATCH,
      `QCM regénérés (4 niveaux) — ${flashcard.title}`
    )
    if (!deductResult.ok) {
      return NextResponse.json(
        { error: deductResult.error ?? 'Novas insuffisantes', code: 'insufficient_novas' },
        { status: 402 }
      )
    }
    novaDeducted = true

    // Supprimer les anciennes questions pour cette fiche (regeneration propre)
    await supabase.from('qcm_questions').delete().eq('flashcard_id', flashcardId)

    const keyPoints: string[] = Array.isArray(flashcard.key_points)
      ? flashcard.key_points
      : (() => { try { return JSON.parse(String(flashcard.key_points || '[]')) } catch { return [] } })()

    // Generer les 4 niveaux en parallele pour cette fiche
    let totalInserted = 0

    const results = await Promise.allSettled(
      ALL_DIFFICULTIES.map(async (difficulty) => {
        try {
          const questions = await generateQcmQuestions(
            flashcard.title,
            flashcard.summary,
            keyPoints,
            difficulty
          )
          if (questions.length > 0) {
            const { error } = await supabase.from('qcm_questions').insert(
              questions.map((q) => ({
                flashcard_id: flashcard.id,
                course_id: courseId,
                user_id: user.id,
                question: q.question,
                options: q.options,
                correct_index: q.correct_index,
                explanation: q.explanation,
                difficulty,
              }))
            )
            if (!error) return questions.length
          }
          return 0
        } catch (err) {
          console.error(`[QCM Batch] ${difficulty} pour fiche ${flashcardId}:`, err)
          return 0
        }
      })
    )

    totalInserted = results.reduce(
      (sum, r) => sum + (r.status === 'fulfilled' ? (r.value ?? 0) : 0),
      0
    )

    // Echec total (les 4 niveaux ont échoué silencieusement via allSettled) :
    // on rembourse, sinon l'utilisateur paie 88✦ pour 0 QCM généré.
    if (totalInserted === 0) {
      await addNovasForUser(user.id, NOVA_COST_QCM_BATCH, 'Remboursement QCM batch échoué').catch(() => {})
      return NextResponse.json({ error: 'Aucune question générée', code: 'generation_failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, inserted: totalInserted, novaBalance: deductResult.balance })

  } catch (error) {
    console.error('[API /generate-qcm/batch] Error:', error)
    if (novaDeducted && userId) {
      await addNovasForUser(userId, NOVA_COST_QCM_BATCH, 'Remboursement QCM batch échoué').catch(() => {})
    }
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
