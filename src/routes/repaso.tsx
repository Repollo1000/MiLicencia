import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useRepaso } from '../hooks/useRepaso'
import { RepasoQuiz } from '../components/RepasoQuiz'
import { RepasoResult } from '../components/RepasoResult'

export const Route = createFileRoute('/repaso')({
  component: RepasoPage,
})

function RepasoPage() {
  const sim      = useRepaso()
  const navigate = useNavigate()

  useEffect(() => { sim.start() }, [])

  // Loading
  if (sim.isLoading || sim.state === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-100 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando todas las preguntas...</p>
          <p className="text-gray-400 text-xs mt-1">Modo Repaso Extremo</p>
        </div>
      </div>
    )
  }

  // Error
  if (sim.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center max-w-sm">
          <p className="text-[#D85A30] mb-4">{sim.error.message}</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="border border-gray-200 rounded-xl px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Resultado final
  if (sim.state === 'finished') {
    return (
      <RepasoResult
        correct={sim.correct}
        incorrect={sim.incorrect}
        total={sim.total}
        maxStreak={sim.maxStreak}
        answers={sim.answers}
        onRetry={() => sim.start()}
        onHome={() => navigate({ to: '/' })}
      />
    )
  }

  // Quiz
  return (
    <RepasoQuiz
      sim={sim}
      onExit={() => navigate({ to: '/' })}
    />
  )
}