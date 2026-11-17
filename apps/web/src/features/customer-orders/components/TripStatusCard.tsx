import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { CustomerOrderStatus, CustomerOrderTrip, OrderUpdate } from '../types'
import { OrderUpdatesTimeline } from './OrderUpdatesTimeline'

/** What the card says while the order has no trip yet, or why it never got one. */
const noTripSubtitle: Partial<Record<CustomerOrderStatus, string>> = {
  'pending-review': 'A coordinator is reviewing your order and will send a fare quotation.',
  quoted: 'Review the quotation to continue with this order.',
  accepted: 'Once you pay, a coordinator schedules the trip.',
  declined: 'You declined the quotation, so no trip was scheduled.',
  'quotation-expired': 'The quotation expired, so no trip was scheduled.',
  cancelled: 'This order was cancelled.',
}

function tripSubtitle(trip: CustomerOrderTrip) {
  switch (trip.status) {
    case 'scheduled':
      return `${trip.tripId} · the driver updates it from the Driver app once the trip starts`
    case 'trip-cancelled':
      return `${trip.tripId} · cancelled by the coordinator`
    default:
      return `${trip.tripId} · updated by the driver from the Driver app`
  }
}

function Tile({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-[10px] bg-background px-3.5 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('truncate text-sm font-medium', mono && 'font-mono')}>{value}</dd>
    </div>
  )
}

type TripStatusCardProps = {
  trip: CustomerOrderTrip | null
  updates: OrderUpdate[]
  orderStatus: CustomerOrderStatus
}

/**
 * "Trip status": the trip's vehicle, driver, window and start time, then the order's updates.
 * Before a trip exists the card is titled "Updates" and shows only the timeline.
 */
export function TripStatusCard({ trip, updates, orderStatus }: TripStatusCardProps) {
  return (
    <SectionCard
      title={trip ? 'Trip status' : 'Updates'}
      subtitle={trip ? tripSubtitle(trip) : noTripSubtitle[orderStatus]}
      action={trip && <StatusBadge status={trip.status} />}
    >
      <div className="flex flex-col gap-4 px-5 py-[18px]">
        {trip && (
          <>
            <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Tile label="Vehicle" value={trip.vehicle} mono />
              <Tile label="Driver" value={trip.driver} />
              <Tile label="Trip window" value={trip.window} />
              <Tile label="Started" value={trip.started ?? '—'} mono={trip.started !== null} />
            </dl>
            <h3 className="text-[13px] font-semibold">Updates</h3>
          </>
        )}
        <OrderUpdatesTimeline updates={updates} />
      </div>
    </SectionCard>
  )
}
