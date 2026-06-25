import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.PUBLIC_SUPABASE_URL  as string ?? 'https://placeholder.supabase.co'
const supabaseKey  = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string ?? 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Tipos ──────────────────────────────────────────────────────────────────────

export type QuestionOption = {
  id: string
  option_text: string
  is_correct: boolean
}

export type Question = {
  id: string
  text: string
  explanation: string
  image_url: string | null
  is_double_score: boolean
  category_name: string
  options: QuestionOption[]
}

// ── Queries ────────────────────────────────────────────────────────────────────

export async function fetchQuestions(): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, text, explanation, image_url, is_double_score,
      categories ( name ),
      question_options ( id, option_text, is_correct )
    `)

  if (error) throw error
  if (!data?.length) throw new Error('No hay preguntas cargadas en la base de datos.')

  // Separar críticas (doble puntaje) del resto
  const critical = data.filter((q: any) => q.is_double_score)
  const rest     = data.filter((q: any) => !q.is_double_score)

  const shuffle  = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5)

  const selected = shuffle([
    ...shuffle(critical).slice(0, Math.min(critical.length, 8)),
    ...shuffle(rest),
  ]).slice(0, 35)

  return selected.map((q: any): Question => ({
    id:            q.id,
    text:          q.text,
    explanation:   q.explanation,
    image_url:     q.image_url,
    is_double_score: q.is_double_score,
    category_name: q.categories?.name ?? '',
    options:       shuffle([...q.question_options]),
  }))
}

export async function saveAttempt(score: number, passed: boolean) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return
  await supabase.from('attempts').insert({ user_id: session.user.id, score, passed })
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password })
}

export async function signOut() {
  return supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}