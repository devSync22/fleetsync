/*
 * Mock-only bridge between features while there is no backend.
 *
 * The in-memory order, quotation and payment data belongs to features/customer-orders (its mocks).
 * Other features (payments, customer-dashboard) must not import those internals, so customer-orders registers this
 * small store at start-up and other features' mock services read and update orders through it —
 * the way two features will later share one API.
 *
 * Delete this file when the real endpoints exist; nothing outside mock code should use it.
 */

export type MockQuotationStatus = 'awaiting' | 'accepted' | 'declined' | 'expired'

/** What the mock backend knows about an order, for paying it. */
export interface MockOrderForPayment {
  orderId: string
  /** The customer order status, e.g. "accepted". */
  orderStatus: string
  /** "Nugegoda → Kurunegala" */
  route: string
  /** "Tue, 21 Oct, 08:00" */
  pickupLabel: string
  paymentStatus: 'awaiting-payment' | 'paid' | 'refunded' | null
  quotation: {
    status: MockQuotationStatus
    total: number
    /** ISO date-time */
    validUntil: string
    /** The price lines, for the invoice. */
    lines: { label: string; amount: number }[]
  } | null
}

export interface MockPaymentRecord {
  amount: number
  /** "20 Oct, 12:00" */
  paidOnLabel: string
  cardLast4: string
  reference: string
  /** "INV-2026-1049" — lets the order link to its invoice. */
  invoiceId: string
}

/** One of the customer's orders, as the dashboard summarises it. */
export interface MockCustomerOrder {
  orderId: string
  /** True for the orders on My orders (newest first); false for those that only open by URL. */
  inMyOrders: boolean
  /** "Today, 09:12" or "17 Oct", as on My orders. */
  placedLabel: string
  /** "Colombo 15 → Matara" */
  route: string
  /** "Tiles · 8 t", as on My orders. */
  cargo: string
  /** The customer order status, e.g. "quoted". */
  status: string
  quotation: { status: MockQuotationStatus; total: number; /** ISO date-time */ validUntil: string } | null
  trip: {
    tripId: string
    /** "scheduled" | "in-progress" | "completed" | "trip-cancelled" */
    status: string
    vehicle: string
    driver: string
    /** "Today, 08:00 – 13:00" */
    window: string
    /** "08:15", or null before the driver starts. */
    started: string | null
  } | null
  /** The Order details progress steps: id ("trip-scheduled", "in-progress", "completed"…) and caption ("15 Oct, 16:40" or "—"). */
  steps: { id: string; caption: string }[]
  payment: {
    status: 'awaiting-payment' | 'paid' | 'refunded'
    amount: number
    /** "15 Oct, 15:02"; null while awaiting payment. */
    paidOnLabel: string | null
    invoiceId: string | null
  } | null
}

export interface MockOrderStore {
  /** "Now" in the mock calendar, so expiry checks agree across features. */
  now(): Date
  /** Every order of the customer: the My orders rows first (newest first), then the URL-only ones. */
  listOrders(): MockCustomerOrder[]
  getOrderForPayment(orderId: string): MockOrderForPayment | null
  /** Marks the order paid everywhere the customer screens read it (My orders, Order details, Fare quotation). */
  markOrderPaid(orderId: string, payment: MockPaymentRecord): void
}

let store: MockOrderStore | null = null

export function registerMockOrderStore(implementation: MockOrderStore) {
  store = implementation
}

export function mockOrderStore(): MockOrderStore {
  if (!store) throw new Error('The mock order store is not registered (features/customer-orders registers it).')
  return store
}
