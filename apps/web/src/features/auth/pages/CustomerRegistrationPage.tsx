import { useState } from 'react'
import { CustomerRegistrationForm } from '../components/CustomerRegistrationForm'
import { RegistrationSubmitted } from '../components/RegistrationSubmitted'
import { useSubmit } from '../hooks/useSubmit'
import { registerCustomer, resendVerification } from '../services/authApi'
import type { CustomerRegistrationRequest, RegistrationSubmission } from '../types'
import { getFirstName } from '../utils/names'

async function resendVerificationAndConfirm(email: string) {
  await resendVerification(email)
  return true
}

/**
 * `/auth/register`: a company applies for a customer account. After a
 * successful submit the form is replaced by the confirmation screen.
 */
export function CustomerRegistrationPage() {
  // Set once the registration is accepted; switches the page to the confirmation view.
  const [submission, setSubmission] = useState<RegistrationSubmission>()
  const register = useSubmit(registerCustomer)
  const resend = useSubmit(resendVerificationAndConfirm)
  const [resendSent, setResendSent] = useState(false)

  async function handleRegister(values: CustomerRegistrationRequest) {
    const result = await register.submit(values)
    if (result) {
      setSubmission({
        kind: 'customer',
        reference: result.reference,
        firstName: getFirstName(values.fullName),
        email: result.email,
        accountType: `Customer · ${values.companyName}`,
        submittedAt: new Date(result.submittedAt),
      })
    }
  }

  async function handleResendVerification() {
    if (!submission) return
    // The API always answers 202 (it never reveals whether the email is known).
    if (await resend.submit(submission.email)) setResendSent(true)
  }

  if (submission) {
    return (
      <RegistrationSubmitted
        submission={submission}
        onResendVerification={handleResendVerification}
        resendState={resend.isSubmitting ? 'sending' : resendSent ? 'sent' : 'idle'}
      />
    )
  }

  return (
    <CustomerRegistrationForm onSubmit={handleRegister} isSubmitting={register.isSubmitting} error={register.error} />
  )
}
