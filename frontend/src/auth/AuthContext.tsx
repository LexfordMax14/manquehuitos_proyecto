import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Button, Stack } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import * as auth from '../services/auth'
const AuthContext = createContext<{
  user: auth.SessionUser | null; loading: boolean; failure: string;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>; retry: () => void;
} | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<auth.SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [failure, setFailure] = useState('')
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let active = true
    auth.restoreLogin().then(value => { if (active) setUser(value) }).catch(error => {
      if (active && error.response?.status !== 401) setFailure(auth.errorMessage(error))
    }).finally(() => { if (active) setLoading(false) })
    const expire = () => setUser(null)
    window.addEventListener('session-expired', expire)
    return () => { active = false; window.removeEventListener('session-expired', expire) }
  }, [attempt])
  return <AuthContext.Provider value={{ user, loading, failure,
    retry: () => { setFailure(''); setLoading(true); setAttempt(value => value + 1) },
    signIn: async (username, password) => { const value = await auth.login(username, password); setUser(value); setFailure('') },
    signOut: async () => { try { await auth.logout() } finally { setUser(null) } },
  }}>{children}</AuthContext.Provider>
}
// Provider y hook se mantienen juntos para el ejemplo académico.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('Falta AuthProvider')
  return context
}
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, failure, retry } = useAuth()
  const location = useLocation()
  if (loading) return <p>Comprobando sesión…</p>
  if (failure) return <Stack><Alert severity="error">{failure}</Alert><Button onClick={retry}>Reintentar</Button></Stack>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}
