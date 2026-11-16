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
  /** Reference shown to the customer (and on the receipt); null for a failed attempt. */
  reference: string | null
  /** "20 Oct 2026, 12:00" — when it was paid, or attempted. */
  dateLabel: string
  /** "Declined by your bank"; null unless failed. */
  failureReason: string | null
  /** "20 Oct, 18:00" — shown on a failed payment so the customer knows how long they can retry. */
  validUntilLabel: string
  /** "INV-2026-1049" for a successful payment; null otherwise. */
  invoiceId: string | null
}

/* ───────────── Payment history (/customer/payments) ───────────── */

export type PaymentHistoryStatus = 'paid' | 'failed' | 'refunded'

/** One row of the Payment history table. */
export interface PaymentHistoryRow {
  paymentId: string
  /** "19 Oct" */
  dateLabel: string
  /** "11:42" */
  timeLabel: string
  orderId: string
  /** The route, or why a failed attempt failed ("Card declined by the bank"). */
  routeOrReason: string
  /** LKR */
  amount: number
  /** "PAY-58377"; null for a failed attempt. */
  reference: string | null
  status: PaymentHistoryStatus
  /** The order's invoice; null for failed attempts. */
  invoiceId: string | null
}

/** The status filter; also the `?status=` URL value. */
export type PaymentStatusFilter = 'all' | PaymentHistoryStatus

/** The period filter; also the `?period=` URL value. */
export type PaymentPeriod = 'last-3-months' | 'last-6-months' | 'this-year'

export interface PaymentHistoryQuery {
  status: PaymentStatusFilter
  period: PaymentPeriod
  /** 1-based. */
  page: number
}

/** The four KPI cards. Always over all payments, whatever the filters. */
export interface PaymentKpis {
  /** "October" */
  monthLabel: string
  paidThisMonth: { amount: number; count: number }
  lastPayment: { amount: number; orderId: string; dateLabel: string } | null
  failedThisMonth: number
  paidThisYear: { amount: number; orderCount: number }
}

export interface PaymentHistoryResult {
  /** The rows on the requested page. */
  items: PaymentHistoryRow[]
  /** Payments matching the filters. */
  total: number
  /** The page actually returned (clamped to 1…pageCount). */
  page: number
  pageCount: number
  kpis: PaymentKpis
  /** The newest paid payment's invoice among the filtered payments, selected when the URL names none. */
  defaultInvoiceId: string | null
}

/** The "Invoice preview" card (a tax invoice for one paid order). */
export interface InvoicePreview {
  /** "INV-2026-1049" */
  invoiceNumber: string
  /** "19 Oct 2026" */
  issuedLabel: string
  billedTo: string
  orderId: string
  /** "21 Oct trip" */
  tripLabel: string
  lines: { label: string; amount: number }[]
  /** LKR */
  total: number
  cardLast4: string
  reference: string
  /** The payment's status, for the badge (a refunded order keeps its invoice). */
  status: Exclude<PaymentHistoryStatus, 'failed'>
}
