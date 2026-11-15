import { Link, useNavigate, useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { SetNewPasswordForm } from '../components/SetNewPasswordForm'
import { useSubmit } from '../hooks/useSubmit'
import { useTokenCheck } from '../hooks/useTokenCheck'
import { lookupPasswordReset, resetPassword } from '../services/authApi'

async function resetPasswordAndConfirm(token: string, newPassword: string) {
  await resetPassword(token, newPassword)
  return true
}

/**
 * `/auth/reset-password?token=…`, opened from the password reset email.
 * Checks the link first (and shows "For <email>"), then sets the new password
 * and sends the user to sign in.
 */
export function SetNewPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const link = useTokenCheck(token, lookupPasswordReset)
  // resetPassword returns nothing, so resolve to `true` to tell success apart from failure.
  const { submit, isSubmitting, error } = useSubmit(resetPasswordAndConfirm)

  async function handleSubmit(newPassword: string) {
    if (!token) return
    if (await submit(token, newPassword)) {
      // Other sessions were ended by the server; sign in again with the new password.
      void navigate('/auth/login', {
        replace: true,
        state: { notice: { title: 'Password updated', message: 'Sign in with your new password.' } },
      })
    }
  }

  if (link.status === 'checking') {
    return <p className="text-sm text-muted-foreground" role="status">Checking your link…</p>
  }

  if (link.status === 'invalid') {
    return (
      <div className="flex w-full max-w-[400px] flex-col gap-5">
        <Banner
          tone="danger"
          title="Link invalid or expired"
          message="This reset link has expired or was already used. Request a new one."
        />
        <Button className="w-full" asChild>
          <Link to="/auth/forgot-password">Request a new link</Link>
        </Button>
      </div>
    )
  }

  return (
    <SetNewPasswordForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      email={link.data.email}
      error={error}
    />
  )
}
