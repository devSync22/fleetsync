/**
 * Where a customer's order is, as the customer sees it (the STATUS column of My orders).
 * Names match features/orders where they mean the same thing.
 */
export type CustomerOrderStatus =
  | 'pending-review'
  | 'quoted'
  | 'accepted'
  | 'trip-scheduled'
  | 'in-progress'
  | 'completed'
  | 'declined'
  | 'quotation-expired'
  | 'cancelled'

/** One row of the My orders table. */
export interface CustomerOrderRow {
  orderId: string
  /** "Today, 09:12" or "17 Oct". */
  placedLabel: string
  /** "Colombo 15 → Matara". */
  route: string
  /** "Tiles · 8 t". */
  cargo: string
  /** "23 Oct, 08:00", "Today, 08:00", or "—" when no pickup is set. */
  pickupLabel: string
  /** Quoted amount in LKR; null until the order has been quoted. */
  amount: number | null
  status: CustomerOrderStatus
}

/**
 * Tabs of the My orders page; also the `?tab=` URL value.
 * "in-progress" covers accepted, trip-scheduled and in-progress orders.
 */
export type MyOrdersTab = 'all' | 'pending-review' | 'quoted' | 'in-progress' | 'completed' | 'declined'

/** The "placed in" filter; also the `?period=` URL value. */
export type MyOrdersPeriod = 'last-30-days' | 'last-3-months' | 'last-12-months' | 'all-time'

export interface MyOrdersQuery {
  tab: MyOrdersTab
  /** Order number or city. */
  search: string
  period: MyOrdersPeriod
  /** 1-based. */
  page: number
}

export interface MyOrdersResult {
  /** The rows on the requested page. */
  items: CustomerOrderRow[]
  /** Orders in the active tab that match the search and period. */
  total: number
  /** The page actually returned (clamped to 1…pageCount). */
  page: number
  pageCount: number
  /** Orders per tab that match the search and period. */
  tabCounts: Record<MyOrdersTab, number>
}

/* ───────────── Order details (/customer/orders/:orderId) ───────────── */

/**
 * One step of the order progress stepper. `stopped` marks the step where an order ended without
 * completing (quote declined, quotation expired, order cancelled).
 */
export type OrderProgressState = 'done' | 'current' | 'upcoming' | 'stopped'

export type OrderProgressStepId = 'submitted' | 'quoted' | 'paid' | 'trip-scheduled' | 'in-progress' | 'completed'

export interface OrderProgressStep {
  id: OrderProgressStepId
  /** "Submitted", "Quoted", "Paid", "Trip scheduled", "In progress", "Completed". */
  label: string
  state: OrderProgressState
  /** "15 Oct, 10:05", "LKR 27,900", "Quote declined" or "—" for upcoming steps. */
  caption: string
}

/** The trip that carries the order, as the customer sees it. */
export interface CustomerOrderTrip {
  tripId: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'trip-cancelled'
  /** Plate, e.g. "WP LC-4410". */
  vehicle: string
  driver: string
  /** "Today, 08:00 – 13:00". */
  window: string
  /** "08:15", or null before the driver starts the trip. */
  started: string | null
}

/** Colour of the dot next to an update; follows the Status Badge tones. */
export type OrderUpdateTone = 'neutral' | 'pending' | 'accent' | 'info' | 'success' | 'danger'

/** One entry of the Updates timeline, newest first. */
export interface OrderUpdate {
  title: string
  detail: string
  /** "Today, 08:15" or "15 Oct, 16:40". */
  when: string
  tone: OrderUpdateTone
}

export interface OrderStop {
  address: string
  /** "Today, 08:00" or "Before 13:00". */
  when: string
  /** Contact person at the stop; left out where the screen shows only the time (Fare quotation). */
  contact?: string
}

export interface OrderCargo {
  /** "Ceramic tiles". */
  type: string
  weightKg: number
  /** What the units are: "Pallets", "Boxes"… */
  unitsLabel: string
  unitsCount: number
  /** "Fragile, keep upright". */
  handling: string
}

/** Payment for the quotation; null until the customer accepts a quote. */
export interface OrderPayment {
  quotationAmount: number
  /** "15 Oct, 15:02"; null while awaiting payment. */
  paidOn: string | null
  /** "Online · Visa ending 4421"; null while awaiting payment. */
  method: string | null
  /** "PAY-58213"; null while awaiting payment. */
  reference: string | null
  status: 'awaiting-payment' | 'paid' | 'refunded'
}

/** Everything "Customer — Order details" (158:5805) shows for one order. */
export interface CustomerOrderDetail {
  orderId: string
  status: CustomerOrderStatus
  /** "15 Oct, 10:05". */
  placedLabel: string
  /** "Colombo → Kurunegala". */
  route: string
  /** "9 t ceramic tiles". */
  cargoSummary: string
  /** Quoted amount in LKR; null until the order has been quoted. Same as the My orders row. */
  amount: number | null
  progress: OrderProgressStep[]
  trip: CustomerOrderTrip | null
  updates: OrderUpdate[]
  pickup: OrderStop
  destination: OrderStop
  cargo: OrderCargo
  payment: OrderPayment | null
}

/* ───────────── New transport order (/customer/new-order) ───────────── */

export type PackingType = 'pallets' | 'cartons' | 'bags' | 'loose-items'

/** "Handling and transport needs" ticks. */
export type HandlingFlag = 'fragile' | 'keep-upright' | 'covered-truck' | 'forklift-pickup' | 'forklift-destination' | 'loading-help'

/** Form values are kept as typed (strings) so going Back never loses or reformats input. */
export interface NewOrderPickup {
  address: string
  city: string
  /** YYYY-MM-DD */
  date: string
  /** HH:MM */
  time: string
  contactName: string
  contactPhone: string
}

export interface NewOrderDestination {
  address: string
  city: string
  /** YYYY-MM-DD; optional. When only a time is set, it means the pickup day. */
  deliverByDate: string
  /** HH:MM; optional. */
  deliverByTime: string
  receiverName: string
  receiverPhone: string
}

export interface NewOrderCargo {
  cargoType: string
  packing: PackingType | ''
  /** Total weight in kg, as typed ("8000" or "8,000"). */
  weightKg: string
  /** Number of pallets / cartons / bags / items, as typed. */
  quantity: string
  /** Pallet size, carton size, weight per bag or largest item — free text. */
  unitSize: string
  description: string
  handling: HandlingFlag[]
  noteForCoordinator: string
}

export interface NewOrderDraft {
  pickup: NewOrderPickup
  destination: NewOrderDestination
  cargo: NewOrderCargo
}

/** Every field the wizard can show an error for, e.g. "pickup.date". */
export type NewOrderField =
  | `pickup.${keyof NewOrderPickup}`
  | `destination.${keyof NewOrderDestination}`
  | `cargo.${Exclude<keyof NewOrderCargo, 'handling'>}`

/** Field → message shown under that field. */
export type NewOrderErrors = Partial<Record<NewOrderField, string>>

/** 1 Route · 2 Cargo · 3 Review. */
export type NewOrderStep = 1 | 2 | 3

export interface CreatedOrder {
  orderId: string
}

/* ───────────── Fare quotation (/customer/quotations/:orderId) ───────────── */

/** "expired" is also what the page shows for an "awaiting" quotation whose validUntil has passed. */
export type QuotationStatus = 'awaiting' | 'accepted' | 'declined' | 'expired'

export interface QuotationLine {
  /** "Distance charge" */
  label: string
  /** "96 km × LKR 210" */
  detail: string
  /** LKR */
  amount: number
}

/** A coordinator's fare quotation for one order, as the customer sees it. */
export interface CustomerQuotation {
  orderId: string
  status: QuotationStatus
  sentBy: string
  /** "Operational Coordinator" */
  sentByRole: string
  /** ISO date-time the coordinator sent it (for sorting). */
  sentAt: string
  /** "today at 11:20" */
  sentAtLabel: string
  /** ISO date-time the quotation stops being valid. */
  validUntil: string
  /** "Mon, 20 Oct 2026 at 18:00" */
  validUntilLabel: string
  /** "Heavy truck · up to 9 t" */
  vehicleLabel: string
  lines: QuotationLine[]
  /** LKR; the sum of `lines`. */
  total: number
  coordinatorMessage: string
  /** "Nimal Perera · today, 11:20" */
  messageMeta: string
  /** What was quoted for (the Your order card). */
  order: {
    pickup: OrderStop
    destination: OrderStop
    cargo: OrderCargo
  }
  /** When the customer accepted or declined, e.g. "Today, 12:05". */
  decidedAtLabel?: string
  /** The customer's reason, when they declined and gave one. */
  declineReason?: string
  /** True while an accepted quotation still has to be paid (shows "Go to payment"). */
  paymentDue: boolean
}

/* ───────────── Quotations list (/customer/quotations) ───────────── */

/** Tabs of the Quotations page; also the `?tab=` URL value. */
export type QuotationListTab = 'awaiting' | 'accepted' | 'declined' | 'expired' | 'all'

/** One row of the Quotations table. */
export interface QuotationListRow {
  orderId: string
  /** "Nugegoda → Kurunegala" */
  route: string
  /** "today at 11:20", shown as "Sent today at 11:20". */
  sentAtLabel: string
  /** "20 Oct, 18:00" */
  validUntilLabel: string
  /** LKR */
  amount: number
  /** As shown: an "awaiting" quotation past its validUntil is "expired". */
  status: QuotationStatus
  /** The order has been paid (accepted quotations show "Paid"). */
  paid: boolean
}

export interface QuotationListQuery {
  tab: QuotationListTab
  /** 1-based. */
  page: number
}

export interface QuotationListResult {
  /** The rows on the requested page. */
  items: QuotationListRow[]
  /** Quotations in the active tab. */
  total: number
  /** The page actually returned (clamped to 1…pageCount). */
  page: number
  pageCount: number
  tabCounts: Record<QuotationListTab, number>
  /** The awaiting quotation that expires first, for the banner; null when none are awaiting. */
  soonestAwaiting: { orderId: string; validUntilLabel: string } | null
}
