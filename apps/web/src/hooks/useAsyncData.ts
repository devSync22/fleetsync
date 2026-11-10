import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/services/apiClient'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; error: ApiError }
  | { status: 'success'; data: T }

/**
 * Runs a service call and tracks loading / error / success, with a `retry` for the error state.
 * Pass a stable function (a service function, not an inline arrow) so it doesn't refetch every render.
 */
export function useAsyncData<T>(load: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    load()
      .then((data) => {
        if (!cancelled) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          status: 'error',
          error: error instanceof ApiError ? error : new ApiError('Something went wrong. Please try again.'),
        })
      })
    return () => {
      cancelled = true
    }
  }, [load, attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry }
}
