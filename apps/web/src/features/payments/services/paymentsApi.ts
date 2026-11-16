import { ApiError } from '@/services/apiClient'
import { mockOrderStore, type MockOrderForPayment } from '@/services/mockOrderStore'
import { nextPaymentId, paymentResultsMock, type PaymentRecord } from '../mocks/paymentResultsMock'
import type { PaymentResult, PaymentSummary } from '../types'

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
 *
 * Mock scenarios (dev only, add to the URL of the Payment page):
 *   ?mock=error    — every call fails like a network error
 *   ?mock=declined — the payment fails with "Declined by your bank"
 *   ?mock=pending  — the result stays "pending" for a few seconds, then succeeds
 */

const MOCK_LATENCY_MS = 400
const MOCK_PENDING_MS = 4000
const MOCK_CARD_LAST4 = '4421'

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const pad = (n: number) => String(n).padStart(2, '0')
/** "20 Oct, 18:00" */
const shortLabel = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
/** "20 Oct 2026, 12:00" */
const longLabel = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`

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

/** Turns a settled "pending" record into its outcome (and marks the order paid on success). */
function settle(record: PaymentRecord) {
  if (record.status !== 'pending' || !record.settlesAt || Date.now() < record.settlesAt) return
  record.status = record.settlesAs ?? 'success'
  record.cardLast4 = MOCK_CARD_LAST4
  if (record.status === 'success') {
    mockOrderStore().markOrderPaid(record.orderId, {
      amount: record.amount,
      paidOnLabel: shortLabel(mockOrderStore().now()),
      cardLast4: MOCK_CARD_LAST4,
      reference: record.reference,
    })
  }
}

/** Drops the mock-only settle fields, so the page gets exactly what the endpoint will return. */
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
  const paymentId = nextPaymentId()
  const record: PaymentRecord = {
    paymentId,
    orderId,
    status: 'success',
    amount: quotation.total,
    cardLast4: MOCK_CARD_LAST4,
    reference: paymentId,
    dateLabel: longLabel(store.now()),
    failureReason: null,
    validUntilLabel: shortLabel(new Date(quotation.validUntil)),
  }

  if (scenario === 'declined') {
    record.status = 'failed'
    record.failureReason = 'Declined by your bank'
  } else if (scenario === 'pending') {
    record.status = 'pending'
    record.cardLast4 = null
    record.settlesAt = Date.now() + MOCK_PENDING_MS
    record.settlesAs = 'success'
  } else {
    store.markOrderPaid(orderId, {
      amount: record.amount,
      paidOnLabel: shortLabel(store.now()),
      cardLast4: MOCK_CARD_LAST4,
      reference: record.reference,
    })
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
