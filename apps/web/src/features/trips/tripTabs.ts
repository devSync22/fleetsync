import { Activity, CircleCheck, CircleX, FilePen, Truck, type LucideIcon } from 'lucide-react'
import type { TripListItem, TripStatus } from './types'

type TripTabConfig = {
  id: TripStatus
  label: string
  empty: { icon: LucideIcon; title: string; description: string }
}

/** Tabs of the "All trips" card; the tab is also the `?status=` URL value. */
export const tripTabs: TripTabConfig[] = [
  {
    id: 'in-progress',
    label: 'In progress',
    empty: { icon: Activity, title: 'No trips in progress', description: 'Trips appear here once the driver starts them.' },
  },
  {
    id: 'assigned',
    label: 'Assigned',
    empty: { icon: Truck, title: 'No assigned trips', description: 'Trips waiting for the driver to start will appear here.' },
  },
  {
    id: 'draft',
    label: 'Draft',
    empty: { icon: FilePen, title: 'No draft trips', description: 'Trips you start but don’t assign yet are kept here.' },
  },
  {
    id: 'completed',
    label: 'Completed',
    empty: { icon: CircleCheck, title: 'No completed trips', description: 'Trips appear here once the driver completes them.' },
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    empty: { icon: CircleX, title: 'No cancelled trips', description: 'Cancelled trips and their refunds will appear here.' },
  },
]

export function parseTripTab(value: string | null): TripTabConfig {
  return tripTabs.find((tab) => tab.id === value) ?? tripTabs[0]
}

export type TripSort = 'scheduled' | 'trip'

export const tripSortOptions: { id: TripSort; label: string }[] = [
  { id: 'scheduled', label: 'Sort: start time' },
  { id: 'trip', label: 'Sort: trip ID' },
]

export function sortTrips(trips: TripListItem[], sort: TripSort) {
  const key = (trip: TripListItem) => (sort === 'trip' ? trip.tripId : trip.scheduledAt)
  return [...trips].sort((a, b) => key(a).localeCompare(key(b)))
}
