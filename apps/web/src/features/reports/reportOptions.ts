import type { ReportType } from './types'

export const reportTypes: { id: ReportType; label: string; description: string }[] = [
  { id: 'trip-summary', label: 'Trip summary', description: 'Trips by status, distance and revenue' },
  { id: 'vehicle-utilisation', label: 'Vehicle utilisation', description: 'Days on trips, idle and in service' },
  { id: 'driver-activity', label: 'Driver activity', description: 'Trips and distance per driver' },
  { id: 'orders-payments', label: 'Orders and payments', description: 'Orders, quotations and payment status' },
]

export const periods = [
  { id: '2026-10-01_18', label: '1 – 18 Oct 2026' },
  { id: '2026-09', label: 'Sep 2026' },
  { id: '2026-q3', label: 'Q3 2026' },
]

export const bases = [
  { id: 'all', label: 'All bases' },
  { id: 'colombo', label: 'Colombo depot' },
  { id: 'kurunegala', label: 'Kurunegala yard' },
  { id: 'kandy', label: 'Kandy depot' },
  { id: 'galle', label: 'Galle depot' },
]

export const customers = [
  { id: 'all', label: 'All customers' },
  { id: 'ceylon-agro', label: 'Ceylon Agro Ltd' },
  { id: 'hayleys', label: 'Hayleys Freight' },
  { id: 'kandy-builders', label: 'Kandy Builders' },
  { id: 'lanka-tiles', label: 'Lanka Tiles PLC' },
  { id: 'southern-fisheries', label: 'Southern Fisheries' },
]

export const labelOf = (list: { id: string; label: string }[], id: string) => list.find((o) => o.id === id)?.label ?? id
export const reportTypeLabel = (id: ReportType) => reportTypes.find((t) => t.id === id)?.label ?? id
