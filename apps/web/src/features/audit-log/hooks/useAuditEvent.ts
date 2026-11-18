import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getAuditEvent } from '../services/auditLogApi'

/** The full record behind one audit row, for the Event details panel. */
export function useAuditEvent(eventId: string) {
  const load = useCallback(() => getAuditEvent(eventId), [eventId])
  return useAsyncData(load)
}
