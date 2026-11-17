import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from '../components/LoginForm'
import { useSubmit } from '../hooks/useSubmit'
import { login } from '../services/authApi'
import type { LoginRequest } from '../types'
import { toLoginError } from '../utils/loginErrors'

/** Router state other pages pass when they send the user here. */
type LoginLocationState = {
  /** Page the user wanted before being sent to sign in (RequireAuth). */
  from?: string
  /** Success message to show, e.g. after a password reset. */
  notice?: { title: string; message: string }
}

/**
 * `/auth/login`: signs the user in, then returns them to the page they wanted
 * (or the home page). Already signed-in users skip straight there.
 */
export function LoginPage() {
  const { status, signIn } = useAuth()
  const navigate = useNavigate()
  const state = (useLocation().state ?? {}) as LoginLocationState
  const { submit, isSubmitting, error } = useSubmit(login)

  if (status === 'signedIn') {
    return <Navigate to={state.from ?? '/'} replace />
  }

  async function handleLogin(values: LoginRequest) {
    const session = await submit(values)
    if (session) {
      signIn(session)
      void navigate(state.from ?? '/', { replace: true })
    }
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      isSubmitting={isSubmitting}
      error={error ? toLoginError(error) : undefined}
      notice={state.notice}
    />
  )
}
