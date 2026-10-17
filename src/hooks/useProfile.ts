import { useAuth } from '../contexts/AuthContext'

export function useProfile() {
  const { session, profile, loading, isAdmin, refreshProfile } = useAuth()

  return {
    session,
    profile,
    loading,
    isAdmin,
    refresh: refreshProfile,
  }
}