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
