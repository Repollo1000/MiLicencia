import { useAuth } from '@/hooks/useAuth'

type Props = {
  onLoginClick?: () => void
}

export function Navbar({ onLoginClick }: Props) {
  const { user, logout } = useAuth()

  return (
    <nav className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1D9E75]" />
        <span className="font-semibold text-[15px] text-gray-900">MiLicencia</span>
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-400 hidden sm:block">{user.email}</span>
            <button
              onClick={logout}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Salir
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Iniciar sesión
          </button>
        )}
      </div>
    </nav>
  )
}