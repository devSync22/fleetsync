import { CustomerRegistrationPage } from '@/features/auth/pages/CustomerRegistrationPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'

/**
 * Minimal path-based routing until a real router (e.g. React Router in
 * src/app/router) is added. Links are plain <a href>, so each navigation is a
 * full page load and Vite's SPA fallback serves index.html for every path.
 */
const routes: Record<string, () => React.JSX.Element> = {
  '/': LoginPage,
  '/login': LoginPage,
  '/register': CustomerRegistrationPage,
}

function App() {
  // Unknown paths fall back to the login page for now.
  const Page = routes[window.location.pathname] ?? LoginPage
  return <Page />
}

export default App
