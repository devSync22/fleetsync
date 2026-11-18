import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/services/sessionApi'
import { hasAnyRole, homePathFor } from '../roleHome'

type RequireAuthProps = {
  /**
   * Roles allowed past this guard. Leave out to allow any signed-in user.
   * A signed-in user with another role is sent to their own home page.
   * (UI convenience only: the API checks roles on every request.)
   */
  roles?: readonly UserRole[]
}

/**
 * Route guard: only signed-in users get past it; others go to sign in and come
 * back to the same page afterwards. Renders nothing while the saved session is
 * being restored on start-up.
 */
export function RequireAuth({ roles }: RequireAuthProps) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') return null
  if (status === 'signedOut') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname + location.search }} />
  }
  if (roles && !hasAnyRole(user, roles)) {
    return <Navigate to={homePathFor(user)} replace />
  }
  return <Outlet />
}
