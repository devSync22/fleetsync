import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getTripCreation } from '../services/tripsApi'

export function useTripCreation(tripId: string) {
  const load = useCallback(() => getTripCreation(tripId), [tripId])
  return useAsyncData(load)
}
