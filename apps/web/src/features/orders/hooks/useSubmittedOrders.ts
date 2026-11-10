import { useAsyncData } from '@/hooks/useAsyncData'
import { getSubmittedOrders } from '../services/ordersApi'

export function useSubmittedOrders() {
  return useAsyncData(getSubmittedOrders)
}
