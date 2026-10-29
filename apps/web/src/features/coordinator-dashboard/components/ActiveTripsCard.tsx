import { Truck } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import type { ActiveTrip } from '../types'
import { DashboardCard } from './DashboardCard'

type ActiveTripsCardProps = {
  trips: ActiveTrip[]
  inProgressCount: number
}

export function ActiveTripsCard({ trips, inProgressCount }: ActiveTripsCardProps) {
  return (
    <DashboardCard
      title="Active trips"
      subtitle={`${inProgressCount} in progress`}
      link={{ label: 'View trips', to: '/coordinator/trips' }}
    >
      {trips.length === 0 ? (
        <EmptyState
          bare
          icon={Truck}
          title="No active trips"
          description="Trips you create will appear here once a vehicle and driver are assigned."
          action={
            <Button asChild>
              <Link to="/coordinator/trips/new">Create trip</Link>
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3.5 px-5 py-4 text-xs">
          {trips.map((trip) => (
            <li key={trip.tripId} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="shrink-0 font-mono font-medium">{trip.tripId}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{trip.route}</span>
              </div>
              <p className="text-muted-foreground">
                Started {trip.startedAt} · {trip.driverName}
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  )
}
