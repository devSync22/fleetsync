import { Archive, Clock, Package, Truck, type LucideIcon } from 'lucide-react'
import type { OrderStatus, OrderTab, SubmittedOrder } from './types'

type OrderTabConfig = {
  id: OrderTab
  label: string
  /** Statuses shown in this tab; null shows every order. */
  statuses: OrderStatus[] | null
  empty: { icon: LucideIcon; title: string; description: string }
}

export const orderTabs: OrderTabConfig[] = [
  {
    id: 'all',
    label: 'All',
    statuses: null,
    empty: {
      icon: Package,
      title: 'No submitted orders',
      description: 'Orders customers submit will appear here for you to review.',
    },
  },
  {
    id: 'needs-quotation',
    label: 'Needs quotation',
    statuses: ['pending-review'],
    empty: {
      icon: Package,
      title: 'No orders need a quotation',
      description: 'New orders will appear here for you to review and quote.',
    },
  },
  {
    id: 'quoted',
    label: 'Quoted',
    statuses: ['quoted', 'awaiting-payment', 'payment-failed'],
    empty: {
      icon: Clock,
      title: 'No quotations waiting',
      description: 'Quoted orders stay here until the customer pays or the quotation expires.',
    },
  },
  {
    id: 'ready-for-trip',
    label: 'Ready for a trip',
    statuses: ['paid'],
    empty: {
      icon: Truck,
      title: 'No paid orders waiting',
      description: 'Orders appear here once the customer has paid, ready for you to create a trip.',
    },
  },
  {
    id: 'closed',
    label: 'Closed',
    statuses: ['assigned', 'completed', 'cancelled'],
    empty: {
      icon: Archive,
      title: 'No closed orders yet',
      description: 'Orders move here once a trip is created or the order is cancelled.',
    },
  },
]

export function parseOrderTab(value: string | null): OrderTabConfig {
  return orderTabs.find((tab) => tab.id === value) ?? orderTabs[0]
}

export function ordersInTab(orders: SubmittedOrder[], tab: OrderTabConfig) {
  const { statuses } = tab
  return statuses ? orders.filter((order) => statuses.includes(order.status)) : orders
}

/** Matches order ID, customer or route, ignoring case. */
export function searchOrders(orders: SubmittedOrder[], query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return orders
  return orders.filter((order) =>
    [order.orderId, order.customerName, order.route].some((field) => field.toLowerCase().includes(needle)),
  )
}
