import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getTripCancellation } from '../services/tripsApi'

export function useTripCancellation(tripId: string) {
  const load = useCallback(() => getTripCancellation(tripId), [tripId])
  return useAsyncData(load)
}
