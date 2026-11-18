import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getChangeRequests } from '../services/changeApprovalsApi'
import type { ChangeRequestStatus } from '../types'

/** Change requests for one tab (Pending / Approved / Rejected) plus the tab counts. */
export function useChangeRequests(status: ChangeRequestStatus) {
  const load = useCallback(() => getChangeRequests(status), [status])
  return useAsyncData(load)
}
