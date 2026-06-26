import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSimulacroQuestions, saveAttempt } from '../lib/supabase'
import type { Answer, QuestionOption, QuestionWithOptions, SimulacroResult } from '../types'

const TIME_LIMIT = 45 * 60
const MIN_SCORE  = 33

export type SimulacroState = 'idle' | 'running' | 'finished'

export function useSimulacro() {
  const [state, setState]       = useState<SimulacroState>('idle')
  const [current, setCurrent]   = useState(0)
  const [answered, setAnswered] = useState(false)
  const [chosen, setChosen]     = useState<QuestionOption | null>(null)
  const [answers, setAnswers]   = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT)
  const [result, setResult]     = useState<SimulacroResult | null>(null)

  const answersRef = useRef<Answer[]>([])
  const timeRef    = useRef(TIME_LIMIT)

  const { data: questions, isLoading, error, refetch } = useQuery({
    queryKey: ['simulacro-questions'],
    queryFn: fetchSimulacroQuestions,
    enabled: false,
    staleTime: 0,
    gcTime: 0,
  })

  useEffect(() => {
    if (state !== 'running') return
    const t = setInterval(() => {
      timeRef.current -= 1
      setTimeLeft(timeRef.current)
      if (timeRef.current <= 0) {
        clearInterval(t)
        finish(answersRef.current, 0)
      }
    }, 1000)
    return () => clearInterval(t)
  }, [state])

  const start = useCallback(async () => {
    answersRef.current = []
    timeRef.current    = TIME_LIMIT
    setAnswers([])
    setCurrent(0)
    setAnswered(false)
    setChosen(null)
    setTimeLeft(TIME_LIMIT)
    setResult(null)
    setState('idle')
    await refetch()
    setState('running')
  }, [refetch])

  const select = useCallback((option: QuestionOption, question: QuestionWithOptions) => {
    if (answered) return
    const isCorrect = option.is_correct
    const newAnswer: Answer = { question, chosen: option, isCorrect }
    answersRef.current = [...answersRef.current, newAnswer]
    setAnswers([...answersRef.current])
    setChosen(option)
    setAnswered(true)
  }, [answered])

  const next = useCallback(() => {
    if (!questions || !Array.isArray(questions)) return
    if (current + 1 >= questions.length) {
      finish(answersRef.current, timeRef.current)
    } else {
      setCurrent(c => c + 1)
      setAnswered(false)
      setChosen(null)
    }
  }, [current, questions])

  const finish = useCallback((finalAnswers: Answer[], remainingTime: number) => {
    if (!questions || !Array.isArray(questions)) return
    const timeUsed = TIME_LIMIT - remainingTime
    let score = 0
    let maxScore = 0

    questions.forEach((q: QuestionWithOptions) => { maxScore += q.is_double_score ? 2 : 1 })
    finalAnswers.forEach(a => { if (a.isCorrect) score += a.question.is_double_score ? 2 : 1 })

    const passed = score >= MIN_SCORE
    const res: SimulacroResult = {
      score, maxScore, passed, timeUsed,
      correct:   finalAnswers.filter(a => a.isCorrect).length,
      incorrect: finalAnswers.filter(a => !a.isCorrect).length,
      answers:   finalAnswers,
    }
    setResult(res)
    setState('finished')
    saveAttempt(score, passed)
  }, [questions])

  const question = questions && Array.isArray(questions) ? questions[current] ?? null : null

  return {
    state, questions, question, current, answered, chosen,
    answers, timeLeft, result, isLoading,
    error: error as Error | null,
    start, select, next,
    progress: questions && Array.isArray(questions) ? ((current + 1) / questions.length) * 100 : 0,
    total: questions && Array.isArray(questions) ? questions.length : 35,
  }
}