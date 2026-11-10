import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getTripDetail } from '../services/tripsApi'

export function useTripDetail(tripId: string) {
  const load = useCallback(() => getTripDetail(tripId), [tripId])
  return useAsyncData(load)
}
