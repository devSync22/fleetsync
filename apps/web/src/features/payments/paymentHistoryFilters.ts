import type { PaymentPeriod, PaymentStatusFilter } from './types'

export const statusFilters: { id: PaymentStatusFilter; label: string }[] = [
  { id: 'all', label: 'All statuses' },
  { id: 'paid', label: 'Paid' },
  { id: 'failed', label: 'Failed' },
  { id: 'refunded', label: 'Refunded' },
]

export const periodFilters: { id: PaymentPeriod; label: string }[] = [
  { id: 'last-3-months', label: 'Last 3 months' },
  { id: 'last-6-months', label: 'Last 6 months' },
  { id: 'this-year', label: 'This year' },
]

export const DEFAULT_STATUS: PaymentStatusFilter = 'all'
export const DEFAULT_PERIOD: PaymentPeriod = 'last-3-months'

export const parseStatusFilter = (value: string | null): PaymentStatusFilter =>
  statusFilters.find((s) => s.id === value)?.id ?? DEFAULT_STATUS

export const parsePeriod = (value: string | null): PaymentPeriod => periodFilters.find((p) => p.id === value)?.id ?? DEFAULT_PERIOD
