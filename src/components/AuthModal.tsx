import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'

const schema = z.object({
  email:    z.string().email('Correo inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

type Props = { onClose: () => void }

export function AuthModal({ onClose }: Props) {
  const [mode, setMode]       = useState<'login' | 'register'>('login')
  const [serverMsg, setMsg]   = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const { login, register }   = useAuth()

  const { register: reg, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email, password }: FormData) => {
    setMsg(null)
    if (mode === 'login') {
      const { error } = await login(email, password)
      if (error) setMsg({ type: 'error', text: 'Correo o contraseña incorrectos' })
      else onClose()
    } else {
      const { error } = await register(email, password)
      if (error) setMsg({ type: 'error', text: error.message })
      else setMsg({ type: 'success', text: 'Revisa tu correo para confirmar tu cuenta.' })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl relative" onClick={e => e.stopPropagation()}>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]" />
          <span className="font-semibold text-[15px]">MiLicencia</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-6">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setMsg(null) }}
              className={`flex-1 pb-3 text-sm transition-colors border-b-2 -mb-px ${
                mode === m
                  ? 'border-[#1D9E75] text-[#1D9E75] font-medium'
                  : 'border-transparent text-gray-400'
              }`}
            >
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">Correo electrónico</label>
            <input
              {...reg('email')}
              type="email"
              placeholder="tu@correo.cl"
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1D9E75] transition-colors"
            />
            {errors.email && <p className="text-[12px] text-red-500">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-gray-600">Contraseña</label>
            <input
              {...reg('password')}
              type="password"
              placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••••'}
              className="border border-gray-200 rounded-lg px-4 py-3 text-sm outline-none focus:border-[#1D9E75] transition-colors"
            />
            {errors.password && <p className="text-[12px] text-red-500">{errors.password.message}</p>}
          </div>

          {serverMsg && (
            <p className={`text-[13px] px-3 py-2 rounded-lg ${
              serverMsg.type === 'error'
                ? 'bg-red-50 text-red-600'
                : 'bg-[#E1F5EE] text-[#085041]'
            }`}>
              {serverMsg.text}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-gray-900 text-white rounded-lg py-3 text-[15px] font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-default mt-1"
          >
            {isSubmitting ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        {/* Skip */}
        <p className="text-center text-[13px] text-gray-400 mt-4">
          <button onClick={onClose} className="underline text-[#1D9E75] hover:text-[#0F6E56]">
            Practicar sin registrarse
          </button>
        </p>
      </div>
    </div>
  )
}