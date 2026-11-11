import { CustomerRegistrationPage } from '@/features/auth/pages/CustomerRegistrationPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { SetNewPasswordPage } from '@/features/auth/pages/SetNewPasswordPage'
import { StaffApplicationPage } from '@/features/auth/pages/StaffApplicationPage'

/**
 * Minimal path-based routing until a real router (e.g. React Router in
 * src/app/router) is added. Links are plain <a href>, so each navigation is a
 * full page load and Vite's SPA fallback serves index.html for every path.
 */
const routes: Record<string, () => React.JSX.Element> = {
  '/': LoginPage,
  '/login': LoginPage,
  '/register': CustomerRegistrationPage,
  // Linked from the login page's "Request staff account" button.
  '/request-staff-account': StaffApplicationPage,
  // Linked from the login page's "Forgot password?".
  '/forgot-password': ForgotPasswordPage,
  // Opened from the reset email link: /reset-password?token=...
  '/reset-password': SetNewPasswordPage,
}

function App() {
  // Unknown paths fall back to the login page for now.
  const Page = routes[window.location.pathname] ?? LoginPage
  return <Page />
}

export default App
