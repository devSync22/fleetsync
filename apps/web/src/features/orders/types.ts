/** Where an order is in the coordinator's workflow (the STATUS column). */
export type OrderStatus =
  | 'pending-review'
  | 'quoted'
  | 'accepted'
  | 'trip-created'
  | 'completed'
  | 'trip-cancelled'
  | 'quotation-expired'
  | 'declined'

/** The customer's side of the money (the PAYMENT column). */
export type PaymentStatus = 'not-due' | 'awaiting-payment' | 'paid' | 'payment-failed' | 'no-payment'

export interface QuotationInfo {
  amount: number
  /** "Opened 2 times", "Not opened yet". */
  openedLabel: string
  /** Set when the quotation expires within 2 hours. */
  expiresInMinutes: number | null
}

/** One row of the Submitted orders table. */
export interface SubmittedOrder {
  orderId: string
  submittedLabel: string
  customerName: string
  route: string
  /** "Pickup 21 Oct, 08:00", or for closed orders what happened ("Delivered 19 Oct, 11:40"). */
  routeNote: string
  /** "21 Oct" — used by the pickup date filter. */
  pickupDate: string
  cargo: string
  cargoAmount: string
  payment: PaymentStatus
  status: OrderStatus
  quotation: QuotationInfo | null
  tripId: string | null
}

/** Tabs of the Submitted orders page; also the `?status=` URL value. */
export type OrderTab = 'all-open' | 'needs-quotation' | 'quoted' | 'ready-for-trip' | 'closed'

export interface FareLine {
  id: string
  label: string
  detail: string
  amount: number
}

export type VehicleClass = 'light-5' | 'heavy-9' | 'heavy-14'

/** Everything the "Review order" page shows about one order. */
export interface OrderDetail {
  orderId: string
  status: OrderStatus
  payment: PaymentStatus
  customerName: string
  submittedLabel: string
  pickupLabel: string
  customer: { contact: string; email: string; customerSince: string }
  route: {
    pickupPlace: string
    pickupWhen: string
    destinationPlace: string
    destinationWhen: string
    distanceKm: number
  }
  cargo: {
    type: string
    weight: string
    /** "Pallets", "Bags", "Cartons", "Items". */
    unitsLabel: string
    units: string
    handling: string
    note: string | null
  }
  /** Starting point for the fare estimation form. */
  estimate: {
    vehicleClass: VehicleClass
    lines: FareLine[]
    /** `datetime-local` value, e.g. "2026-10-20T18:00". */
    validUntil: string
    message: string
  }
  quotation: QuotationInfo | null
  tripId: string | null
}

export interface QuotationInput {
  vehicleClass: VehicleClass
  lines: FareLine[]
  validUntil: string
  message: string
}

/** What the "Quotation sent" page shows. */
export interface SentQuotation {
  orderId: string
  customerName: string
  contactName: string
  contactInitials: string
  route: string
  vehicleLabel: string
  lines: FareLine[]
  total: number
  validUntilLabel: string
  sentBy: string
  sentAt: string
  message: string
  delivery: { email: 'delivered' | 'not-opened'; account: 'opened' | 'not-opened' }
}
