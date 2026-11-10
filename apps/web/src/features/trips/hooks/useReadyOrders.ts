import { useAsyncData } from '@/hooks/useAsyncData'
import { getReadyOrders } from '../services/tripsApi'

export function useReadyOrders() {
  return useAsyncData(getReadyOrders)
}
