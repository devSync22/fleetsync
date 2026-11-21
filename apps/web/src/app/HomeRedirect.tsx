import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { SignedInPage } from '@/features/auth/pages/SignedInPage'
import { homePathFor } from './roleHome'

/**
 * "/": sends a signed-in user to their role's area (/coordinator, /customer).
 * Roles that have no web area yet see the signed-in page instead.
 * Rendered inside RequireAuth, so the user is always signed in here.
 */
export function HomeRedirect() {
  const { user } = useAuth()
  const home = homePathFor(user)
  return home === '/' ? <SignedInPage /> : <Navigate to={home} replace />
}
