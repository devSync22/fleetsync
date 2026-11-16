import { useCallback, useEffect, useState } from 'react'
import { useAsyncData, type AsyncState } from '@/hooks/useAsyncData'
import { getPaymentResult } from '../services/paymentsApi'
import type { PaymentResult } from '../types'

const POLL_MS = 2000

/**
 * The Payment result page. While the payment is "pending" it asks again every 2 seconds, quietly
 * (no loading state in between), until PayHere's outcome is known.
 */
export function usePaymentResult(paymentId: string) {
  const load = useCallback(() => getPaymentResult(paymentId), [paymentId])
  const { state, retry } = useAsyncData(load)
  const [polled, setPolled] = useState<PaymentResult | null>(null)
  const [failedPolls, setFailedPolls] = useState(0)

  let current: AsyncState<PaymentResult> = state
  if (state.status === 'success') {
    if (state.data.paymentId !== paymentId) current = { status: 'loading' }
    else if (polled?.paymentId === paymentId) current = { status: 'success', data: polled }
  }
  const pending = current.status === 'success' && current.data.status === 'pending'

  useEffect(() => {
    if (!pending) return
    const timer = setTimeout(() => {
      getPaymentResult(paymentId)
        .then(setPolled)
        // A failed poll just tries again on the next tick.
        .catch(() => setFailedPolls((n) => n + 1))
    }, POLL_MS)
    return () => clearTimeout(timer)
  }, [pending, paymentId, polled, failedPolls])

  return { state: current, retry }
}
