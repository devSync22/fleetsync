import { useState } from 'react'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { CustomerRegistrationForm } from '../components/CustomerRegistrationForm'
import { RegistrationSubmitted } from '../components/RegistrationSubmitted'
import type { CustomerRegistrationRequest, RegistrationSubmission } from '../types/auth'
import { getFirstName } from '../utils/registration'

/**
 * `/register` route: lets a company create a customer account.
 * Owns the registration logic (API call, loading/error state, what happens next).
 * After a successful submit the form is replaced by the confirmation screen.
 */
export function CustomerRegistrationPage() {
  // Set once the registration is submitted; switches the page to the confirmation view.
  const [submission, setSubmission] = useState<RegistrationSubmission>()

  function handleRegister(values: CustomerRegistrationRequest) {
    // TODO: call the registration API here once the backend endpoint exists, and:
    //  - pass isSubmitting to the form while the request runs
    //  - show server errors (e.g. email already registered) using the Banner component
    //  - only continue below on success, filling `reference` from the response
    setSubmission({
      reference: undefined,
      firstName: getFirstName(values.fullName),
      email: values.email,
      accountType: `Customer · ${values.companyName}`,
      submittedAt: new Date(),
    })
  }

  function handleResendVerification() {
    // TODO: call the "resend verification email" API once it exists.
  }

  return (
    <AuthLayout>
      {submission ? (
        <RegistrationSubmitted
          submission={submission}
          onResendVerification={handleResendVerification}
        />
      ) : (
        <CustomerRegistrationForm onSubmit={handleRegister} />
      )}
    </AuthLayout>
  )
}
