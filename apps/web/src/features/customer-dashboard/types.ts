/** Customer order statuses, as My orders shows them. */
export type DashboardOrderStatus =
  | 'pending-review'
  | 'quoted'
  | 'accepted'
  | 'trip-scheduled'
  | 'in-progress'
  | 'completed'
  | 'declined'
  | 'quotation-expired'
  | 'cancelled'

/** A KPI value and the caption under it. */
export interface DashboardKpi {
  value: number
  /** "Not yet completed", "ORD-1049 · LKR 31,410", "TRP-2202 started 08:15", "All paid". */
  caption: string
}

/** The quotation waiting for the customer's answer that expires soonest. */
export interface QuotationBannerData {
  orderId: string
  /** "Nugegoda → Kurunegala" */
  route: string
  /** LKR */
  amount: number
  /** "20 Oct, 18:00" */
  validUntilLabel: string
}

/** One row of the My orders card. */
export interface DashboardOrderRow {
  orderId: string
  /** "Today, 09:12" or "17 Oct". */
  dateLabel: string
  /** "Colombo 15 → Matara" */
  route: string
  /** "8 t · tiles" */
  cargoSummary: string
  status: DashboardOrderStatus
}

/** One step of the trip timeline. */
export interface ActiveTripStep {
  /** "Assigned", "Started by the driver", "Completed". */
  label: string
  /** "15 Oct, 16:40", "Today, 08:15" or "Not yet". */
  timeLabel: string
  done: boolean
}

/** The customer's trip on the road right now. */
export interface ActiveTrip {
  orderId: string
  tripId: string
  steps: ActiveTripStep[]
  /** "Colombo → Kurunegala" */
  route: string
  /** Plate, "WP LC-4410". */
  vehicle: string
  driver: string
  /** "08:00 – 13:00" (today) or "23 Oct, 08:00 – 13:00". */
  tripWindow: string
}

/** One row of the Recent payments card. */
export interface RecentPayment {
  orderId: string
  /** "Paid 15 Oct" */
  paidLabel: string
  /** LKR */
  amount: number
  /** "INV-2026-1040" */
  invoiceId: string
}

/** Everything "Customer — Dashboard" (150:5292) shows, from one call. */
export interface CustomerDashboard {
  /** "Dilini" */
  greetingName: string
  /** "Lanka Tiles PLC" */
  companyName: string
  kpis: {
    openOrders: DashboardKpi
    quotationsToReview: DashboardKpi
    tripsInProgress: DashboardKpi
    completedThisMonth: DashboardKpi
  }
  quotationBanner: QuotationBannerData | null
  /** The newest 4 orders. */
  latestOrders: DashboardOrderRow[]
  activeTrip: ActiveTrip | null
  /** The newest 2 paid payments. */
  recentPayments: RecentPayment[]
}
