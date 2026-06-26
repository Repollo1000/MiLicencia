import { createClient } from '@supabase/supabase-js'
import type { QuestionWithOptions } from '@/types'

const url = import.meta.env.VITE_SUPABASE_URL as string
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(url, key)

// ── Auth ──────────────────────────────────────────────────────────────────────

export const getSession  = () => supabase.auth.getSession()
export const signOut     = () => supabase.auth.signOut()

export const signIn = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUp = (email: string, password: string) =>
  supabase.auth.signUp({ email, password })

// ── Preguntas ─────────────────────────────────────────────────────────────────

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

export async function fetchSimulacroQuestions(): Promise<QuestionWithOptions[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, text, explanation, image_url, is_double_score, category_id,
      categories ( name ),
      question_options ( id, question_id, option_text, is_correct )
    `)

  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('No hay preguntas en la base de datos.')

  const critical = data.filter(q => q.is_double_score)
  const rest     = data.filter(q => !q.is_double_score)

  const selected = shuffle([
    ...shuffle(critical).slice(0, Math.min(critical.length, 8)),
    ...shuffle(rest),
  ]).slice(0, 35)

  // Mezclar opciones dentro de cada pregunta
  return selected.map(q => ({
    ...q,
    categories: q.categories as { name: string },
    question_options: shuffle(q.question_options ?? []),
  })) as QuestionWithOptions[]
}

// ── Intentos ──────────────────────────────────────────────────────────────────

export async function saveAttempt(score: number, passed: boolean) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  await supabase.from('attempts').insert({ user_id: session.user.id, score, passed })
}