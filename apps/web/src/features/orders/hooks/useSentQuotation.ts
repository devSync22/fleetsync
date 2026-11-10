import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getSentQuotation } from '../services/ordersApi'

export function useSentQuotation(orderId: string) {
  const load = useCallback(() => getSentQuotation(orderId), [orderId])
  return useAsyncData(load)
}
