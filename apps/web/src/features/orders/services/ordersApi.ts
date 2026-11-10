import { ApiError } from '@/services/apiClient'
import { formatValidUntil, totalOf, vehicleClassOf } from '../fareRates'
import { orderDetailsMock } from '../mocks/orderDetailsMock'
import { submittedOrdersMock } from '../mocks/submittedOrdersMock'
import type { OrderDetail, QuotationInput, SentQuotation, SubmittedOrder } from '../types'

/*
 * Mocked until the order endpoints exist:
 *   getSubmittedOrders → apiClient.get<SubmittedOrder[]>('/coordinator/orders')
 *   getOrderDetail     → apiClient.get<OrderDetail>(`/coordinator/orders/${orderId}`)
 *   saveQuotationDraft → apiClient.put(`/coordinator/orders/${orderId}/quotation`, input)
 *   sendQuotation      → apiClient.post<SentQuotation>(`/coordinator/orders/${orderId}/quotation/send`, input)
 *
 * Quotations sent in this session are kept in memory, so the order moves to Quoted and the
 * "Quotation sent" page can be reopened. In dev, add `mock=empty` or `mock=error` to the URL query.
 */

const MOCK_LATENCY_MS = 400
const COORDINATOR_NAME = 'Nimal Perera'

const drafts = new Map<string, QuotationInput>()
const sent = new Map<string, SentQuotation>()

async function mockRequest() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const scenario = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
  if (scenario === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario
}

function withSentQuotations(order: SubmittedOrder): SubmittedOrder {
  const quotation = sent.get(order.orderId)
  if (!quotation) return order
  return {
    ...order,
    status: 'quoted',
    quotation: { amount: quotation.total, openedLabel: 'Not opened yet', expiresInMinutes: null },
  }
}

export async function getSubmittedOrders(): Promise<SubmittedOrder[]> {
  const scenario = await mockRequest()
  if (scenario === 'empty') return []
  return submittedOrdersMock.map(withSentQuotations)
}

/** Builds a read-only view for orders without a Review order frame, from the list row. */
function detailFromRow(row: SubmittedOrder): OrderDetail {
  const [from, to] = row.route.split(' → ')
  return {
    orderId: row.orderId,
    status: row.status,
    payment: row.payment,
    customerName: row.customerName,
    submittedLabel: row.submittedLabel.toLowerCase(),
    pickupLabel: row.pickupDate || '—',
    customer: { contact: '—', email: '—', customerSince: '—' },
    route: { pickupPlace: from, pickupWhen: row.routeNote, destinationPlace: to, destinationWhen: '—', distanceKm: 0 },
    cargo: { type: row.cargo, weight: row.cargoAmount, unitsLabel: 'Units', units: '—', handling: '—', note: null },
    estimate: { vehicleClass: 'heavy-9', lines: [], validUntil: '', message: '' },
    quotation: row.quotation,
    tripId: row.tripId,
  }
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  await mockRequest()
  const row = submittedOrdersMock.find((o) => o.orderId === orderId)
  const detail = orderDetailsMock.find((o) => o.orderId === orderId) ?? (row ? detailFromRow(row) : undefined)
  if (!detail) throw new ApiError(`Order ${orderId} was not found.`, 404)

  const quotation = sent.get(orderId)
  if (quotation) {
    return {
      ...detail,
      status: 'quoted',
      quotation: { amount: quotation.total, openedLabel: 'Not opened yet', expiresInMinutes: null },
    }
  }
  const draft = drafts.get(orderId)
  return draft ? { ...detail, estimate: { ...draft, lines: draft.lines.filter((l) => l.id !== 'distance') } } : detail
}

export async function saveQuotationDraft(orderId: string, input: QuotationInput): Promise<{ savedAt: string }> {
  await mockRequest()
  drafts.set(orderId, input)
  return { savedAt: new Date().toTimeString().slice(0, 5) }
}

export async function sendQuotation(orderId: string, input: QuotationInput): Promise<SentQuotation> {
  const detail = await getOrderDetail(orderId)
  if (detail.status !== 'pending-review') {
    throw new ApiError(`${orderId} has already been quoted.`, 409)
  }
  const total = totalOf(input.lines)
  if (total <= 0) throw new ApiError('The quotation total must be more than LKR 0.', 400)
  if (!input.validUntil) throw new ApiError('Choose until when the quotation is valid.', 400)

  const [contactName] = detail.customer.contact.split(' · ')
  const quotation: SentQuotation = {
    orderId,
    customerName: detail.customerName,
    contactName,
    contactInitials: contactName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
    route: submittedOrdersMock.find((o) => o.orderId === orderId)?.route ?? '—',
    vehicleLabel: vehicleClassOf(input.vehicleClass).label,
    lines: input.lines,
    total,
    validUntilLabel: formatValidUntil(input.validUntil),
    sentBy: COORDINATOR_NAME,
    sentAt: new Date().toTimeString().slice(0, 5),
    message: input.message.trim(),
    delivery: { email: 'delivered', account: 'not-opened' },
  }
  sent.set(orderId, quotation)
  drafts.delete(orderId)
  return quotation
}

export async function getSentQuotation(orderId: string): Promise<SentQuotation> {
  await mockRequest()
  const quotation = sent.get(orderId)
  if (!quotation) throw new ApiError(`No quotation has been sent for ${orderId} yet.`, 404)
  return quotation
}
