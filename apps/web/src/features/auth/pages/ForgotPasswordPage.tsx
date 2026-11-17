import { useState } from 'react'
import { ForgotPasswordForm } from '../components/ForgotPasswordForm'
import { useSubmit } from '../hooks/useSubmit'
import { forgotPassword } from '../services/authApi'

async function forgotPasswordAndConfirm(email: string) {
  await forgotPassword(email)
  return true
}

/**
 * `/auth/forgot-password` (linked from "Forgot password?" on the sign-in page).
 * Requests a password reset email and tracks when the last one was sent.
 */
export function ForgotPasswordPage() {
  // When the last reset email was requested; drives the success banner and resend countdown.
  const [sentAt, setSentAt] = useState<number>()
  const { submit, isSubmitting, error } = useSubmit(forgotPasswordAndConfirm)

  async function handleSubmit(email: string) {
    // The API answers the same way whether or not the email has an account,
    // so every completed request shows the same success state.
    const before = Date.now()
    if (await submit(email)) setSentAt(before)
  }

  return <ForgotPasswordForm onSubmit={handleSubmit} isSubmitting={isSubmitting} sentAt={sentAt} error={error} />
}
