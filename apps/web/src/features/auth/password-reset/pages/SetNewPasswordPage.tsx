import { AuthLayout } from '@/components/layout/AuthLayout'
import { SetNewPasswordForm } from '../components/SetNewPasswordForm'

/**
 * `/reset-password` route, opened from the link in the password reset email
 * (e.g. /reset-password?token=...).
 */
export function SetNewPasswordPage() {
  // One-time token from the emailed link; the backend uses it to identify the account.
  const token = new URLSearchParams(window.location.search).get('token')

  // TODO: once the backend exists, validate `token` on load:
  //  - valid: get the account email and pass it as `email` (shows "For <email>")
  //  - missing/expired: show a danger Banner with a link back to /forgot-password
  const email: string | undefined = undefined

  function handleSubmit(newPassword: string) {
    // TODO: call the "reset password" API with { token, newPassword }, then:
    //  - pass isSubmitting to the form while it runs
    //  - on "same as last password" or expired-token errors, show a danger Banner
    //  - on success, redirect to the sign-in page (other sessions are signed out server-side)
    void token
    void newPassword
  }

  return (
    <AuthLayout>
      <SetNewPasswordForm onSubmit={handleSubmit} email={email} />
    </AuthLayout>
  )
}
