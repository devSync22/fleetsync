import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAction } from '@/hooks/useAction'
import { useAsyncData, type AsyncState } from '@/hooks/useAsyncData'
import { effectiveStatus } from '../quotationStatus'
import { acceptQuotation, currentTime, declineQuotation, getQuotation } from '../services/customerOrdersApi'
import type { CustomerQuotation } from '../types'

/**
 * The Fare quotation page's data and actions. Accepting goes straight to payment; declining
 * keeps the customer on the page, which then shows the declined quotation returned by the service.
 */
export function useQuotation(orderId: string) {
  const navigate = useNavigate()
  const load = useCallback(() => getQuotation(orderId), [orderId])
  const { state, retry } = useAsyncData(load)
  const [decided, setDecided] = useState<CustomerQuotation | null>(null)
  const accept = useAction(acceptQuotation)
  const decline = useAction(declineQuotation)

  let current: AsyncState<CustomerQuotation> = state
  if (decided?.orderId === orderId) current = { status: 'success', data: decided }
  // On Back/Forward between two orders the page stays mounted; don't show the previous quotation meanwhile.
  else if (state.status === 'success' && state.data.orderId !== orderId) current = { status: 'loading' }

  const status = current.status === 'success' ? effectiveStatus(current.data, currentTime()) : null

  async function acceptAndPay() {
    const accepted = await accept.run(orderId)
    if (accepted) navigate(`/customer/orders/${orderId}/pay`)
  }

  /** Resolves to true when the quotation was declined (so the dialog can close). */
  async function declineWithReason(reason: string) {
    const declined = await decline.run(orderId, reason)
    if (!declined) return false
    setDecided(declined)
    return true
  }

  return {
    state: current,
    status,
    retry,
    acceptAndPay,
    accepting: accept.pending,
    acceptError: accept.error,
    declineWithReason,
    declining: decline.pending,
    declineError: decline.error,
  }
}
