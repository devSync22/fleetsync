/** A quotation the customer has not answered, close to expiry. */
export interface ExpiringQuotation {
  orderId: string
  sentLabel: string
  customerName: string
  route: string
  amount: number
  timesOpened: number
  expiresInMinutes: number
}

export type WaitingOrderStatus = 'pending-review' | 'quoted' | 'paid'

export interface WaitingOrder {
  orderId: string
  receivedLabel: string
  customerName: string
  route: string
  status: WaitingOrderStatus
}

export interface ActiveTrip {
  tripId: string
  route: string
  startedAt: string
  driverName: string
}

export interface ResourceAvailability {
  free: number
  total: number
  breakdown: { label: string; count: number }[]
}

export type PaymentStatus = 'paid' | 'awaiting-payment' | 'payment-failed'

export interface PaymentSummary {
  status: PaymentStatus
  orderCount: number
  amount: number
}

export interface CoordinatorDashboard {
  coordinatorFirstName: string
  ordersToQuote: number
  oldestOrderWaitingHours: number
  tripsInProgress: number
  tripsNotStartedOnTime: number
  vehicles: ResourceAvailability & { inMaintenance: number }
  drivers: ResourceAvailability
  expiringQuotations: ExpiringQuotation[]
  waitingOrders: WaitingOrder[]
  activeTrips: ActiveTrip[]
  payments: PaymentSummary[]
  report: { lastGeneratedLabel: string; periodLabel: string } | null
}
