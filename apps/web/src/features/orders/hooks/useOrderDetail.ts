import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getOrderDetail } from '../services/ordersApi'

export function useOrderDetail(orderId: string) {
  const load = useCallback(() => getOrderDetail(orderId), [orderId])
  return useAsyncData(load)
}
