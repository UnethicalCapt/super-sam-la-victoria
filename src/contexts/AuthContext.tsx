import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export type ProfileRow = {
  id: string
  role: 'user' | 'admin'
  full_name: string | null
  first_name: string | null
  last_name: string | null
  phone: string | null
  cedula: string | null
  is_winner: boolean
  group_id: string | null
  birth_date: string | null
  gender: string | null
}

type AuthContextType = {
  session: Session | null
  profile: ProfileRow | null
  isAdmin: boolean
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshProfile = useCallback(async () => {
    if (!session) {
      setProfile(null)
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, first_name, last_name, phone, cedula, is_winner, group_id, birth_date, gender')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        setError('Error al cargar el perfil')
        setProfile(null)
        return
      }

      setProfile(data)
      setError(null)
    } catch (err) {
      console.error('Error refreshing profile:', err)
      setError('Error al cargar el perfil')
      setProfile(null)
    }
  }, [session])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  useEffect(() => {
    let mounted = true

    const loadProfile = async (userId: string) => {
      try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, first_name, last_name, phone, cedula, is_winner, group_id, birth_date, gender')
        .eq('id', userId)
        .maybeSingle()

        if (!mounted) return

        if (error) {
          console.error('Error fetching profile:', error)
          setError('Error al cargar el perfil')
          setProfile(null)
        } else {
          setProfile(data)
          setError(null)
        }
      } catch (err) {
        if (!mounted) return
        console.error('Error loading profile:', err)
        setError('Error al cargar el perfil')
        setProfile(null)
      }
    }

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(session)
        if (session) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setSession(session)
        if (session) {
          setLoading(true)
          loadProfile(session.user.id).finally(() => {
            if (mounted) setLoading(false)
          })
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    session,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    error,
    refreshProfile,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}