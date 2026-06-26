import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Navbar } from '../components/Navbar'
import { AuthModal } from '../components/AuthModal'
import { useAuth } from '../hooks/useAuth'

export const Route = createFileRoute('/')({
  component: HomePage,
})

const STATS = [
  { n: '35', label: 'preguntas' },
  { n: '45', label: 'minutos' },
  { n: '33', label: 'pts para aprobar' },
  { n: '3',  label: 'doble puntaje' },
]

const FEATURES = [
  ['100% gratis',               'Sin versión premium, sin límite de intentos'],
  ['Explicación en cada pregunta', 'Aprende por qué cada respuesta es correcta'],
  ['Preguntas aleatorias',      'Cada simulacro es diferente, como el examen real'],
  ['Sin registro obligatorio',  'Entra y practica de inmediato'],
]

function HomePage() {
  const [showAuth, setShowAuth] = useState(false)
  const { user } = useAuth()
  const navigate  = useNavigate()

  return (
    <>
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar onLoginClick={() => setShowAuth(true)} />

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 pb-16">
          {/* Hero */}
          <section className="text-center py-12">
            <span className="inline-block text-xs font-medium text-[#1D9E75] bg-[#E1F5EE] rounded-full px-3 py-1 mb-5 tracking-wide">
              Licencia Clase B · Chile · Gratis
            </span>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 mb-4">
              Practica el teórico<br />y aprueba a la primera
            </h1>
            <p className="text-base text-gray-500 leading-relaxed max-w-md mx-auto mb-8">
              Simulacros gratuitos basados en el banco oficial CONASET.
              Sin registro, sin límites, sin pagos.
            </p>

            {/* Modos */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-2">
              <button
                onClick={() => navigate({ to: '/simulacro' })}
                className="inline-flex flex-col items-center bg-gray-900 text-white rounded-2xl px-7 py-4 hover:bg-gray-700 transition-colors"
              >
                <span className="text-[15px] font-medium">🎯 Simulacro oficial</span>
                <span className="text-xs text-gray-400 mt-0.5">35 preguntas · 45 min · como el examen real</span>
              </button>
              <button
                onClick={() => navigate({ to: '/repaso' })}
                className="inline-flex flex-col items-center bg-purple-600 text-white rounded-2xl px-7 py-4 hover:bg-purple-700 transition-colors"
              >
                <span className="text-[15px] font-medium">⚡ Repaso Extremo</span>
                <span className="text-xs text-purple-200 mt-0.5">Todas las preguntas · corrección al instante</span>
              </button>
              <button
                onClick={() => navigate({ to: '/topico' })}
                className="inline-flex flex-col items-center bg-blue-600 text-white rounded-2xl px-7 py-4 hover:bg-blue-700 transition-colors"
              >
                <span className="text-[15px] font-medium">📖 Por tópico</span>
                <span className="text-xs text-blue-200 mt-0.5">9 capítulos del libro CONASET</span>
              </button>
            </div>

            {!user && (
              <p className="mt-4 text-sm text-gray-400">
                <button
                  onClick={() => setShowAuth(true)}
                  className="underline text-[#1D9E75] hover:text-[#0F6E56]"
                >
                  Regístrate gratis
                </button>
                {' '}para guardar tu historial
              </p>
            )}
          </section>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mb-10">
            {STATS.map(({ n, label }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                <span className="block text-3xl font-bold text-gray-900">{n}</span>
                <span className="block text-xs text-gray-500 mt-1">{label}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            {FEATURES.map(([title, desc]) => (
              <div key={title} className="flex gap-4 items-start p-4 border border-gray-100 rounded-xl">
                <span className="text-[#1D9E75] font-bold text-base mt-0.5 flex-shrink-0">✓</span>
                <div>
                  <strong className="block text-sm text-gray-900 mb-0.5">{title}</strong>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}