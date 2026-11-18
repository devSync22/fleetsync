import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getApprovalOptions } from '../services/applicationsApi'

/** Generated account ID, depots and licence classes for the Approve dialog and licence form. */
export function useApprovalOptions(applicationId: string) {
  const load = useCallback(() => getApprovalOptions(applicationId), [applicationId])
  return useAsyncData(load)
}
