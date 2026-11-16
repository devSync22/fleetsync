import { ApiError } from '@/services/apiClient'
import { mockOrderStore, type MockOrderForPayment } from '@/services/mockOrderStore'
import { invoiceIdFor, paymentHistoryMock } from '../mocks/paymentHistoryMock'
import { nextAttemptId, nextPaymentReference, paymentResultsMock, type PaymentRecord } from '../mocks/paymentResultsMock'
import type {
  InvoicePreview,
  PaymentHistoryQuery,
  PaymentHistoryResult,
  PaymentHistoryRow,
  PaymentHistoryStatus,
  PaymentKpis,
  PaymentPeriod,
  PaymentResult,
  PaymentSummary,
} from '../types'

/*
 * Card payments go through PayHere only; FleetSync never sees or stores card details.
 *
 * Future flow, replacing the mocks below:
 *   1. getPaymentSummary → apiClient.get<PaymentSummary>(`/customer/payments/summary/${orderId}`)
 *   2. startPayment      → apiClient.post('/customer/payments/checkout', { orderId }) returns
 *                          { paymentId, payload } with the signed PayHere payload; the page then calls
 *                          payhere.startPayment(payload) and PayHere opens its own card window.
 *                          PayHere notifies our backend (notify_url); the browser goes to the result page.
 *   3. getPaymentResult  → apiClient.get<PaymentResult>(`/customer/payments/${paymentId}`), polled by the
 *                          result page until the status is no longer "pending".
 *   4. getPaymentHistory → apiClient.get<PaymentHistoryResult>('/customer/payments', { params: query })
 *   5. getInvoicePreview → apiClient.get<InvoicePreview>(`/customer/invoices/${invoiceId}`)
 *   6. downloadInvoice   → apiClient.get(`/customer/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
 *
 * Mock scenarios (dev only, add to the page URL):
 *   ?mock=error    — every call fails like a network error
 *   ?mock=empty    — Payment history has no payments
 *   ?mock=declined — (Payment page) the payment fails with "Declined by your bank"
 *   ?mock=pending  — (Payment page) the result stays "pending" for a few seconds, then succeeds
 */

const MOCK_LATENCY_MS = 400
const MOCK_PENDING_MS = 4000
const MOCK_CARD_LAST4 = '4421'
export const PAYMENT_HISTORY_PAGE_SIZE = 6
// TODO: read the company from AuthContext once sign-in exists
const BILLED_TO = 'Lanka Tiles PLC'

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const pad = (n: number) => String(n).padStart(2, '0')
const time = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
/** "20 Oct" */
const dayMonth = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}`
/** "20 Oct, 18:00" */
const shortLabel = (d: Date) => `${dayMonth(d)}, ${time(d)}`
/** "20 Oct 2026, 12:00" */
const longLabel = (d: Date) => `${dayMonth(d)} ${d.getFullYear()}, ${time(d)}`
/** Local ISO without a zone, like the mock data: "2026-10-20T12:00:00" */
const localIso = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`

/* ───────────── Paying ───────────── */

/** The order, if it can be paid now; otherwise a 404 or 409 with what to do instead. */
function payableOrder(orderId: string) {
  const store = mockOrderStore()
  const order = store.getOrderForPayment(orderId)
  if (!order) throw new ApiError(`We couldn’t find order ${orderId} in your account.`, 404)
  const quotation = assertPayable(order, store.now())
  return { store, order, quotation }
}

function assertPayable(order: MockOrderForPayment, now: Date) {
  const { orderId, quotation } = order
  if (order.paymentStatus === 'paid') throw new ApiError(`${orderId} is already paid. There is nothing more to pay.`, 409)
  if (!quotation) throw new ApiError(`There is no quotation for ${orderId} yet, so there is nothing to pay.`, 409)
  if (quotation.status === 'declined') {
    throw new ApiError(`You declined the quotation for ${orderId}. Ask the coordinator in chat for a new one.`, 409)
  }
  if (quotation.status === 'expired' || new Date(quotation.validUntil) <= now) {
    throw new ApiError(
      `The quotation for ${orderId} expired on ${shortLabel(new Date(quotation.validUntil))}. The coordinator will price your order again.`,
      409,
    )
  }
  if (quotation.status === 'awaiting') {
    throw new ApiError(`Accept the quotation for ${orderId} first. Payment opens once you accept it.`, 409)
  }
  if (order.orderStatus !== 'accepted' || order.paymentStatus !== 'awaiting-payment') {
    throw new ApiError(`${orderId} can’t be paid right now.`, 409)
  }
  return quotation
}

function markPaid(record: PaymentRecord) {
  const store = mockOrderStore()
  record.cardLast4 = MOCK_CARD_LAST4
  record.invoiceId = invoiceIdFor(record.orderId, record.at)
  store.markOrderPaid(record.orderId, {
    amount: record.amount,
    paidOnLabel: shortLabel(new Date(record.at)),
    cardLast4: MOCK_CARD_LAST4,
    reference: record.reference ?? record.paymentId,
    invoiceId: record.invoiceId,
  })
}

/** Turns a settled "pending" record into its outcome (and marks the order paid on success). */
function settle(record: PaymentRecord) {
  if (record.status !== 'pending' || !record.settlesAt || Date.now() < record.settlesAt) return
  record.status = record.settlesAs ?? 'success'
  if (record.status === 'success') markPaid(record)
}

/** Drops the mock-only fields, so the page gets exactly what the endpoint will return. */
const toResult = (record: PaymentRecord): PaymentResult => ({
  paymentId: record.paymentId,
  orderId: record.orderId,
  status: record.status,
  amount: record.amount,
  cardLast4: record.cardLast4,
  reference: record.reference,
  dateLabel: record.dateLabel,
  failureReason: record.failureReason,
  validUntilLabel: record.validUntilLabel,
  invoiceId: record.invoiceId,
})

/** What to pay for an accepted, unpaid order with a valid quotation; 409 otherwise. */
export async function getPaymentSummary(orderId: string): Promise<PaymentSummary> {
  await mockRequest()
  const { order, quotation } = payableOrder(orderId)
  return {
    orderId,
    route: order.route,
    pickupLabel: order.pickupLabel,
    quotationAmount: quotation.total,
    total: quotation.total,
    validUntilLabel: shortLabel(new Date(quotation.validUntil)),
  }
}

/**
 * Pays for the order. The mock stands in for the PayHere window and returns the outcome straight away
 * (or "pending" with ?mock=pending). On success the order is marked paid.
 */
export async function startPayment(orderId: string): Promise<PaymentResult> {
  const scenario = await mockRequest()
  const { store, quotation } = payableOrder(orderId)
  const now = store.now()
  const failed = scenario === 'declined'
  const reference = failed ? null : nextPaymentReference()
  const record: PaymentRecord = {
    paymentId: reference ?? nextAttemptId(),
    orderId,
    status: 'success',
    amount: quotation.total,
    cardLast4: MOCK_CARD_LAST4,
    reference,
    dateLabel: longLabel(now),
    failureReason: null,
    validUntilLabel: shortLabel(new Date(quotation.validUntil)),
    invoiceId: null,
    at: localIso(now),
  }

  if (failed) {
    record.status = 'failed'
    record.failureReason = 'Declined by your bank'
  } else if (scenario === 'pending') {
    record.status = 'pending'
    record.cardLast4 = null
    record.settlesAt = Date.now() + MOCK_PENDING_MS
    record.settlesAs = 'success'
  } else {
    markPaid(record)
  }

  paymentResultsMock.push(record)
  return toResult(record)
}

/** One payment attempt; poll while it is "pending". */
export async function getPaymentResult(paymentId: string): Promise<PaymentResult> {
  await mockRequest()
  const record = paymentResultsMock.find((p) => p.paymentId === paymentId)
  if (!record) throw new ApiError(`We couldn’t find payment ${paymentId}.`, 404)
  settle(record)
  return toResult(record)
}

/* ───────────── History and invoices ───────────── */

/** How a failure reads in the history list. */
const historyReason: Record<string, string> = { 'Declined by your bank': 'Card declined by the bank' }

/** Everything the history and invoices need about one payment, from the session or the seed. */
type HistoryEntry = {
  paymentId: string
  orderId: string
  at: Date
  amount: number
  status: PaymentHistoryStatus
  reference: string | null
  cardLast4: string | null
  invoiceId: string | null
  route: string
  /** "21 Oct" — the pickup day, for "21 Oct trip". */
  tripDay: string
  failureReason: string | null
}

/** "Tue, 21 Oct, 08:00" / "Today, 08:00" / "12 Oct, 07:30" → "21 Oct" */
function tripDayFrom(pickupLabel: string, now: Date) {
  if (pickupLabel.startsWith('Today')) return dayMonth(now)
  return /(\d{1,2} \w{3})/.exec(pickupLabel)?.[1] ?? pickupLabel
}

/** All payments, newest first: this session's attempts (settled ones), then the stored history. */
function historyEntries(): HistoryEntry[] {
  const store = mockOrderStore()
  const now = store.now()

  const session: HistoryEntry[] = paymentResultsMock
    .map((record) => {
      settle(record)
      return record
    })
    .filter((record) => record.status !== 'pending')
    .map((record) => {
      const order = store.getOrderForPayment(record.orderId)
      return {
        paymentId: record.paymentId,
        orderId: record.orderId,
        at: new Date(record.at),
        amount: record.amount,
        status: record.status === 'success' ? 'paid' : 'failed',
        reference: record.reference,
        cardLast4: record.cardLast4,
        invoiceId: record.invoiceId,
        route: order?.route ?? '—',
        tripDay: tripDayFrom(order?.pickupLabel ?? '', now),
        failureReason: record.failureReason,
      }
    })

  const seeded: HistoryEntry[] = paymentHistoryMock.map((seed) => {
    const order = seed.older ? null : store.getOrderForPayment(seed.orderId)
    const tripDate = seed.older ? new Date(`${seed.older.tripDate}T00:00:00`) : null
    return {
      paymentId: seed.paymentId,
      orderId: seed.orderId,
      at: new Date(seed.at),
      amount: seed.amount,
      status: seed.status,
      reference: seed.paymentId,
      cardLast4: seed.cardLast4,
      invoiceId: invoiceIdFor(seed.orderId, seed.at),
      route: seed.older?.route ?? order?.route ?? '—',
      tripDay: tripDate ? dayMonth(tripDate) : tripDayFrom(order?.pickupLabel ?? '', now),
      failureReason: null,
    }
  })

  // Newest first; for equal times the later session attempt comes first.
  return [...session.reverse(), ...seeded].sort((a, b) => b.at.getTime() - a.at.getTime())
}

function periodStart(period: PaymentPeriod, now: Date) {
  if (period === 'this-year') return new Date(now.getFullYear(), 0, 1)
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  start.setMonth(start.getMonth() - (period === 'last-3-months' ? 3 : 6))
  return start
}

function kpisOf(entries: HistoryEntry[], now: Date): PaymentKpis {
  const sameMonth = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  const paid = entries.filter((e) => e.status === 'paid')
  const paidThisMonth = paid.filter((e) => sameMonth(e.at))
  const paidThisYear = paid.filter((e) => e.at.getFullYear() === now.getFullYear())
  const last = paid[0]
  const sum = (list: HistoryEntry[]) => list.reduce((total, e) => total + e.amount, 0)
  return {
    monthLabel: MONTH_NAMES[now.getMonth()],
    paidThisMonth: { amount: sum(paidThisMonth), count: paidThisMonth.length },
    lastPayment: last ? { amount: last.amount, orderId: last.orderId, dateLabel: dayMonth(last.at) } : null,
    failedThisMonth: entries.filter((e) => e.status === 'failed' && sameMonth(e.at)).length,
    paidThisYear: { amount: sum(paidThisYear), orderCount: new Set(paidThisYear.map((e) => e.orderId)).size },
  }
}

const toRow = (entry: HistoryEntry): PaymentHistoryRow => ({
  paymentId: entry.paymentId,
  dateLabel: dayMonth(entry.at),
  timeLabel: time(entry.at),
  orderId: entry.orderId,
  routeOrReason:
    entry.status === 'failed' ? (historyReason[entry.failureReason ?? ''] ?? entry.failureReason ?? 'Payment failed') : entry.route,
  amount: entry.amount,
  reference: entry.reference,
  status: entry.status,
  invoiceId: entry.status === 'failed' ? null : entry.invoiceId,
})

/** The Payments page: KPIs over every payment, and one page of the filtered history (6 per page). */
export async function getPaymentHistory(query: PaymentHistoryQuery): Promise<PaymentHistoryResult> {
  const scenario = await mockRequest()
  const now = mockOrderStore().now()
  const all = scenario === 'empty' ? [] : historyEntries()

  const from = periodStart(query.period, now)
  const filtered = all.filter((e) => e.at >= from && (query.status === 'all' || e.status === query.status))
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAYMENT_HISTORY_PAGE_SIZE))
  const page = Math.min(Math.max(1, Math.trunc(query.page) || 1), pageCount)

  return {
    items: filtered.slice((page - 1) * PAYMENT_HISTORY_PAGE_SIZE, page * PAYMENT_HISTORY_PAGE_SIZE).map(toRow),
    total: filtered.length,
    page,
    pageCount,
    kpis: kpisOf(all, now),
    defaultInvoiceId: filtered.find((e) => e.status === 'paid')?.invoiceId ?? null,
  }
}

/**
 * Invoice lines from the quotation: transport (distance, load, tolls) and handling (loading, unloading,
 * fragile goods). Older orders without a stored quotation are split 82 / 18.
 */
function invoiceLines(entry: HistoryEntry) {
  const quotation = mockOrderStore().getOrderForPayment(entry.orderId)?.quotation
  const handlingLabels = ['Loading and unloading', 'Fragile handling']
  const handling = quotation
    ? quotation.lines.filter((l) => handlingLabels.includes(l.label)).reduce((sum, l) => sum + l.amount, 0)
    : Math.round((entry.amount * 0.18) / 50) * 50
  return [
    { label: `Transport, ${entry.route}`, amount: entry.amount - handling },
    { label: 'Loading, unloading and handling', amount: handling },
  ]
}

/** One invoice (a paid — or later refunded — order). */
export async function getInvoicePreview(invoiceId: string): Promise<InvoicePreview> {
  await mockRequest()
  // Future call: apiClient.get<InvoicePreview>(`/customer/invoices/${invoiceId}`)
  const entry = historyEntries().find((e) => e.invoiceId === invoiceId && e.status !== 'failed')
  if (!entry || entry.status === 'failed') throw new ApiError(`We couldn’t find invoice ${invoiceId}.`, 404)
  return {
    invoiceNumber: invoiceId,
    issuedLabel: `${dayMonth(entry.at)} ${entry.at.getFullYear()}`,
    billedTo: BILLED_TO,
    orderId: entry.orderId,
    tripLabel: `${entry.tripDay} trip`,
    lines: invoiceLines(entry),
    total: entry.amount,
    cardLast4: entry.cardLast4 ?? MOCK_CARD_LAST4,
    reference: entry.reference ?? entry.paymentId,
    status: entry.status,
  }
}

/**
 * For now: opens the browser's print dialog, where print CSS on the page leaves only the invoice
 * (the customer can choose "Save as PDF"). The invoice must be the one shown in the preview.
 */
export async function downloadInvoice(invoiceId: string): Promise<void> {
  // Future call: apiClient.get(`/customer/invoices/${invoiceId}/pdf`, { responseType: 'blob' }), then save the file.
  await getInvoicePreview(invoiceId)
  window.print()
}
