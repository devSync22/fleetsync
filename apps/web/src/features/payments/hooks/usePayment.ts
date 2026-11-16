import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useAction } from '@/hooks/useAction'
import { useAsyncData, type AsyncState } from '@/hooks/useAsyncData'
import { getPaymentSummary, startPayment } from '../services/paymentsApi'
import type { PaymentSummary } from '../types'

/** The Payment page: the summary to pay, and "Pay" which hands over to PayHere and then shows the result. */
export function usePayment(orderId: string) {
  const navigate = useNavigate()
  const load = useCallback(() => getPaymentSummary(orderId), [orderId])
  const { state, retry } = useAsyncData(load)
  const pay = useAction(startPayment)

  // On Back/Forward between two orders the page stays mounted; don't show the previous summary meanwhile.
  const current: AsyncState<PaymentSummary> =
    state.status === 'success' && state.data.orderId !== orderId ? { status: 'loading' } : state

  async function payNow() {
    const result = await pay.run(orderId)
    if (result) navigate(`/customer/payments/${result.paymentId}`)
  }

  return { state: current, retry, payNow, paying: pay.pending, payError: pay.error }
}
