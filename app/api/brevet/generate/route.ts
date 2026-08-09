import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { pickRandomQuestions } from '@/lib/brevet/questions-bank'
import type { StoredQuestion, RedactionSubject, SeenMap } from '@/lib/brevet/questions-bank'

export const maxDuration = 30

// Ce que l'on stocke en DB (pas de corrigé/critères)
export interface StoredSession {
  questions: StoredQuestion[]
  redaction: RedactionSubject
}

// Client service role — bypass RLS
function getAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Reconstruit l'historique des questions déjà servies à cet élève.
 * Les sessions sont lues de la plus récente à la plus ancienne : le `rank`
 * associé à chaque id est l'ancienneté (0 = vu au dernier brevet).
 * Les sessions abandonnées comptent aussi — l'élève a vu les questions.
 */
async function getSeenQuestions(
  admin: ReturnType<typeof getAdminClient>,
  userId: string,
  currentSessionId: string
): Promise<{ seen: SeenMap; seenRedaction: SeenMap }> {
  const seen: SeenMap = new Map()
  const seenRedaction: SeenMap = new Map()

  const { data, error } = await admin
    .from('exam_sessions')
    .select('questions, redaction')
    .eq('user_id', userId)
    .neq('id', currentSessionId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    // On préfère un brevet potentiellement redondant à un brevet qui ne se génère pas.
    console.error('[brevet/generate] Historique illisible, anti-répétition désactivé:', error)
    return { seen, seenRedaction }
  }

  data?.forEach((session, rank) => {
    const questions = session.questions as StoredQuestion[] | null
    if (Array.isArray(questions)) {
      for (const q of questions) {
        if (q?.id && !seen.has(q.id)) seen.set(q.id, rank)
      }
    }
    const redaction = session.redaction as RedactionSubject | null
    if (redaction?.id && !seenRedaction.has(redaction.id)) {
      seenRedaction.set(redaction.id, rank)
    }
  })

  return { seen, seenRedaction }
}

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json()
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!sessionId || !uuidRegex.test(sessionId)) {
    return NextResponse.json({ error: 'sessionId invalide' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

  // Verifier que la session appartient a l'utilisateur
  const { data: session } = await supabase
    .from('exam_sessions')
    .select('id, questions')
    .eq('id', sessionId)
    .eq('user_id', user.id)
    .single()

  if (!session) return NextResponse.json({ error: 'Session introuvable' }, { status: 404 })

  // Deja generee
  if (Array.isArray(session.questions) && (session.questions as any[]).length > 0) {
    return NextResponse.json({ ok: true })
  }

  const admin = getAdminClient()

  // Piocher 17 questions ouvertes + 1 rédaction, en excluant tout ce que
  // l'élève a déjà vu lors de ses brevets précédents.
  const { seen, seenRedaction } = await getSeenQuestions(admin, user.id, sessionId)
  const { questions, redaction, reused } = pickRandomQuestions(seen, seenRedaction)

  if (reused > 0) {
    console.warn(
      `[brevet/generate] Banque épuisée pour l'utilisateur ${user.id} : ${reused} question(s) recyclée(s) sur ${questions.length + 1}.`
    )
  }

  const { error: updateErr } = await admin
    .from('exam_sessions')
    .update({
      questions,
      redaction,
      // 17 réponses texte + 1 réponse rédaction = 18 slots
      answers: new Array(questions.length + 1).fill(null),
    })
    .eq('id', sessionId)

  if (updateErr) {
    console.error('[brevet/generate] Erreur update:', updateErr)
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: questions.length })
}
