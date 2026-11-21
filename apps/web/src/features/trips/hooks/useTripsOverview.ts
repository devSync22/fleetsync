import { useAsyncData } from '@/hooks/useAsyncData'
import { getTripsOverview } from '../services/tripsApi'

export function useTripsOverview() {
  return useAsyncData(getTripsOverview)
}
