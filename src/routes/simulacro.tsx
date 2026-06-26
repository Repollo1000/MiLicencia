import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useSimulacro } from '../hooks/useSimulacro'
import { Quiz } from '../components/Quiz'
import { ResultScreen } from '../components/ResultScreen'

export const Route = createFileRoute('/simulacro')({
  component: SimulacroPage,
})

function SimulacroPage() {
  const sim      = useSimulacro()
  const navigate = useNavigate()

  // Arrancar el simulacro al montar
  useEffect(() => { sim.start() }, [])

  // Loading
  if (sim.isLoading || sim.state === 'idle') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-100 border-t-[#1D9E75] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando preguntas...</p>
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

  // Resultado
  if (sim.state === 'finished' && sim.result) {
    return (
      <ResultScreen
        result={sim.result}
        onRetry={() => sim.start()}
        onHome={() => navigate({ to: '/' })}
      />
    )
  }

  // Quiz
  return (
    <Quiz
      sim={sim}
      onExit={() => navigate({ to: '/' })}
    />
  )
}