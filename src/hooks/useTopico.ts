import { useState, useCallback, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { QuestionWithOptions, QuestionOption, Answer } from '../types'

const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5)

export type Chapter = {
  id: number
  name: string
  count: number
}

export async function fetchChapters(): Promise<Chapter[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, questions(count)')
    .order('name')

  if (error) throw new Error(error.message)

  return (data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    count: c.questions?.[0]?.count ?? 0,
  }))
}

async function fetchQuestionsByChapter(categoryId: number): Promise<QuestionWithOptions[]> {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      id, text, explanation, image_url, is_double_score, category_id,
      categories ( name ),
      question_options ( id, question_id, option_text, is_correct )
    `)
    .eq('category_id', categoryId)

  if (error) throw new Error(error.message)
  if (!data?.length) throw new Error('No hay preguntas para este capítulo.')

  return shuffle(data as any[]).map((q: any): QuestionWithOptions => ({
    ...q,
    categories: { name: q.categories?.name ?? '' },
    question_options: shuffle([...(q.question_options ?? [])]),
  }))
}

export type TopicoState = 'idle' | 'selecting' | 'running' | 'finished'

export function useTopico() {
  const [state, setState]           = useState<TopicoState>('selecting')
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [current, setCurrent]       = useState(0)
  const [answered, setAnswered]     = useState(false)
  const [chosen, setChosen]         = useState<QuestionOption | null>(null)
  const [answers, setAnswers]       = useState<Answer[]>([])
  const [streak, setStreak]         = useState(0)
  const [maxStreak, setMaxStreak]   = useState(0)

  const answersRef   = useRef<Answer[]>([])
  const streakRef    = useRef(0)
  const maxStreakRef = useRef(0)

  const chaptersQuery = useQuery({
    queryKey: ['chapters'],
    queryFn: fetchChapters,
    staleTime: 5 * 60 * 1000,
  })

  const questionsQuery = useQuery({
    queryKey: ['topico-questions', selectedChapter?.id],
    queryFn: () => fetchQuestionsByChapter(selectedChapter!.id),
    enabled: false,
    staleTime: 0,
    gcTime: 0,
  })

  const selectChapter = useCallback(async (chapter: Chapter) => {
    setSelectedChapter(chapter)
    answersRef.current   = []
    streakRef.current    = 0
    maxStreakRef.current = 0
    setAnswers([])
    setCurrent(0)
    setAnswered(false)
    setChosen(null)
    setStreak(0)
    setMaxStreak(0)
    setState('idle')
    await questionsQuery.refetch()
    setState('running')
  }, [questionsQuery])

  const select = useCallback((option: QuestionOption, question: QuestionWithOptions) => {
    if (answered) return
    const isCorrect = option.is_correct

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
    const questions = questionsQuery.data
    if (!questions || !Array.isArray(questions)) return
    if (current + 1 >= questions.length) {
      setState('finished')
    } else {
      setCurrent(c => c + 1)
      setAnswered(false)
      setChosen(null)
    }
  }, [current, questionsQuery.data])

  const backToSelection = useCallback(() => {
    setState('selecting')
    setSelectedChapter(null)
  }, [])

  const questions = questionsQuery.data
  const question  = questions && Array.isArray(questions) ? questions[current] ?? null : null
  const total     = questions && Array.isArray(questions) ? questions.length : 0

  return {
    // estado
    state, selectedChapter,
    chapters: chaptersQuery.data ?? [],
    chaptersLoading: chaptersQuery.isLoading,
    question, current, total, answered, chosen,
    answers, streak, maxStreak,
    correct:   answers.filter(a => a.isCorrect).length,
    incorrect: answers.filter(a => !a.isCorrect).length,
    isLoading: questionsQuery.isLoading || state === 'idle',
    error: (questionsQuery.error ?? chaptersQuery.error) as Error | null,
    progress: total ? ((current + 1) / total) * 100 : 0,
    // acciones
    selectChapter, select, next, backToSelection,
  }
}