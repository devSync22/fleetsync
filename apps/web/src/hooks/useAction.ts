import { useCallback, useState } from 'react'
import { ApiError } from '@/services/apiClient'

/**
 * Wraps a service call that changes data (cancel, create, send) with a pending flag and an error.
 * `run` resolves to the result, or to undefined when the call failed (the error is in `error`).
 */
export function useAction<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const run = useCallback(
    async (...args: Args): Promise<Result | undefined> => {
      setPending(true)
      setError(null)
      try {
        return await action(...args)
      } catch (caught) {
        setError(caught instanceof ApiError ? caught : new ApiError('Something went wrong. Please try again.'))
        return undefined
      } finally {
        setPending(false)
      }
    },
    [action],
  )

  return { run, pending, error }
}
