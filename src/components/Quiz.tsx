import type { QuestionOption, QuestionWithOptions } from '../types'
import type { useSimulacro } from '../hooks/useSimulacro'

const LETTERS = ['A', 'B', 'C', 'D']

function fmtTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

type Props = {
  sim: ReturnType<typeof useSimulacro>
  onExit: () => void
}

export function Quiz({ sim, onExit }: Props) {
  const { question, current, total, answered, chosen, timeLeft, progress, select, next } = sim

  if (!question) return null

  const getOptionStyle = (opt: QuestionOption) => {
    const base = 'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-[1.5px] text-left transition-all'
    if (!answered) return `${base} border-gray-200 hover:border-[#1D9E75] hover:bg-[#F0FBF7] cursor-pointer`
    if (opt.is_correct) return `${base} border-[#1D9E75] bg-[#E1F5EE] cursor-default`
    if (chosen?.id === opt.id) return `${base} border-[#D85A30] bg-[#FAECE7] cursor-default`
    return `${base} border-gray-100 opacity-50 cursor-default`
  }

  const getLetterStyle = (opt: QuestionOption) => {
    const base = 'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0'
    if (!answered) return `${base} border border-gray-200 text-gray-500`
    if (opt.is_correct) return `${base} bg-[#1D9E75] border-[#1D9E75] text-white`
    if (chosen?.id === opt.id) return `${base} bg-[#D85A30] border-[#D85A30] text-white`
    return `${base} border-gray-200 text-gray-400`
  }

  const timerWarn = timeLeft < 300

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between">
        <button
          onClick={onExit}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          ← Salir
        </button>
        <span className="text-sm font-medium text-gray-700">
          <strong>{current + 1}</strong>
          <span className="text-gray-400 font-normal"> de {total}</span>
        </span>
        <span className={`text-sm font-medium tabular-nums ${timerWarn ? 'text-[#D85A30]' : 'text-[#1D9E75]'}`}>
          ⏱ {fmtTime(timeLeft)}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="h-[3px] bg-gray-100">
        <div
          className="h-full bg-[#1D9E75] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Cuerpo */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-6">

        {/* Badges */}
        <div className="flex gap-2 flex-wrap mb-3 min-h-[26px]">
          {question.is_double_score && (
            <span className="text-[12px] px-3 py-1 rounded-full bg-yellow-50 text-orange-600 border border-yellow-200">
              ⭐ Vale 2 puntos
            </span>
          )}
          {question.categories?.name && (
            <span className="text-[12px] px-3 py-1 rounded-full bg-gray-100 text-gray-500">
              {question.categories.name}
            </span>
          )}
        </div>

        {/* Pregunta */}
        <h2 className="text-[17px] font-medium leading-relaxed text-gray-900 mb-5">
          {question.text}
        </h2>

        {/* Imagen */}
        {question.image_url && (
          <div className="mb-5 rounded-xl overflow-hidden border border-gray-100">
            <img
              src={question.image_url}
              alt="Imagen de la pregunta"
              className="w-full max-h-64 object-contain bg-gray-50"
            />
          </div>
        )}

        {/* Opciones */}
        <div className="flex flex-col gap-2.5">
          {(question.question_options as QuestionOption[]).map((opt: QuestionOption, i: number) => (
            <button
              key={opt.id}
              className={getOptionStyle(opt)}
              onClick={() => select(opt, question as QuestionWithOptions)}
              disabled={answered}
            >
              <span className={getLetterStyle(opt)}>
                {LETTERS[i]}
              </span>
              <span className="flex-1 text-sm text-gray-800 leading-snug">
                {opt.option_text}
              </span>
              {answered && opt.is_correct && (
                <span className="text-[#1D9E75] text-base flex-shrink-0">✓</span>
              )}
              {answered && chosen?.id === opt.id && !opt.is_correct && (
                <span className="text-[#D85A30] text-base flex-shrink-0">✗</span>
              )}
            </button>
          ))}
        </div>

        {/* Explicación */}
        {answered && (
          <div className={`mt-4 px-4 py-4 rounded-xl text-sm leading-relaxed ${
            chosen?.is_correct
              ? 'bg-[#E1F5EE] border-l-4 border-[#1D9E75] text-[#085041]'
              : 'bg-orange-50 border-l-4 border-orange-300 text-gray-700'
          }`}>
            <strong className="block text-[13px] mb-1">
              {chosen?.is_correct ? '¡Correcto!' : 'Respuesta incorrecta'}
            </strong>
            {question.explanation}
          </div>
        )}

        {/* Botón siguiente */}
        {answered && (
          <button
            onClick={next}
            className="mt-5 w-full bg-gray-900 text-white rounded-xl py-3.5 text-[15px] font-medium hover:bg-gray-700 transition-colors"
          >
            {current + 1 === total ? 'Ver resultado' : 'Siguiente →'}
          </button>
        )}
      </div>
    </div>
  )
}