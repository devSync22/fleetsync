import { Navigate, useLocation } from 'react-router'

/**
 * Redirects an old path to its new route, keeping the query string — e.g. links
 * in emails the API already sent (/reset-password?token=…) → /auth/reset-password?token=….
 */
export function RedirectTo({ path }: { path: string }) {
  const { search } = useLocation()
  return <Navigate to={path + search} replace />
}
