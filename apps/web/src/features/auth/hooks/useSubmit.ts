import { useCallback, useState } from 'react'
import { toApiError, type ApiError } from '@/services/apiClient'

/**
 * Runs an async action (usually an API call) for a form and tracks its state:
 * `isSubmitting` while it runs, `error` (an ApiError) if it failed.
 * `submit` resolves to the action's result, or `undefined` when it failed,
 * so callers can write `const result = await submit(values); if (result) …`.
 */
export function useSubmit<TArgs extends unknown[], TResult>(action: (...args: TArgs) => Promise<TResult>) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<ApiError>()

  const submit = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setIsSubmitting(true)
      setError(undefined)
      try {
        return await action(...args)
      } catch (caught) {
        setError(toApiError(caught))
        return undefined
      } finally {
        setIsSubmitting(false)
      }
    },
    [action],
  )

  const clearError = useCallback(() => setError(undefined), [])

  return { submit, isSubmitting, error, clearError }
}
