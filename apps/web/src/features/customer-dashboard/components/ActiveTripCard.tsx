import { Link } from 'react-router'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { ActiveTrip } from '../types'
import { TripSteps } from './TripSteps'

/** "Trip in progress": shown only while one of the customer's trips is on the road. */
export function ActiveTripCard({ trip }: { trip: ActiveTrip }) {
  return (
    <SectionCard
      title="Trip in progress"
      subtitle={`${trip.orderId} · ${trip.tripId}`}
      action={<StatusBadge status="in-progress" />}
    >
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <TripSteps steps={trip.steps} />
        <div className="h-px bg-border" />
        <dl className="flex flex-col gap-3.5">
          <KeyValueRow label="Route">{trip.route}</KeyValueRow>
          <KeyValueRow label="Vehicle" mono>
            {trip.vehicle}
          </KeyValueRow>
          <KeyValueRow label="Driver">{trip.driver}</KeyValueRow>
          <KeyValueRow label="Trip window">{trip.tripWindow}</KeyValueRow>
        </dl>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/customer/orders/${trip.orderId}`}>View order</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/customer/chat?order=${encodeURIComponent(trip.orderId)}`}>Open chat</Link>
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
