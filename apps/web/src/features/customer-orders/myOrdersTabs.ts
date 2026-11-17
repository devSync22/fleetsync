import { Ban, CircleCheck, Clock, FileText, Package, Truck, type LucideIcon } from 'lucide-react'
import type { DomainStatus } from '@/components/shared/statusTones'
import type { CustomerOrderStatus, MyOrdersPeriod, MyOrdersTab } from './types'

type MyOrdersTabConfig = {
  id: MyOrdersTab
  label: string
  /** The order statuses this tab lists. */
  statuses: CustomerOrderStatus[] | 'any'
  empty: { icon: LucideIcon; title: string; description: string }
}

export const myOrdersTabs: MyOrdersTabConfig[] = [
  {
    id: 'all',
    label: 'All',
    statuses: 'any',
    empty: { icon: Package, title: 'No orders yet', description: 'Transport orders you place will appear here with their status.' },
  },
  {
    id: 'pending-review',
    label: 'Pending review',
    statuses: ['pending-review'],
    empty: { icon: Clock, title: 'No orders pending review', description: 'New orders wait here until a coordinator sends you a quotation.' },
  },
  {
    id: 'quoted',
    label: 'Quoted',
    statuses: ['quoted'],
    empty: { icon: FileText, title: 'No quotations to review', description: 'Orders move here when a coordinator sends you a quotation.' },
  },
  {
    id: 'in-progress',
    label: 'In progress',
    statuses: ['accepted', 'trip-scheduled', 'in-progress'],
    empty: { icon: Truck, title: 'No orders in progress', description: 'Accepted orders stay here until they are delivered.' },
  },
  {
    id: 'completed',
    label: 'Completed',
    statuses: ['completed'],
    empty: { icon: CircleCheck, title: 'No completed orders', description: 'Delivered orders appear here.' },
  },
  {
    id: 'declined',
    label: 'Declined',
    statuses: ['declined'],
    empty: { icon: Ban, title: 'No declined orders', description: 'Quotations you decline appear here.' },
  },
]

export function parseMyOrdersTab(value: string | null): MyOrdersTab {
  return myOrdersTabs.find((tab) => tab.id === value)?.id ?? 'all'
}

export const myOrdersPeriods: { id: MyOrdersPeriod; label: string }[] = [
  { id: 'last-30-days', label: 'Last 30 days' },
  { id: 'last-3-months', label: 'Last 3 months' },
  { id: 'last-12-months', label: 'Last 12 months' },
  { id: 'all-time', label: 'All time' },
]

export const DEFAULT_PERIOD: MyOrdersPeriod = 'last-3-months'

export function parseMyOrdersPeriod(value: string | null): MyOrdersPeriod {
  return myOrdersPeriods.find((p) => p.id === value)?.id ?? DEFAULT_PERIOD
}

/**
 * The badge each customer status shows. Labels and tones live in the shared statusMeta;
 * the customer wording ("Trip in progress", "Quote declined") has its own entries there.
 */
export const customerStatusBadge: Record<CustomerOrderStatus, DomainStatus> = {
  'pending-review': 'pending-review',
  quoted: 'quoted',
  accepted: 'accepted',
  'trip-scheduled': 'trip-scheduled',
  'in-progress': 'trip-in-progress',
  completed: 'completed',
  declined: 'quote-declined',
  'quotation-expired': 'quotation-expired',
  cancelled: 'cancelled',
}
