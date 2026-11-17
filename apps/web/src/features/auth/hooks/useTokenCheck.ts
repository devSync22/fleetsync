import { useEffect, useState } from 'react'
import { toApiError, type ApiError } from '@/services/apiClient'

type TokenCheckState<T> =
  | { status: 'checking' }
  | { status: 'valid'; data: T }
  | { status: 'invalid'; error?: ApiError }

/**
 * In-flight checks by token. Some checks use the token up (verify email), and
 * React runs effects twice in development: both runs must share one request,
 * or the second would report "link already used" after the first succeeded.
 */
const inFlight = new Map<string, Promise<unknown>>()

function checkOnce<T>(token: string, check: (token: string) => Promise<T>): Promise<T> {
  let pending = inFlight.get(token) as Promise<T> | undefined
  if (!pending) {
    pending = check(token)
    inFlight.set(token, pending)
    // Forget it a moment after it settles, so a later visit checks again.
    pending.finally(() => setTimeout(() => inFlight.delete(token), 1000)).catch(() => {})
  }
  return pending
}

/**
 * Runs `check(token)` once when a page opened from an emailed link loads
 * (verify email, reset password). A missing token counts as invalid.
 */
export function useTokenCheck<T>(token: string | null, check: (token: string) => Promise<T>): TokenCheckState<T> {
  const [state, setState] = useState<TokenCheckState<T>>(
    token ? { status: 'checking' } : { status: 'invalid' },
  )

  useEffect(() => {
    if (!token) return

    // Ignore the result if the page went away (or React re-ran the effect) meanwhile.
    let active = true
    checkOnce(token, check).then(
      (data) => active && setState({ status: 'valid', data }),
      (error: unknown) => active && setState({ status: 'invalid', error: toApiError(error) }),
    )
    return () => {
      active = false
    }
  }, [token, check])

  return state
}
