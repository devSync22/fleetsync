import { useAsyncData } from '@/hooks/useAsyncData'
import { getReadyOrders, getTripCandidates } from '../services/tripsApi'
import type { ReadyOrder, TripCandidates } from '../types'

async function loadCreateTripData(): Promise<{ orders: ReadyOrder[]; candidates: TripCandidates }> {
  const [orders, candidates] = await Promise.all([getReadyOrders(), getTripCandidates()])
  return { orders, candidates }
}

/** Paid orders plus the free vehicles, drivers and mechanics, for the Create trip page. */
export function useCreateTripData() {
  return useAsyncData(loadCreateTripData)
}
