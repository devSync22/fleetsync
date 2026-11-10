import type { DomainStatus } from '@/components/shared/statusTones'
import type { ResourceKind } from './types'

type ResourceConfig = {
  id: ResourceKind
  label: string
  /** Statuses offered as filter chips, in display order. */
  statuses: DomainStatus[]
  searchPlaceholder: string
}

export const resources: ResourceConfig[] = [
  {
    id: 'vehicles',
    label: 'Vehicles',
    statuses: ['available', 'on-trip', 'assigned', 'in-maintenance'],
    searchPlaceholder: 'Search plate or vehicle type…',
  },
  {
    id: 'drivers',
    label: 'Drivers',
    statuses: ['available', 'on-trip', 'assigned', 'off-duty'],
    searchPlaceholder: 'Search driver or licence…',
  },
  {
    id: 'mechanics',
    label: 'Mechanics',
    statuses: ['available', 'off-duty'],
    searchPlaceholder: 'Search mechanic or speciality…',
  },
]

/** `?status=` value; the page opens on "available" because that is what the coordinator checks for. */
export type StatusFilter = 'all' | DomainStatus

export const DEFAULT_STATUS_FILTER: StatusFilter = 'available'

export function parseResource(value: string | null): ResourceConfig {
  return resources.find((resource) => resource.id === value) ?? resources[0]
}

export function parseStatusFilter(value: string | null, resource: ResourceConfig): StatusFilter {
  if (value === 'all') return 'all'
  return resource.statuses.find((status) => status === value) ?? DEFAULT_STATUS_FILTER
}

export function withStatus<T extends { status: string }>(rows: T[], status: StatusFilter) {
  return status === 'all' ? rows : rows.filter((row) => row.status === status)
}

/** True when any field contains the query, ignoring case (an empty query matches everything). */
export function matchesQuery(fields: string[], query: string) {
  const needle = query.trim().toLowerCase()
  return !needle || fields.some((field) => field.toLowerCase().includes(needle))
}
