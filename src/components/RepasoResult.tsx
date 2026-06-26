import type { Answer } from '@/types'

type Props = {
  correct: number
  incorrect: number
  total: number
  maxStreak: number
  answers: Answer[]
  onRetry: () => void
  onHome: () => void
}

export function RepasoResult({ correct, incorrect, total, maxStreak, onRetry, onHome }: Props) {
  const pct = Math.round((correct / total) * 100)

  const grade = () => {
    if (pct >= 90) return { label: '¡Excelente!', color: 'text-[#085041]', bg: 'bg-[#E1F5EE]' }
    if (pct >= 75) return { label: 'Muy bien', color: 'text-[#085041]', bg: 'bg-[#E1F5EE]' }
    if (pct >= 60) return { label: 'Bien, sigue practicando', color: 'text-orange-700', bg: 'bg-orange-50' }
    return { label: 'Necesitas más práctica', color: 'text-[#4A1B0C]', bg: 'bg-[#FFF1EC]' }
  }

  const { label, color, bg } = grade()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]" />
        <span className="font-semibold text-[15px]">MiLicencia</span>
        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
          Repaso Extremo
        </span>
      </nav>

      <div className="max-w-md mx-auto px-5 py-6 pb-16">

        {/* Veredicto */}
        <div className={`rounded-2xl p-6 text-center mb-4 ${bg}`}>
          <div className="text-4xl mb-3">
            {pct >= 90 ? '🏆' : pct >= 75 ? '🎯' : pct >= 60 ? '💪' : '📚'}
          </div>
          <h1 className={`text-xl font-semibold mb-1 ${color}`}>{label}</h1>
          <p className="text-sm text-gray-500">
            Completaste {total} preguntas del banco completo
          </p>
        </div>

        {/* Puntaje */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 mb-4">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold text-gray-900">{correct}</span>
            <span className="text-base text-gray-400">/ {total}</span>
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
            <span className="block text-xl font-semibold text-orange-500">
              🔥 {maxStreak}
            </span>
            <span className="block text-[12px] text-gray-500 mt-0.5">Mejor racha</span>
          </div>
        </div>

        {/* Barra visual */}
        <div className="mb-8">
          <div className="flex justify-between text-[12px] text-gray-400 mb-1.5">
            <span>Incorrectas</span>
            <span>Correctas</span>
          </div>
          <div className="flex h-2.5 rounded-full overflow-hidden bg-[#FAECE7]">
            <div
              className="bg-[#1D9E75] rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className="w-full bg-gray-900 text-white rounded-xl py-3.5 text-[15px] font-medium hover:bg-gray-700 transition-colors"
          >
            Repetir repaso
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