/** Where a customer order is in the coordinator's workflow. */
export type OrderStatus =
  | 'pending-review'
  | 'quoted'
  | 'awaiting-payment'
  | 'payment-failed'
  | 'paid'
  | 'assigned'
  | 'completed'
  | 'cancelled'

export type CargoType = 'Cartons' | 'Bags' | 'Loose items'

export interface SubmittedOrder {
  orderId: string
  submittedLabel: string
  customerName: string
  route: string
  cargoType: CargoType
  cargoWeightKg: number
  pickupLabel: string
  /** Fare quotation sent to the customer; null until the order is quoted. */
  quotedAmount: number | null
  status: OrderStatus
}

/** Tabs of the Submitted orders page; also the `?status=` URL value. */
export type OrderTab = 'all' | 'needs-quotation' | 'quoted' | 'ready-for-trip' | 'closed'
