import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { QuestionWithOptions, QuestionOption, Answer } from '@/types'

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

async function fetchAllQuestions(): Promise<QuestionWithOptions[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, text, explanation, image_url, is_double_score, category_id,
      categories ( name ),
      question_options ( id, question_id, option_text, is_correct )
    `)

  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('No hay preguntas en la base de datos.')

  return shuffle(data as QuestionWithOptions[]).map(q => ({
    ...q,
    question_options: shuffle(q.question_options ?? []),
  }))
}

export type RepasoState = 'idle' | 'running' | 'finished'

export function useRepaso() {
  const [state, setState]       = useState<RepasoState>('idle')
  const [current, setCurrent]   = useState(0)
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen]     = useState<QuestionOption | null>(null)
  const [answers, setAnswers]   = useState<Answer[]>([])
  const [streak, setStreak]     = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const answersRef  = useRef<Answer[]>([])
  const streakRef   = useRef(0)
  const maxStreakRef = useRef(0)

  const { data: questions, isLoading, error, refetch } = useQuery({
    queryKey: ['repaso-questions'],
    queryFn: fetchAllQuestions,
    enabled: false,
    staleTime: 0,
    gcTime: 0,
  })

  const start = useCallback(async () => {
    answersRef.current  = []
    streakRef.current   = 0
    maxStreakRef.current = 0
    setAnswers([])
    setCurrent(0)
    setAnswered(false)
    setChosen(null)
    setStreak(0)
    setMaxStreak(0)
    setState('idle')
    await refetch()
    setState('running')
  }, [refetch])

  const select = useCallback((option: QuestionOption, question: QuestionWithOptions) => {
    if (answered) return
    const isCorrect = option.is_correct

    // Actualizar racha
    if (isCorrect) {
      streakRef.current += 1
      if (streakRef.current > maxStreakRef.current) {
        maxStreakRef.current = streakRef.current
        setMaxStreak(streakRef.current)
      }
    } else {
      streakRef.current = 0
    }
    setStreak(streakRef.current)

    const newAnswer: Answer = { question, chosen: option, isCorrect }
    answersRef.current = [...answersRef.current, newAnswer]
    setAnswers([...answersRef.current])
    setChosen(option)
    setAnswered(true)
  }, [answered])

  const next = useCallback(() => {
    if (!questions) return
    if (current + 1 >= questions.length) {
      setState('finished')
    } else {
      setCurrent(c => c + 1)
      setAnswered(false)
      setChosen(null)
    }
  }, [current, questions])

  const question = questions?.[current] ?? null
  const total    = questions?.length ?? 0
  const correct  = answers.filter(a => a.isCorrect).length
  const incorrect = answers.filter(a => !a.isCorrect).length

  return {
    state, question, current, total, answered, chosen,
    answers, streak, maxStreak, correct, incorrect,
    isLoading, error: error as Error | null,
    progress: total ? ((current + 1) / total) * 100 : 0,
    start, select, next,
  }
}