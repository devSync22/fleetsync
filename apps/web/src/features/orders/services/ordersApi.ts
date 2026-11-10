import { ApiError } from '@/services/apiClient'
import { formatLKR } from '@/lib/utils'
import { distanceLine, formatValidUntil, totalOf, vehicleClassOf } from '../fareRates'
import { orderDetailsMock } from '../mocks/orderDetailsMock'
import { customerDirectory, pastOrdersMock, type PastOrder } from '../mocks/pastOrdersMock'
import { submittedOrdersMock } from '../mocks/submittedOrdersMock'
import type {
  FareLine,
  OrderDetail,
  OrderEvent,
  OrderFacts,
  OrderStatus,
  QuotationInput,
  QuotationResponse,
  SentQuotation,
  SubmittedOrder,
} from '../types'

/*
 * Mocked until the order endpoints exist:
 *   getSubmittedOrders → apiClient.get<SubmittedOrder[]>('/coordinator/orders')
 *   getOrderDetail     → apiClient.get<OrderDetail>(`/coordinator/orders/${orderId}`)
 *   getSentQuotation   → apiClient.get<SentQuotation>(`/coordinator/orders/${orderId}/quotation`)
 *   saveQuotationDraft → apiClient.put(`/coordinator/orders/${orderId}/quotation`, input)
 *   sendQuotation      → apiClient.post<SentQuotation>(`/coordinator/orders/${orderId}/quotation/send`, input)
 *
 * Quotations sent in this session are kept in memory, so the order moves to Quoted and the
 * quotation page can be reopened. In dev, add `mock=empty` or `mock=error` to the URL query.
 */

const MOCK_LATENCY_MS = 400
const COORDINATOR_NAME = 'Nimal Perera'
const CLOSED: OrderStatus[] = ['completed', 'trip-cancelled', 'quotation-expired', 'declined']

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

const contactNameOf = (contact: string) => contact.split(' · ')[0]
const initialsOf = (name: string) =>
  name
    .replace(/^Dr\. /, '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
/** "Yesterday, 16:40" → "yesterday, 16:40"; dates stay as they are. */
const inSentence = (when: string) => (/^(Today|Yesterday)/.test(when) ? when[0].toLowerCase() + when.slice(1) : when)

function fareLinesOf(past: PastOrder): FareLine[] {
  return [
    distanceLine(past.distanceKm, past.vehicleClass),
    ...past.extras.map(([label, detail, amount], i) => ({ id: `extra-${i}`, label, detail, amount })),
  ]
}

function responseOf(past: PastOrder): QuotationResponse {
  const { outcome } = past
  switch (outcome.kind) {
    case 'awaiting':
      return {
        status: 'awaiting',
        note: outcome.opened ? `Opened ${inSentence(outcome.opened)}, not answered yet` : 'Not opened yet',
      }
    case 'paid':
      return { status: 'accepted', paid: true, note: `Accepted and paid ${inSentence(outcome.at)} · card via PayHere` }
    case 'payment-failed':
      return { status: 'accepted', paid: false, note: `Accepted ${inSentence(outcome.at)} · the card payment failed` }
    case 'declined':
      return { status: 'declined', note: `Declined ${inSentence(outcome.at)}`, reason: outcome.reason }
    case 'expired':
      return { status: 'expired', note: `Expired ${inSentence(outcome.at)} without an answer` }
  }
}

function quotationFromPast(past: PastOrder, row: SubmittedOrder): SentQuotation {
  const customer = customerDirectory[row.customerName]
  const contactName = contactNameOf(customer.contact)
  const lines = fareLinesOf(past)
  return {
    orderId: row.orderId,
    customerName: row.customerName,
    contactName,
    contactInitials: initialsOf(contactName),
    route: row.route,
    vehicleLabel: vehicleClassOf(past.vehicleClass).label,
    lines,
    total: totalOf(lines),
    validUntilLabel: formatValidUntil(past.quotation.validUntil),
    sentBy: COORDINATOR_NAME,
    sentAt: past.quotation.sentAt,
    message: past.quotation.message,
    delivery: { email: 'delivered', account: past.outcome.opened ? 'opened' : 'not-opened' },
    response: responseOf(past),
  }
}

/** Order facts for an order past review, built from its list row and its past-order record. */
function factsFromPast(row: SubmittedOrder, past: PastOrder): OrderFacts {
  const lines = fareLinesOf(past)
  const response = responseOf(past)
  return {
    orderId: row.orderId,
    status: row.status,
    payment: row.payment,
    customerName: row.customerName,
    submittedLabel: inSentence(past.submittedAt),
    pickupLabel: past.pickupWhen.replace(/ \d{4},/, ','),
    customer: customerDirectory[row.customerName],
    route: {
      pickupPlace: past.pickupPlace,
      pickupWhen: past.pickupWhen,
      destinationPlace: past.destinationPlace,
      destinationWhen: past.destinationWhen,
      distanceKm: past.distanceKm,
    },
    cargo: past.cargo,
    estimate: {
      vehicleClass: past.vehicleClass,
      lines: lines.filter((l) => l.id !== 'distance'),
      validUntil: past.quotation.validUntil,
      message: past.quotation.message,
    },
    quotation: row.quotation ?? { amount: totalOf(lines), openedLabel: response.note, expiresInMinutes: null },
    tripId: row.tripId,
  }
}

function historyOf(facts: OrderFacts, submittedAt: string, past: PastOrder | undefined, sessionQuote?: SentQuotation): OrderEvent[] {
  const contactName = contactNameOf(facts.customer.contact)
  const events: OrderEvent[] = [
    {
      id: 'submitted',
      title: 'Order submitted',
      detail: contactName === '—' ? facts.customerName : `by ${contactName} · ${facts.customerName}`,
      when: submittedAt,
      tone: 'neutral',
    },
  ]

  const quote = sessionQuote ?? (past ? quotationFromPast(past, submittedOrdersMock.find((o) => o.orderId === facts.orderId)!) : null)
  if (!quote) return events

  events.push({
    id: 'quoted',
    title: `Quotation sent · ${formatLKR(quote.total)}`,
    detail: `by ${quote.sentBy} · valid until ${quote.validUntilLabel}`,
    when: sessionQuote ? `Today, ${quote.sentAt}` : quote.sentAt,
    tone: 'accent',
  })
  if (!past) return events

  const { outcome } = past
  if (outcome.opened) {
    events.push({ id: 'opened', title: 'Customer opened the quotation', when: outcome.opened, tone: 'info' })
  }
  switch (outcome.kind) {
    case 'paid':
      events.push({ id: 'paid', title: 'Accepted and paid', detail: `${formatLKR(quote.total)} · card via PayHere`, when: outcome.at, tone: 'success' })
      if (outcome.trip) {
        events.push({ id: 'trip', title: `Trip ${outcome.trip.id} created`, detail: `by ${COORDINATOR_NAME}`, when: outcome.trip.at, tone: 'accent' })
      }
      if (outcome.delivered) {
        events.push({ id: 'delivered', title: 'Delivered', detail: 'Proof of delivery recorded by the driver', when: outcome.delivered, tone: 'success' })
      }
      break
    case 'payment-failed':
      events.push({ id: 'failed', title: 'Accepted · card payment failed', detail: 'The customer can retry the payment from their account', when: outcome.at, tone: 'danger' })
      break
    case 'declined':
      events.push({ id: 'declined', title: 'Declined by the customer', detail: `“${outcome.reason}”`, when: outcome.at, tone: 'danger' })
      break
    case 'expired':
      events.push({ id: 'expired', title: 'Quotation expired', detail: 'The customer did not answer before it expired', when: outcome.at, tone: 'neutral' })
      break
  }
  return events
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

export async function getOrderDetail(orderId: string): Promise<OrderDetail> {
  await mockRequest()
  const row = submittedOrdersMock.find((o) => o.orderId === orderId)
  const past = pastOrdersMock.find((o) => o.orderId === orderId)
  const authored = orderDetailsMock.find((o) => o.orderId === orderId)
  const facts = authored ?? (row && past ? factsFromPast(row, past) : undefined)
  if (!row || !facts) throw new ApiError(`Order ${orderId} was not found.`, 404)

  const sessionQuote = sent.get(orderId)
  const detail: OrderDetail = {
    ...facts,
    history: historyOf(facts, past?.submittedAt ?? row.submittedLabel, past, sessionQuote),
    closedNote: CLOSED.includes(row.status) ? row.routeNote : null,
  }

  if (sessionQuote) {
    return {
      ...detail,
      status: 'quoted',
      quotation: { amount: sessionQuote.total, openedLabel: 'Not opened yet', expiresInMinutes: null },
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

  const contactName = contactNameOf(detail.customer.contact)
  const quotation: SentQuotation = {
    orderId,
    customerName: detail.customerName,
    contactName,
    contactInitials: initialsOf(contactName),
    route: submittedOrdersMock.find((o) => o.orderId === orderId)?.route ?? '—',
    vehicleLabel: vehicleClassOf(input.vehicleClass).label,
    lines: input.lines,
    total,
    validUntilLabel: formatValidUntil(input.validUntil),
    sentBy: COORDINATOR_NAME,
    sentAt: new Date().toTimeString().slice(0, 5),
    message: input.message.trim(),
    delivery: { email: 'delivered', account: 'not-opened' },
    response: { status: 'awaiting', note: 'Not opened yet' },
  }
  sent.set(orderId, quotation)
  drafts.delete(orderId)
  return quotation
}

export async function getSentQuotation(orderId: string): Promise<SentQuotation> {
  await mockRequest()
  const sessionQuote = sent.get(orderId)
  if (sessionQuote) return sessionQuote
  const row = submittedOrdersMock.find((o) => o.orderId === orderId)
  const past = pastOrdersMock.find((o) => o.orderId === orderId)
  if (row && past) return quotationFromPast(past, row)
  if (!row) throw new ApiError(`Order ${orderId} was not found.`, 404)
  throw new ApiError(`No quotation has been sent for ${orderId} yet.`, 404)
}
