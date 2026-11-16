import type { PaymentResult } from '../types'

/**
 * A payment attempt made in this browser session. `at` is the ISO time (for sorting and the history);
 * a "pending" one turns into its outcome once `settlesAt` (ms timestamp) has passed.
 */
export type PaymentRecord = PaymentResult & { at: string; settlesAt?: number; settlesAs?: 'success' | 'failed' }

/** Attempts made on the Payment page in this session (in memory; lost on reload). */
export const paymentResultsMock: PaymentRecord[] = []

/*
 * Only successful (or pending) payments get a PAY- reference. Numbering continues from the newest
 * reference in the history (PAY-58213), so the first new payment is PAY-58377 as in Figma (161:6347,
 * 162:6243). Failed attempts get an ATT- id instead, used only for their result page.
 */
let lastReference = 58376
let lastAttempt = 0

export function nextPaymentReference() {
  lastReference += 1
  return `PAY-${lastReference}`
}

export function nextAttemptId() {
  lastAttempt += 1
  return `ATT-${String(lastAttempt).padStart(4, '0')}`
}
