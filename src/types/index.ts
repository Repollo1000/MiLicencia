export type Category = {
  id: number
  name: string
}

export type QuestionOption = {
  id: string
  question_id: string
  option_text: string
  is_correct: boolean
}

export type Question = {
  id: string
  text: string
  explanation: string
  image_url: string | null
  is_double_score: boolean
  category_id: number
  categories?: { name: string }
  question_options?: QuestionOption[]
}

export type QuestionWithOptions = Question & {
  categories: { name: string }
  question_options: QuestionOption[]
}

export type Answer = {
  question: QuestionWithOptions
  chosen: QuestionOption
  isCorrect: boolean
}

export type SimulacroResult = {
  score: number
  maxScore: number
  correct: number
  incorrect: number
  passed: boolean
  timeUsed: number
  answers: Answer[]
}

export type Attempt = {
  id: string
  user_id: string
  score: number
  passed: boolean
  created_at: string
}