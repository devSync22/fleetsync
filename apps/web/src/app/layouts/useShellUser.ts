import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { initialsOf, roleLabels } from '../roleHome'

/**
 * What every role layout shows about the signed-in user (top bar name, role
 * and initials) plus the sidebar's "Log out" action. The layouts sit behind
 * RequireAuth, so `user` is set whenever they render.
 */
export function useShellUser() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const name = user?.fullName ?? ''
  const role = user?.roles[0]

  /** Ends the session on the API (clears the refresh cookie), then goes to sign in. */
  async function logOut() {
    await signOut()
    void navigate('/auth/login', { replace: true })
  }

  return {
    name,
    initials: initialsOf(name),
    roleLabel: role ? roleLabels[role] : '',
    logOut: () => void logOut(),
  }
}
