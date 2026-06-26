import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, signIn, signUp, signOut } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    return { error }
  }

  const register = async (email: string, password: string) => {
    const { error } = await signUp(email, password)
    return { error }
  }

  const logout = async () => {
    await signOut()
    setUser(null)
  }

  return { user, loading, login, register, logout }
}