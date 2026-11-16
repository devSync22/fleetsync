import type { PaymentResult } from '../types'

/** A stored attempt. A "pending" one turns into its outcome once `settlesAt` (ms timestamp) has passed. */
export type PaymentRecord = PaymentResult & { settlesAt?: number; settlesAs?: 'success' | 'failed' }

/**
 * Payment attempts made in this browser session (in memory; lost on reload).
 * Numbering continues from the last payment reference in the order mocks (PAY-58376), so the
 * first new payment is PAY-58377, as in "Customer — Payment / Success" (161:6347).
 */
export const paymentResultsMock: PaymentRecord[] = []

let lastNumber = 58376

export function nextPaymentId() {
  lastNumber += 1
  return `PAY-${lastNumber}`
}
