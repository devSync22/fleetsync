import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Route guard: only signed-in users get past it; others go to sign in and come
 * back to the same page afterwards. Renders nothing while the saved session is
 * being restored on start-up.
 */
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return null
  if (status === 'signedOut') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname + location.search }} />
  }
  return <Outlet />
}
