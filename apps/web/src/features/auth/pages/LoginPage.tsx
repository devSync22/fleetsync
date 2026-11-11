import { useState } from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '../components/LoginForm'
import type { LoginError, LoginRequest } from '../types/auth'

/**
 * Login route. Wraps the form in the shared auth layout and owns the login
 * logic (API call, loading/error state, redirect after success).
 */
export function LoginPage() {
  // The last failed sign-in; undefined when the form should show its normal state.
  const [loginError, setLoginError] = useState<LoginError>()

  function handleLogin(values: LoginRequest) {
    // Clear the previous error so a new attempt starts from the normal state.
    setLoginError(undefined)

    // TODO(KAN-220): call the auth API once the backend login endpoint exists, then:
    //  - on 401: setLoginError(invalidCredentialsError(response.attemptsLeft))
    //    (from ../utils/loginErrors)
    //  - pass isSubmitting to LoginForm while the request runs
    //  - redirect to the user's role dashboard on success
    void values
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLogin} error={loginError} />
    </AuthLayout>
  )
}
