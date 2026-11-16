import { formatLKR } from '@/lib/utils'
import { ApiError } from '@/services/apiClient'
import { registerMockOrderStore } from '@/services/mockOrderStore'
import { MOCK_NOW, MOCK_TODAY, myOrdersMock, type MyOrderRecord } from '../mocks/myOrdersMock'
import { buildSubmittedOrder } from '../mocks/newOrderMock'
import { orderDetailsMock, progress } from '../mocks/orderDetailsMock'
import { quotationsMock, type QuotationRecord } from '../mocks/quotationsMock'
import { myOrdersTabs } from '../myOrdersTabs'
import { DECLINE_REASON_MAX, effectiveStatus } from '../quotationStatus'
import type {
  CreatedOrder,
  CustomerOrderDetail,
  CustomerOrderRow,
  CustomerOrderStatus,
  CustomerQuotation,
  MyOrdersPeriod,
  MyOrdersQuery,
  MyOrdersResult,
  MyOrdersTab,
  NewOrderDraft,
} from '../types'

/*
 * Mocked until the customer order endpoints exist:
 *   getMyOrders    → apiClient.get<MyOrdersResult>('/customer/orders', { params: query })
 *   getOrderDetail   → apiClient.get<CustomerOrderDetail>(`/customer/orders/${orderId}`)
 *   createOrder      → apiClient.post<CreatedOrder>('/customer/orders', draft)
 *   getQuotation     → apiClient.get<CustomerQuotation>(`/customer/quotations/${orderId}`)
 *   acceptQuotation  → apiClient.post<CustomerQuotation>(`/customer/quotations/${orderId}/accept`)
 *   declineQuotation → apiClient.post<CustomerQuotation>(`/customer/quotations/${orderId}/decline`, { reason })
 *
 * The mock filters, counts and paginates the way the endpoint will, so the page only reads
 * the result. In dev, add `mock=empty` or `mock=error` to the URL query.
 */

const MOCK_LATENCY_MS = 400
export const MY_ORDERS_PAGE_SIZE = 7

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

/** Earliest `placedOn` (YYYY-MM-DD) included in the period, or null for all time. */
function periodStart(period: MyOrdersPeriod): string | null {
  const start = new Date(`${MOCK_TODAY}T00:00:00`)
  switch (period) {
    case 'last-30-days':
      start.setDate(start.getDate() - 30)
      break
    case 'last-3-months':
      start.setMonth(start.getMonth() - 3)
      break
    case 'last-12-months':
      start.setFullYear(start.getFullYear() - 1)
      break
    case 'all-time':
      return null
  }
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`
}

/** Matches the order number or either city on the route, ignoring case. */
function matchesSearch(order: CustomerOrderRow, search: string) {
  const needle = search.trim().toLowerCase()
  return !needle || order.orderId.toLowerCase().includes(needle) || order.route.toLowerCase().includes(needle)
}

/** Drops the mock-only `placedOn` so the page gets exactly what the endpoint will return. */
const toRow = (order: MyOrderRecord): CustomerOrderRow => ({
  orderId: order.orderId,
  placedLabel: order.placedLabel,
  route: order.route,
  cargo: order.cargo,
  pickupLabel: order.pickupLabel,
  amount: order.amount,
  status: order.status,
})

export async function getMyOrders(query: MyOrdersQuery): Promise<MyOrdersResult> {
  const scenario = await mockRequest()
  const source = scenario === 'empty' ? [] : myOrdersMock

  const from = periodStart(query.period)
  const matching = source.filter((o) => (!from || o.placedOn >= from) && matchesSearch(o, query.search))

  const tabCounts = Object.fromEntries(
    myOrdersTabs.map((tab) => [tab.id, matching.filter((o) => tab.statuses === 'any' || tab.statuses.includes(o.status)).length]),
  ) as Record<MyOrdersTab, number>

  const activeTab = myOrdersTabs.find((tab) => tab.id === query.tab) ?? myOrdersTabs[0]
  const inTab = matching.filter((o) => activeTab.statuses === 'any' || activeTab.statuses.includes(o.status))

  const pageCount = Math.max(1, Math.ceil(inTab.length / MY_ORDERS_PAGE_SIZE))
  const page = Math.min(Math.max(1, Math.trunc(query.page) || 1), pageCount)
  const items = inTab.slice((page - 1) * MY_ORDERS_PAGE_SIZE, page * MY_ORDERS_PAGE_SIZE).map(toRow)

  return { items, total: inTab.length, page, pageCount, tabCounts }
}

/** One order of the signed-in customer. Rejects with a 404 ApiError for an unknown id. */
export async function getOrderDetail(orderId: string): Promise<CustomerOrderDetail> {
  await mockRequest()
  // Future call: apiClient.get<CustomerOrderDetail>(`/customer/orders/${orderId}`)
  const detail = orderDetailsMock.find((order) => order.orderId === orderId)
  if (!detail) throw new ApiError(`We couldn’t find order ${orderId} in your account.`, 404)
  return detail
}

/** Next free ORD- number across the list and detail mocks. */
function nextOrderId() {
  const ids = [...myOrdersMock, ...orderDetailsMock].map((order) => Number(order.orderId.replace('ORD-', '')))
  return `ORD-${Math.max(...ids) + 1}`
}

/**
 * Submits a new transport order. It starts as "Pending review" until a coordinator quotes it.
 * The mock adds it to the in-memory lists, so it shows at the top of My orders and opens in Order details
 * (until the page is reloaded).
 */
export async function createOrder(draft: NewOrderDraft): Promise<CreatedOrder> {
  await mockRequest()
  // Future call: apiClient.post<CreatedOrder>('/customer/orders', draft)
  const orderId = nextOrderId()
  const { row, detail } = buildSubmittedOrder(orderId, draft, new Date())
  myOrdersMock.unshift(row)
  orderDetailsMock.push(detail)
  return { orderId }
}

/* ───────────── Fare quotations ───────────── */

/**
 * "Now" for deciding whether a quotation has expired.
 * TODO: use the real clock (or server time) once the API exists; the mock uses the mock calendar's "today".
 */
export function currentTime() {
  return new Date(MOCK_NOW)
}

const pad = (n: number) => String(n).padStart(2, '0')
/** "Today, 12:00" — on the same clock as the expiry check, so a decision never looks later than validUntil. */
function todayLabel() {
  const now = currentTime()
  return `Today, ${pad(now.getHours())}:${pad(now.getMinutes())}`
}

function findQuotation(orderId: string): QuotationRecord {
  const quotation = quotationsMock.find((q) => q.orderId === orderId)
  if (quotation) return quotation
  const known = myOrdersMock.some((o) => o.orderId === orderId) || orderDetailsMock.some((o) => o.orderId === orderId)
  throw new ApiError(
    known
      ? `There is no quotation for ${orderId} yet. A coordinator reviews new orders and sends a fare quotation, usually within a working day.`
      : `We couldn’t find order ${orderId} in your account.`,
    404,
  )
}

/** Adds `paymentDue` from the order and returns a copy, so later mock changes never touch React state. */
function toQuotation(record: QuotationRecord): CustomerQuotation {
  const detail = orderDetailsMock.find((o) => o.orderId === record.orderId)
  return structuredClone({ ...record, paymentDue: detail?.payment?.status === 'awaiting-payment' })
}

/** 409 unless the quotation is still awaiting a reply and within its validity. */
function assertDecidable(quotation: QuotationRecord) {
  const status = effectiveStatus(quotation, currentTime())
  if (status === 'accepted') throw new ApiError('You have already accepted this quotation.', 409)
  if (status === 'declined') {
    throw new ApiError('You declined this quotation, so it can’t be changed. Ask the coordinator in chat for a new one.', 409)
  }
  if (status === 'expired') {
    throw new ApiError(
      `This quotation expired on ${quotation.validUntilLabel}. The coordinator will price your order again and send a new quotation.`,
      409,
    )
  }
}

/** Moves the order to `status` in both the My orders list and the Order details mock. */
function updateOrder(orderId: string, status: CustomerOrderStatus, change: (detail: CustomerOrderDetail) => Partial<CustomerOrderDetail>) {
  const row = myOrdersMock.find((o) => o.orderId === orderId)
  if (row) row.status = status
  const index = orderDetailsMock.findIndex((o) => o.orderId === orderId)
  if (index >= 0) {
    const detail = orderDetailsMock[index]
    orderDetailsMock[index] = { ...detail, status, ...change(detail) }
  }
}

/** The quotation for one order. 404 when the order has not been quoted yet (or isn't the customer's). */
export async function getQuotation(orderId: string): Promise<CustomerQuotation> {
  await mockRequest()
  // Future call: apiClient.get<CustomerQuotation>(`/customer/quotations/${orderId}`)
  return toQuotation(findQuotation(orderId))
}

/** Accepts an awaiting, still-valid quotation; the order becomes "Accepted" and waits for payment. */
export async function acceptQuotation(orderId: string): Promise<CustomerQuotation> {
  await mockRequest()
  // Future call: apiClient.post<CustomerQuotation>(`/customer/quotations/${orderId}/accept`)
  const quotation = findQuotation(orderId)
  assertDecidable(quotation)
  const when = todayLabel()
  quotation.status = 'accepted'
  quotation.decidedAtLabel = when

  updateOrder(orderId, 'accepted', (detail) => ({
    progress: progress([detail.progress[0].caption, formatLKR(quotation.total), 'Awaiting payment'], 2, 'current'),
    updates: [{ title: 'Fare quotation accepted', detail: formatLKR(quotation.total), when, tone: 'success' }, ...detail.updates],
    payment: { quotationAmount: quotation.total, paidOn: null, method: null, reference: null, status: 'awaiting-payment' },
  }))
  return toQuotation(quotation)
}

/** Declines an awaiting, still-valid quotation, with an optional reason (max 500 characters). */
export async function declineQuotation(orderId: string, reason?: string): Promise<CustomerQuotation> {
  await mockRequest()
  // Future call: apiClient.post<CustomerQuotation>(`/customer/quotations/${orderId}/decline`, { reason })
  const quotation = findQuotation(orderId)
  assertDecidable(quotation)
  const trimmed = reason?.trim() ?? ''
  if (trimmed.length > DECLINE_REASON_MAX) {
    throw new ApiError(`Keep the reason to ${DECLINE_REASON_MAX} characters.`, 400)
  }
  const when = todayLabel()
  quotation.status = 'declined'
  quotation.decidedAtLabel = when
  quotation.declineReason = trimmed || undefined

  updateOrder(orderId, 'declined', (detail) => ({
    progress: progress([detail.progress[0].caption, 'Declined today'], 1, 'stopped'),
    updates: [
      { title: 'You declined the quotation', detail: trimmed || formatLKR(quotation.total), when, tone: 'neutral' },
      ...detail.updates,
    ],
    payment: null,
  }))
  return toQuotation(quotation)
}

/* ───────────── Mock store shared with features/payments ───────────── */

// Lets the payments mock read and update these in-memory orders without importing this feature.
// Remove together with services/mockOrderStore.ts once the API exists.
registerMockOrderStore({
  now: currentTime,

  getOrderForPayment(orderId) {
    const detail = orderDetailsMock.find((o) => o.orderId === orderId)
    if (!detail) return null
    const quotation = quotationsMock.find((q) => q.orderId === orderId)
    return {
      orderId,
      orderStatus: detail.status,
      route: detail.route,
      pickupLabel: quotation?.order.pickup.when ?? detail.pickup.when,
      paymentStatus: detail.payment?.status ?? null,
      quotation: quotation ? { status: quotation.status, total: quotation.total, validUntil: quotation.validUntil } : null,
    }
  },

  markOrderPaid(orderId, payment) {
    // The order stays "accepted" (there is no separate paid status); Order details shows it as paid
    // and the Trip scheduled step becomes the current one.
    updateOrder(orderId, 'accepted', (detail) => ({
      progress: progress(
        [detail.progress[0].caption, formatLKR(payment.amount), payment.paidOnLabel, 'Being scheduled'],
        3,
        'current',
      ),
      updates: [
        { title: 'Payment received', detail: `${formatLKR(payment.amount)} · online`, when: payment.paidOnLabel, tone: 'success' },
        ...detail.updates,
      ],
      payment: {
        quotationAmount: payment.amount,
        paidOn: payment.paidOnLabel,
        method: `Online · Card ending ${payment.cardLast4}`,
        reference: payment.reference,
        status: 'paid',
      },
    }))
  },
})
