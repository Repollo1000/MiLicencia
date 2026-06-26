import type { SimulacroResult } from '../types'

const MIN_SCORE = 33

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m} min ${sec} seg`
}

type Props = {
  result: SimulacroResult
  onRetry: () => void
  onHome: () => void
}

export function ResultScreen({ result, onRetry, onHome }: Props) {
  const { score, maxScore, correct, incorrect, passed, timeUsed } = result
  const pct          = Math.round((score / maxScore) * 100)
  const thresholdPct = (MIN_SCORE / maxScore) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]" />
        <span className="font-semibold text-[15px]">MiLicencia</span>
      </nav>

      <div className="max-w-md mx-auto px-5 py-6 pb-16">

        {/* Veredicto */}
        <div className={`rounded-2xl p-6 text-center mb-4 ${passed ? 'bg-[#E1F5EE]' : 'bg-orange-50'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-3 ${
            passed ? 'bg-[#1D9E75] text-white' : 'bg-[#D85A30] text-white'
          }`}>
            {passed ? '✓' : '✗'}
          </div>
          <h1 className={`text-xl font-semibold mb-1 ${passed ? 'text-[#085041]' : 'text-[#4A1B0C]'}`}>
            {passed ? 'Aprobado' : 'Reprobado'}
          </h1>
          <p className={`text-sm ${passed ? 'text-[#0F6E56]' : 'text-orange-700'}`}>
            {passed
              ? '¡Alcanzaste el puntaje mínimo!'
              : `Necesitas al menos ${MIN_SCORE} puntos para aprobar.`}
          </p>
        </div>

        {/* Puntaje */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold text-gray-900">{score}</span>
            <span className="text-base text-gray-400">/ {maxScore} pts</span>
          </div>
          <span className="text-2xl font-semibold text-[#1D9E75]">{pct}%</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="block text-xl font-semibold text-[#1D9E75]">{correct}</span>
            <span className="block text-[12px] text-gray-500 mt-0.5">Correctas</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="block text-xl font-semibold text-[#D85A30]">{incorrect}</span>
            <span className="block text-[12px] text-gray-500 mt-0.5">Incorrectas</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <span className="block text-base font-semibold text-gray-800">{fmtTime(timeUsed)}</span>
            <span className="block text-[12px] text-gray-500 mt-0.5">Tiempo</span>
          </div>
        </div>

        {/* Barra de umbral */}
        <div className="mb-8">
          <div className="relative h-2 bg-gray-100 rounded-full">
            <div
              className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${passed ? 'bg-[#1D9E75]' : 'bg-[#D85A30]'}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
            {/* Marca del mínimo */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gray-700 rounded-full"
              style={{ left: `${thresholdPct}%` }}
            >
              <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[11px] text-gray-500 whitespace-nowrap">
                {MIN_SCORE} pts mín.
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full bg-gray-900 text-white rounded-xl py-3.5 text-[15px] font-medium hover:bg-gray-700 transition-colors"
          >
            Nuevo simulacro
          </button>
          <button
            onClick={onHome}
            className="w-full border border-gray-200 text-gray-600 rounded-xl py-3.5 text-[15px] hover:bg-gray-50 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )
}