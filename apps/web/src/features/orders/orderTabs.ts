import { Archive, Clock, FilePen, Package, Truck, type LucideIcon } from 'lucide-react'
import type { OrderStatus, OrderTab, SubmittedOrder } from './types'

const closedStatuses: OrderStatus[] = ['completed', 'trip-cancelled', 'quotation-expired', 'declined']

type OrderTabConfig = {
  id: OrderTab
  label: string
  matches: (order: SubmittedOrder) => boolean
  /** Shown after "Showing x of y" in the table toolbar. */
  hint: string | null
  empty: { icon: LucideIcon; title: string; description: string }
}

export const orderTabs: OrderTabConfig[] = [
  {
    id: 'all-open',
    label: 'All open',
    matches: (o) => !closedStatuses.includes(o.status),
    hint: null,
    empty: { icon: Package, title: 'No open orders', description: 'Orders customers submit will appear here.' },
  },
  {
    id: 'needs-quotation',
    label: 'Needs quotation',
    matches: (o) => o.status === 'pending-review',
    hint: 'waiting for a quotation',
    empty: { icon: FilePen, title: 'No orders need a quotation', description: 'New orders will appear here for you to review and quote.' },
  },
  {
    id: 'quoted',
    label: 'Quoted',
    matches: (o) => o.status === 'quoted',
    hint: 'waiting for the customer',
    empty: { icon: Clock, title: 'No quotations waiting', description: 'Quoted orders stay here until the customer accepts or declines.' },
  },
  {
    id: 'ready-for-trip',
    label: 'Ready for a trip',
    matches: (o) => o.status === 'accepted' && o.payment === 'paid',
    hint: 'accepted and paid',
    empty: { icon: Truck, title: 'No orders ready for a trip', description: 'Orders appear here once the customer has accepted and paid.' },
  },
  {
    id: 'closed',
    label: 'Closed',
    matches: (o) => closedStatuses.includes(o.status),
    hint: null,
    empty: { icon: Archive, title: 'No closed orders', description: 'Delivered, declined and expired orders move here.' },
  },
]

export function parseOrderTab(value: string | null): OrderTabConfig {
  return orderTabs.find((tab) => tab.id === value) ?? orderTabs[0]
}

/** Matches order ID, customer or either place on the route, ignoring case. */
export function matchesSearch(order: SubmittedOrder, query: string) {
  const needle = query.trim().toLowerCase()
  return !needle || [order.orderId, order.customerName, order.route].some((f) => f.toLowerCase().includes(needle))
}
