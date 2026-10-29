import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '@/services/apiClient'
import { getCoordinatorDashboard } from '../services/coordinatorDashboardApi'
import type { CoordinatorDashboard } from '../types'

export type CoordinatorDashboardState =
  | { status: 'loading' }
  | { status: 'error'; error: ApiError }
  | { status: 'success'; data: CoordinatorDashboard }

export function useCoordinatorDashboard() {
  const [state, setState] = useState<CoordinatorDashboardState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getCoordinatorDashboard()
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
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((n) => n + 1)
  }, [])

  return { state, retry }
}
