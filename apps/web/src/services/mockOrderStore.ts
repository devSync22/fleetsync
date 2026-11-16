/*
 * Mock-only bridge between features while there is no backend.
 *
 * The in-memory order, quotation and payment data belongs to features/customer-orders (its mocks).
 * Other features (payments) must not import those internals, so customer-orders registers this
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
  } | null
}

export interface MockPaymentRecord {
  amount: number
  /** "20 Oct, 12:00" */
  paidOnLabel: string
  cardLast4: string
  reference: string
}

export interface MockOrderStore {
  /** "Now" in the mock calendar, so expiry checks agree across features. */
  now(): Date
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
