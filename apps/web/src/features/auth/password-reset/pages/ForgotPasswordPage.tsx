import { useState } from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'

/**
 * `/forgot-password` route (linked from the login page's "Forgot password?").
 * Requests a password reset email and tracks when the last one was sent.
 */
export function ForgotPasswordPage() {
  // When the last reset email was requested; drives the success banner and resend countdown.
  const [sentAt, setSentAt] = useState<number>()

  function handleSubmit(email: string) {
    // TODO: call the "request password reset" API once the backend endpoint exists
    // (and pass isSubmitting to the form while it runs). The API should respond the
    // same way whether or not the email has an account, so the success state below
    // is correct for every completed request; only network/server errors need a
    // danger Banner.
    void email
    setSentAt(Date.now())
  }

  return (
    <AuthLayout>
      <ForgotPasswordForm onSubmit={handleSubmit} sentAt={sentAt} />
    </AuthLayout>
  )
}
