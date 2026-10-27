import { AuthLayout } from '@/components/layout/AuthLayout'
import { LoginForm } from '../components/LoginForm'
import type { LoginRequest } from '../types/auth'

export function LoginPage() {
  // TODO(KAN-220): call the auth API once the backend login endpoint exists.
  function handleLogin(values: LoginRequest) {
    void values
  }

  return (
    <AuthLayout>
      <LoginForm onSubmit={handleLogin} />
    </AuthLayout>
  )
}
