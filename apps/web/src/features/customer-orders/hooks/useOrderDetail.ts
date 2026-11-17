import { useCallback } from 'react'
import { useAsyncData, type AsyncState } from '@/hooks/useAsyncData'
import { getOrderDetail } from '../services/customerOrdersApi'
import type { CustomerOrderDetail } from '../types'

/** One order for the Order details page, with loading / error / retry from useAsyncData. */
export function useOrderDetail(orderId: string) {
  const load = useCallback(() => getOrderDetail(orderId), [orderId])
  const { state, retry } = useAsyncData(load)
  // On Back/Forward between two orders the page stays mounted; don't show the previous order meanwhile.
  const current: AsyncState<CustomerOrderDetail> =
    state.status === 'success' && state.data.orderId !== orderId ? { status: 'loading' } : state
  return { state: current, retry }
}
