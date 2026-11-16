/** What the Payment page shows before the customer pays (the "Payment summary" card). */
export interface PaymentSummary {
  orderId: string
  /** "Nugegoda → Kurunegala" */
  route: string
  /** "Tue, 21 Oct, 08:00" */
  pickupLabel: string
  /** LKR, the accepted fare quotation. */
  quotationAmount: number
  /** LKR to pay; the quotation amount (no card fee is added). */
  total: number
  /** "20 Oct, 18:00" — when the accepted quotation stops being payable. */
  validUntilLabel: string
}

export type PaymentStatus = 'success' | 'failed' | 'pending'

/** The outcome of one payment attempt (the Payment result page). */
export interface PaymentResult {
  /** "PAY-58377" — also the route id: /customer/payments/:paymentId */
  paymentId: string
  orderId: string
  status: PaymentStatus
  /** LKR */
  amount: number
  /** "4421"; null while pending. */
  cardLast4: string | null
  /** Reference shown to the customer (and on the receipt). */
  reference: string
  /** "20 Oct 2026, 12:00" — when it was paid, or attempted. */
  dateLabel: string
  /** "Declined by your bank"; null unless failed. */
  failureReason: string | null
  /** "20 Oct, 18:00" — shown on a failed payment so the customer knows how long they can retry. */
  validUntilLabel: string
}
