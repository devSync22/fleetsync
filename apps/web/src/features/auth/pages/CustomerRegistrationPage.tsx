import { AuthLayout } from '@/components/layout/AuthLayout'
import { CustomerRegistrationForm } from '../components/CustomerRegistrationForm'
import type { CustomerRegistrationRequest } from '../types/auth'

/**
 * `/register` route: lets a company create a customer account.
 * Owns the registration logic (API call, loading/error state, what happens next).
 */
export function CustomerRegistrationPage() {
  function handleRegister(values: CustomerRegistrationRequest) {
    // TODO: call the registration API once the backend endpoint exists, then:
    //  - pass isSubmitting to the form while the request runs
    //  - show server errors (e.g. email already registered) using the Banner component
    //  - on success go to the "Registration submitted" screen (Figma frame 371:7348, not built yet)
    void values
  }

  return (
    <AuthLayout>
      <CustomerRegistrationForm onSubmit={handleRegister} />
    </AuthLayout>
  )
}
