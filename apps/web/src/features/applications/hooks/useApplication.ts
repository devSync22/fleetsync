import { useCallback, useState } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getApplication } from '../services/applicationsApi'
import type { ApplicationDetail } from '../types'

/**
 * One application for the Review page. `replace` swaps in the result of an action
 * (approve, reject, verify a document, save the note) without reloading the page.
 */
export function useApplication(applicationId: string) {
  const load = useCallback(() => getApplication(applicationId), [applicationId])
  const { state, retry } = useAsyncData(load)
  const [updated, setUpdated] = useState<ApplicationDetail | null>(null)

  // A local copy only counts for the application it came from (ignored once another one is opened).
  const local = updated?.applicationId === applicationId ? updated : null
  const application = local ?? (state.status === 'success' ? state.data : null)
  return { state, retry, application, replace: setUpdated }
}
