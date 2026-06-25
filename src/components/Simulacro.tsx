import { useState, useEffect, useCallback, useRef } from 'react'
import type { Question, QuestionOption } from '../lib/supabase'
import { fetchSimulacroQuestions, saveAttempt, signIn, signUp, signOut, getSession } from '../lib/supabase'

// ─── Constantes ───────────────────────────────────────────────────────────────
const TIME_LIMIT = 45 * 60 // 45 minutos
const MIN_SCORE  = 33

// ─── Tipos locales ────────────────────────────────────────────────────────────
type Answer = {
  question: Question
  chosenOption: QuestionOption
  isCorrect: boolean
}

type Screen = 'home' | 'auth' | 'loading' | 'quiz' | 'result'

type Result = {
  score: number
  maxScore: number
  correct: number
  incorrect: number
  passed: boolean
  timeUsed: number
  answers: Answer[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function calcMaxScore(questions: Question[]) {
  return questions.reduce((acc, q) => acc + (q.is_double_score ? 2 : 1), 0)
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Simulacro() {
  const [screen, setScreen]         = useState<Screen>('home')
  const [questions, setQuestions]   = useState<Question[]>([])
  const [current, setCurrent]       = useState(0)
  const [chosen, setChosen]         = useState<QuestionOption | null>(null)
  const [answered, setAnswered]     = useState(false)
  const [answers, setAnswers]       = useState<Answer[]>([])
  const [timeLeft, setTimeLeft]     = useState(TIME_LIMIT)
  const [result, setResult]         = useState<Result | null>(null)
  const [error, setError]           = useState('')
  const [userEmail, setUserEmail]   = useState<string | null>(null)

  // Auth form state
  const [authMode, setAuthMode]     = useState<'login' | 'register'>('login')
  const [authEmail, setAuthEmail]   = useState('')
  const [authPass, setAuthPass]     = useState('')
  const [authError, setAuthError]   = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  const answersRef = useRef<Answer[]>([])

  // Chequear sesión al montar
  useEffect(() => {
    getSession().then(s => { if (s) setUserEmail(s.user.email ?? null) })
  }, [])

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (screen !== 'quiz') return
    if (timeLeft <= 0) { finishQuiz(answersRef.current); return }
    const t = setTimeout(() => setTimeLeft(x => x - 1), 1000)
    return () => clearTimeout(t)
  }, [screen, timeLeft])

  // ── Lógica del quiz ────────────────────────────────────────────────────────
  const startQuiz = async () => {
    setScreen('loading')
    setError('')
    try {
      const qs = await fetchSimulacroQuestions()
      setQuestions(qs)
      setAnswers([])
      answersRef.current = []
      setCurrent(0)
      setChosen(null)
      setAnswered(false)
      setTimeLeft(TIME_LIMIT)
      setScreen('quiz')
    } catch (e: any) {
      setError('No se pudieron cargar las preguntas. Intenta de nuevo.')
      setScreen('home')
    }
  }

  const handleSelect = (option: QuestionOption) => {
    if (answered) return
    const q = questions[current]
    const isCorrect = option.is_correct
    const newAnswer: Answer = { question: q, chosenOption: option, isCorrect }
    const newAnswers = [...answersRef.current, newAnswer]
    answersRef.current = newAnswers
    setAnswers(newAnswers)
    setChosen(option)
    setAnswered(true)
  }

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      finishQuiz(answersRef.current)
    } else {
      setCurrent(c => c + 1)
      setChosen(null)
      setAnswered(false)
    }
  }

  const finishQuiz = useCallback((finalAnswers: Answer[]) => {
    const timeUsed = TIME_LIMIT - timeLeft
    let score = 0
    finalAnswers.forEach(a => {
      if (a.isCorrect) score += a.question.is_double_score ? 2 : 1
    })
    const maxScore = calcMaxScore(questions)
    const passed = score >= MIN_SCORE
    const res: Result = {
      score, maxScore, passed, timeUsed,
      correct: finalAnswers.filter(a => a.isCorrect).length,
      incorrect: finalAnswers.filter(a => !a.isCorrect).length,
      answers: finalAnswers,
    }
    setResult(res)
    setScreen('result')
    saveAttempt(score, passed)
  }, [questions, timeLeft])

  // ── Auth ───────────────────────────────────────────────────────────────────
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      if (authMode === 'login') {
        const { error } = await signIn(authEmail, authPass)
        if (error) { setAuthError('Correo o contraseña incorrectos'); return }
        const s = await getSession()
        setUserEmail(s?.user.email ?? null)
        setScreen('home')
      } else {
        const { error } = await signUp(authEmail, authPass)
        if (error) { setAuthError('Error al registrarse: ' + error.message); return }
        setAuthError('')
        setAuthMode('login')
        setAuthEmail('')
        setAuthPass('')
        alert('Revisa tu correo para confirmar la cuenta.')
      }
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    setUserEmail(null)
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // ── HOME ──────────────────────────────────────────────────────────────────
  if (screen === 'home') return (
    <div className="ml-app">
      <nav className="ml-nav">
        <div className="ml-nav-logo">
          <span className="ml-dot" />
          MiLicencia
        </div>
        <div className="ml-nav-right">
          {userEmail ? (
            <>
              <span className="ml-user-email">{userEmail}</span>
              <button className="ml-btn-ghost" onClick={handleSignOut}>Salir</button>
            </>
          ) : (
            <button className="ml-btn-ghost" onClick={() => setScreen('auth')}>
              Iniciar sesión
            </button>
          )}
        </div>
      </nav>

      <main className="ml-home">
        <div className="ml-hero">
          <span className="ml-hero-tag">Licencia Clase B · Chile · Gratis</span>
          <h1 className="ml-hero-title">Practica el teórico<br />y aprueba a la primera</h1>
          <p className="ml-hero-sub">
            Simulacros basados en el banco oficial CONASET.
            Sin registro, sin límites, sin pagos.
          </p>
          {error && <p className="ml-error">{error}</p>}
          <button className="ml-btn-primary" onClick={startQuiz}>
            Comenzar simulacro →
          </button>
          {!userEmail && (
            <p className="ml-hint">
              <button className="ml-link" onClick={() => setScreen('auth')}>Regístrate gratis</button>
              {' '}para guardar tu historial
            </p>
          )}
        </div>

        <div className="ml-stats-row">
          {[
            { n: '35', label: 'preguntas' },
            { n: '45', label: 'minutos' },
            { n: '33', label: 'puntos para aprobar' },
            { n: '3', label: 'preguntas doble puntaje' },
          ].map(({ n, label }) => (
            <div key={label} className="ml-stat">
              <span className="ml-stat-n">{n}</span>
              <span className="ml-stat-label">{label}</span>
            </div>
          ))}
        </div>

        <div className="ml-features">
          {[
            ['100% gratis', 'Sin versión premium, sin límite de intentos'],
            ['Explicación en cada pregunta', 'Aprende por qué cada respuesta es correcta'],
            ['Preguntas aleatorias', 'Cada simulacro es diferente, como el examen real'],
            ['Sin registro obligatorio', 'Entra y practica de inmediato'],
          ].map(([title, desc]) => (
            <div key={title} className="ml-feature">
              <span className="ml-feature-check">✓</span>
              <div>
                <strong>{title}</strong>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )

  // ── AUTH ──────────────────────────────────────────────────────────────────
  if (screen === 'auth') return (
    <div className="ml-app ml-app-center">
      <div className="ml-auth-card">
        <button className="ml-back" onClick={() => setScreen('home')}>← Volver</button>
        <div className="ml-nav-logo ml-auth-logo">
          <span className="ml-dot" />MiLicencia
        </div>

        <div className="ml-tabs">
          <button
            className={`ml-tab${authMode === 'login' ? ' ml-tab-active' : ''}`}
            onClick={() => { setAuthMode('login'); setAuthError('') }}
          >Iniciar sesión</button>
          <button
            className={`ml-tab${authMode === 'register' ? ' ml-tab-active' : ''}`}
            onClick={() => { setAuthMode('register'); setAuthError('') }}
          >Registrarse</button>
        </div>

        <form className="ml-form" onSubmit={handleAuth}>
          <label className="ml-label">
            Correo electrónico
            <input
              className="ml-input"
              type="email"
              placeholder="tu@correo.cl"
              value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              required
            />
          </label>
          <label className="ml-label">
            Contraseña
            <input
              className="ml-input"
              type="password"
              placeholder={authMode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={authPass}
              onChange={e => setAuthPass(e.target.value)}
              required
              minLength={6}
            />
          </label>
          {authError && <p className="ml-error">{authError}</p>}
          <button className="ml-btn-primary" type="submit" disabled={authLoading}>
            {authLoading ? 'Procesando...' : authMode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button className="ml-link ml-skip" onClick={() => setScreen('home')}>
          Practicar sin registrarse
        </button>
      </div>
    </div>
  )

  // ── LOADING ───────────────────────────────────────────────────────────────
  if (screen === 'loading') return (
    <div className="ml-app ml-app-center">
      <div className="ml-loading">
        <div className="ml-spinner" />
        <p>Cargando preguntas...</p>
      </div>
    </div>
  )

  // ── QUIZ ──────────────────────────────────────────────────────────────────
  if (screen === 'quiz' && questions.length > 0) {
    const q = questions[current]
    const progress = ((current + 1) / questions.length) * 100
    const timerWarning = timeLeft < 300

    const getOptionClass = (opt: QuestionOption) => {
      if (!answered) return 'ml-option'
      if (opt.is_correct) return 'ml-option ml-option-correct'
      if (chosen?.id === opt.id && !opt.is_correct) return 'ml-option ml-option-wrong'
      return 'ml-option ml-option-dim'
    }

    return (
      <div className="ml-app">
        {/* Top bar */}
        <div className="ml-quiz-topbar">
          <button className="ml-btn-ghost ml-exit" onClick={() => setScreen('home')}>
            ← Salir
          </button>
          <span className="ml-progress-text">
            <strong>{current + 1}</strong>
            <span className="ml-progress-of"> de {questions.length}</span>
          </span>
          <span className={`ml-timer${timerWarning ? ' ml-timer-warn' : ''}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="ml-progress-bar">
          <div className="ml-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Pregunta */}
        <div className="ml-quiz-body">
          <div className="ml-question-meta">
            {q.is_double_score && (
              <span className="ml-badge-double">⭐ Vale 2 puntos</span>
            )}
            {q.categories?.name && (
              <span className="ml-badge-cat">{q.categories.name}</span>
            )}
          </div>

          <h2 className="ml-question-text">{q.text}</h2>

          {q.image_url && (
            <div className="ml-image-wrap">
              <img src={q.image_url} alt="Imagen de la pregunta" className="ml-question-img" />
            </div>
          )}

          {/* Opciones */}
          <div className="ml-options">
            {q.question_options?.map((opt, i) => (
              <button
                key={opt.id}
                className={getOptionClass(opt)}
                onClick={() => handleSelect(opt)}
                disabled={answered}
              >
                <span className="ml-option-letter">
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                <span className="ml-option-text">{opt.option_text}</span>
                {answered && opt.is_correct && (
                  <span className="ml-option-icon">✓</span>
                )}
                {answered && chosen?.id === opt.id && !opt.is_correct && (
                  <span className="ml-option-icon">✗</span>
                )}
              </button>
            ))}
          </div>

          {/* Explicación */}
          {answered && (
            <div className={`ml-explanation${chosen?.is_correct ? ' ml-expl-correct' : ' ml-expl-wrong'}`}>
              <strong>{chosen?.is_correct ? '¡Correcto!' : 'Respuesta incorrecta'}</strong>
              <p>{q.explanation}</p>
            </div>
          )}

          {/* Siguiente */}
          {answered && (
            <button className="ml-btn-next" onClick={handleNext}>
              {current + 1 === questions.length ? 'Ver resultado' : 'Siguiente →'}
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── RESULT ────────────────────────────────────────────────────────────────
  if (screen === 'result' && result) {
    const pct = Math.round((result.score / result.maxScore) * 100)
    const thresholdPct = (MIN_SCORE / result.maxScore) * 100

    return (
      <div className="ml-app">
        <nav className="ml-nav">
          <div className="ml-nav-logo"><span className="ml-dot" />MiLicencia</div>
        </nav>

        <div className="ml-result-body">
          {/* Veredicto */}
          <div className={`ml-verdict${result.passed ? ' ml-verdict-pass' : ' ml-verdict-fail'}`}>
            <span className="ml-verdict-icon">{result.passed ? '✓' : '✗'}</span>
            <h1>{result.passed ? 'Aprobado' : 'Reprobado'}</h1>
            <p>
              {result.passed
                ? '¡Alcanzaste el puntaje mínimo! Sigue practicando.'
                : `Necesitas ${MIN_SCORE} puntos. ¡Inténtalo de nuevo!`}
            </p>
          </div>

          {/* Puntaje */}
          <div className="ml-score-card">
            <div className="ml-score-main">
              <span className="ml-score-n">{result.score}</span>
              <span className="ml-score-total">/ {result.maxScore} pts</span>
            </div>
            <span className="ml-score-pct">{pct}%</span>
          </div>

          {/* Stats */}
          <div className="ml-result-stats">
            <div className="ml-rstat">
              <span className="ml-rstat-n ml-green">{result.correct}</span>
              <span className="ml-rstat-l">Correctas</span>
            </div>
            <div className="ml-rstat">
              <span className="ml-rstat-n ml-red">{result.incorrect}</span>
              <span className="ml-rstat-l">Incorrectas</span>
            </div>
            <div className="ml-rstat">
              <span className="ml-rstat-n">{formatTime(result.timeUsed)}</span>
              <span className="ml-rstat-l">Tiempo</span>
            </div>
          </div>

          {/* Barra visual */}
          <div className="ml-threshold-wrap">
            <div className="ml-threshold-bar">
              <div
                className={`ml-threshold-fill${result.passed ? ' ml-tf-pass' : ' ml-tf-fail'}`}
                style={{ width: `${Math.min(100, pct)}%` }}
              />
              <div className="ml-threshold-mark" style={{ left: `${thresholdPct}%` }}>
                <span className="ml-threshold-label">{MIN_SCORE} pts mínimo</span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="ml-result-actions">
            <button className="ml-btn-primary" onClick={startQuiz}>Nuevo simulacro</button>
            <button className="ml-btn-outline" onClick={() => setScreen('home')}>Volver al inicio</button>
          </div>
        </div>
      </div>
    )
  }

  return null
}