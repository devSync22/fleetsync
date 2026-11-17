import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { runSingleRefresh, setAccessToken, setRefreshHandler } from '@/services/apiClient'
import { logout, refreshSession, type AuthSession, type AuthUser } from '@/services/sessionApi'

type AuthStatus = 'loading' | 'signedIn' | 'signedOut'

type AuthContextValue = {
  /** 'loading' while the saved session (refresh cookie) is being checked on start-up. */
  status: AuthStatus
  user: AuthUser | null
  /** Stores a session returned by sign-in. */
  signIn: (session: AuthSession) => void
  /** Ends the session on the server and forgets it here. */
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * App-wide sign-in state. On start-up it tries to restore the session from the
 * HttpOnly refresh cookie, and it tells apiClient how to refresh an expired
 * access token. The access token is kept in memory only.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<AuthUser | null>(null)

  const applySession = useCallback((session: AuthSession | null) => {
    setAccessToken(session?.accessToken ?? null)
    setUser(session?.user ?? null)
    setStatus(session ? 'signedIn' : 'signedOut')
  }, [])

  /** Refreshes the session; resolves to the new access token, or null when signed out. */
  const refresh = useCallback(async () => {
    try {
      const session = await refreshSession()
      applySession(session)
      return session.accessToken
    } catch {
      applySession(null)
      return null
    }
  }, [applySession])

  useEffect(() => {
    setRefreshHandler(refresh)
    // Restore the session from the cookie. runSingleRefresh makes React's
    // double-run of effects in development share one request: the backend
    // would treat two uses of the same refresh token as theft.
    void runSingleRefresh(refresh)
    return () => setRefreshHandler(null)
  }, [refresh])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      applySession(null)
    }
  }, [applySession])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn: applySession, signOut }),
    [status, user, applySession, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** The current sign-in state; must be used inside <AuthProvider>. */
// eslint-disable-next-line react-refresh/only-export-components -- the hook belongs with its provider
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}
