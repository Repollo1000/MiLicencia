import { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTopico } from '../hooks/useTopico'
import { RepasoQuiz } from '../components/RepasoQuiz'
import { RepasoResult } from '../components/RepasoResult'
import type { Chapter } from '../hooks/useTopico'
import type { QuestionOption, QuestionWithOptions } from '../types'

export const Route = createFileRoute('/topico')({
  component: TopicoPage,
})

// Emoji por capítulo
const CHAPTER_EMOJI: Record<string, string> = {
  'Los siniestros de tránsito':           '🚨',
  'Los principios de la conducción':      '⚙️',
  'Convivencia Vial':                     '🤝',
  'La persona en el tránsito':            '🧠',
  'Las y los usuarios vulnerables':       '🚲',
  'Normas de circulación':                '🛑',
  'Conducción en circunstancias especiales': '🌧️',
  'Conducción eficiente':                 '🌿',
  'Informaciones importantes':            '📋',
}

function ChapterCard({ chapter, onSelect }: { chapter: Chapter; onSelect: (c: Chapter) => void }) {
  const emoji = CHAPTER_EMOJI[chapter.name] ?? '📖'
  return (
    <button
      onClick={() => onSelect(chapter)}
      className="w-full text-left p-4 rounded-2xl border-[1.5px] border-gray-100 hover:border-[#1D9E75] hover:bg-[#F0FBF7] transition-all duration-150 flex items-center gap-4"
    >
      <span className="text-2xl flex-shrink-0 w-10 text-center">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[15px] text-gray-900 leading-snug">{chapter.name}</p>
        <p className="text-[12px] text-gray-400 mt-0.5">{chapter.count} preguntas</p>
      </div>
      <span className="text-gray-300 flex-shrink-0">→</span>
    </button>
  )
}

function TopicoPage() {
  const sim      = useTopico()
  const navigate = useNavigate()

  // Pantalla de selección
  if (sim.state === 'selecting') {
    return (
      <div className="min-h-screen bg-white">
        <nav className="border-b border-gray-100 px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/' })}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            ← Inicio
          </button>
          <div className="flex items-center gap-2 ml-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-[15px]">Práctica por tópico</span>
          </div>
        </nav>

        <div className="max-w-lg mx-auto px-5 py-6">
          <p className="text-sm text-gray-500 mb-5">
            Elige un capítulo del Libro para la Conducción y practica solo esas preguntas.
          </p>

          {sim.chaptersLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-[3px] border-gray-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Cargando capítulos...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sim.chapters.map(chapter => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  onSelect={sim.selectChapter}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Loading
  if (sim.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-9 h-9 border-[3px] border-gray-100 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando preguntas...</p>
          {sim.selectedChapter && (
            <p className="text-gray-400 text-xs mt-1">{sim.selectedChapter.name}</p>
          )}
        </div>
      </div>
    )
  }

  // Error
  if (sim.error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-[#D85A30] mb-4">{sim.error.message}</p>
          <button
            onClick={sim.backToSelection}
            className="border border-gray-200 rounded-xl px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Volver a capítulos
          </button>
        </div>
      </div>
    )
  }

  // Resultado
  if (sim.state === 'finished') {
    return (
      <RepasoResult
        correct={sim.correct}
        incorrect={sim.incorrect}
        total={sim.total}
        maxStreak={sim.maxStreak}
        answers={sim.answers}
        onRetry={() => sim.selectedChapter && sim.selectChapter(sim.selectedChapter)}
        onHome={() => navigate({ to: '/' })}
      />
    )
  }

  // Quiz — reutilizamos RepasoQuiz con onExit hacia la selección
  if (sim.state === 'running' && sim.question) {
    // Adaptamos la interfaz de useTopico para que sea compatible con RepasoQuiz
    const simAdapter = {
      question: sim.question,
      current:  sim.current,
      total:    sim.total,
      answered: sim.answered,
      chosen:   sim.chosen,
      streak:   sim.streak,
      correct:  sim.correct,
      incorrect: sim.incorrect,
      progress: sim.progress,
      select:   (opt: QuestionOption, q: QuestionWithOptions) => sim.select(opt, q),
      next:     sim.next,
    }

    return (
      <div className="flex flex-col min-h-screen bg-white">
        {/* Topbar con capítulo actual */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between gap-3">
          <button
            onClick={sim.backToSelection}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            ← Capítulos
          </button>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#1D9E75] font-medium">✓ {sim.correct}</span>
            <span className="text-[#D85A30] font-medium">✗ {sim.incorrect}</span>
            {sim.streak >= 2 && (
              <span className="font-semibold text-orange-500 animate-pulse">
                🔥 {sim.streak}
              </span>
            )}
          </div>

          <span className="text-sm text-gray-400 flex-shrink-0">
            {sim.current + 1} / {sim.total}
          </span>
        </div>

        {/* Barra de progreso azul (diferencia del repaso) */}
        <div className="h-[3px] bg-gray-100">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${sim.progress}%` }}
          />
        </div>

        {/* Nombre del capítulo */}
        <div className="max-w-2xl mx-auto w-full px-5 pt-4 pb-0">
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
            {CHAPTER_EMOJI[sim.selectedChapter?.name ?? ''] ?? '📖'} {sim.selectedChapter?.name}
          </span>
        </div>

        {/* Cuerpo del quiz */}
        <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-4">
          {/* Badge doble puntaje */}
          {sim.question.is_double_score && (
            <div className="mb-3">
              <span className="text-[12px] px-3 py-1 rounded-full bg-yellow-50 text-orange-600 border border-yellow-200">
                ⭐ Vale 2 puntos
              </span>
            </div>
          )}

          <h2 className="text-[17px] font-medium leading-relaxed text-gray-900 mb-5">
            {sim.question.text}
          </h2>

          {sim.question.image_url && (
            <div className="mb-5 rounded-xl overflow-hidden border border-gray-100">
              <img src={sim.question.image_url} alt="Imagen de la pregunta"
                className="w-full max-h-64 object-contain bg-gray-50" />
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {(sim.question.question_options as QuestionOption[]).map((opt: QuestionOption, i: number) => {
              const base = 'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border-[1.5px] text-left transition-all duration-150'
              let cls = ''
              if (!sim.answered) cls = `${base} border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer`
              else if (opt.is_correct) cls = `${base} border-[#1D9E75] bg-[#E1F5EE] cursor-default`
              else if (sim.chosen?.id === opt.id) cls = `${base} border-[#D85A30] bg-[#FAECE7] cursor-default`
              else cls = `${base} border-gray-100 opacity-40 cursor-default`

              let letterCls = 'w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0'
              if (!sim.answered) letterCls += ' border border-gray-200 text-gray-500'
              else if (opt.is_correct) letterCls += ' bg-[#1D9E75] border-[#1D9E75] text-white'
              else if (sim.chosen?.id === opt.id) letterCls += ' bg-[#D85A30] border-[#D85A30] text-white'
              else letterCls += ' border-gray-200 text-gray-400'

              return (
                <button key={opt.id} className={cls}
                  onClick={() => sim.select(opt, sim.question as QuestionWithOptions)}
                  disabled={sim.answered}
                >
                  <span className={letterCls}>{['A','B','C','D'][i]}</span>
                  <span className="flex-1 text-sm text-gray-800 leading-snug">{opt.option_text}</span>
                  {sim.answered && opt.is_correct && <span className="text-[#1D9E75]">✓</span>}
                  {sim.answered && sim.chosen?.id === opt.id && !opt.is_correct && <span className="text-[#D85A30]">✗</span>}
                </button>
              )
            })}
          </div>

          {sim.answered && (
            <div className={`mt-4 px-4 py-4 rounded-xl text-sm leading-relaxed border-l-4 ${
              sim.chosen?.is_correct
                ? 'bg-[#E1F5EE] border-[#1D9E75] text-[#085041]'
                : 'bg-orange-50 border-orange-300 text-gray-700'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <strong className="text-[13px]">
                  {sim.chosen?.is_correct ? '¡Correcto!' : 'Respuesta incorrecta'}
                </strong>
                {sim.chosen?.is_correct && sim.streak >= 2 && (
                  <span className="text-xs font-semibold text-orange-500 ml-auto">
                    🔥 {sim.streak} seguidas
                  </span>
                )}
              </div>
              <p>{sim.question.explanation}</p>
            </div>
          )}

          {sim.answered && (
            <button onClick={sim.next}
              className="mt-5 w-full bg-blue-600 text-white rounded-xl py-3.5 text-[15px] font-medium hover:bg-blue-700 transition-colors"
            >
              {sim.current + 1 === sim.total ? 'Ver resultado' : 'Siguiente →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  return null
}