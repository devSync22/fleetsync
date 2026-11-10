import { SearchX } from 'lucide-react'
import { Link, Navigate, useMatch, useNavigate, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { InfoNote } from '@/components/shared/InfoNote'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AssignmentCard } from '../components/AssignmentCard'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { CancelTripDialog } from '../components/CancelTripDialog'
import { LifecycleStepper } from '../components/LifecycleStepper'
import { OdometerCard } from '../components/OdometerCard'
import { OrderCustomerCard } from '../components/OrderCustomerCard'
import { RouteCargoCard } from '../components/RouteCargoCard'
import { TripActivityCard } from '../components/TripActivityCard'
import { TripNotesCard } from '../components/TripNotesCard'
import { useTripDetail } from '../hooks/useTripDetail'
import { canCancel } from '../services/tripsApi'
import type { TripDetail } from '../types'

function cancelNote(trip: TripDetail) {
  if (trip.status !== 'in-progress') return null
  return trip.pickedUpAt
    ? `Cargo picked up at ${trip.pickedUpAt}, so this trip can’t be cancelled. Use Change under Assignment if someone can’t continue.`
    : 'The driver has not picked up the cargo yet, so you can still cancel this trip.'
}

/** Trip details (137:4699 / 401:12975). On `/trips/:tripId/cancel` the Cancel trip dialog (138:4801) is open. */
export function TripDetailsPage() {
  const { tripId = '' } = useParams()
  const navigate = useNavigate()
  const cancelling = useMatch('/coordinator/trips/:tripId/cancel') !== null
  const { state, retry } = useTripDetail(tripId)
  const detailsPath = `/coordinator/trips/${tripId}`

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Loading trip" className="flex flex-col gap-6">
        <Skeleton className="h-3 w-40 rounded-full" />
        <Skeleton className="h-8 w-72 rounded-full" />
        <Skeleton className="h-[86px] w-full rounded-xl" />
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (state.status === 'error') {
    if (state.error.status === 404) {
      return (
        <EmptyState
          className="mx-auto mt-10 w-[360px]"
          icon={SearchX}
          tone="accent"
          title="Trip not found"
          description={state.error.message}
          action={
            <Button asChild variant="outline">
              <Link to="/coordinator/trips">Back to trips</Link>
            </Button>
          }
        />
      )
    }
    return (
      <Banner
        tone="danger"
        title="Couldn’t load the trip"
        message={state.error.message}
        action={
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        }
      />
    )
  }

  const trip = state.data
  const cancellable = canCancel(trip)
  if (cancelling && !cancellable) return <Navigate to={detailsPath} replace />
  const note = cancelNote(trip)
  const running = trip.status === 'assigned' || trip.status === 'in-progress'

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: 'Trips', to: '/coordinator/trips' }, { label: trip.tripId, mono: true }]} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[28px] leading-9 font-bold tracking-[-0.01em]">Trip {trip.tripId}</h1>
            <StatusBadge status={trip.status} />
          </div>
          <p className="text-[13px] text-muted-foreground">
            {trip.customerName} · {trip.route} · order {trip.orderId}
          </p>
          {note && <InfoNote>{note}</InfoNote>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="outline">
            <Link to={`/coordinator/chat?trip=${trip.tripId}`}>Open chat</Link>
          </Button>
          {trip.status === 'in-progress' && (
            // TODO: call the complete-trip endpoint once it exists
            <Button type="button" variant="outline">
              Mark completed
            </Button>
          )}
          {running &&
            (cancellable ? (
              <Button asChild variant="destructive">
                <Link to={`${detailsPath}/cancel`}>Cancel trip</Link>
              </Button>
            ) : (
              <Button type="button" variant="secondary" disabled className="disabled:bg-secondary disabled:text-faint disabled:opacity-100">
                Cancel trip
              </Button>
            ))}
        </div>
      </div>

      <LifecycleStepper steps={trip.lifecycle} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <RouteCargoCard trip={trip} />
          <AssignmentCard trip={trip} />
          <TripActivityCard activity={trip.activity} />
        </div>
        <div className="flex flex-col gap-5">
          <OrderCustomerCard trip={trip} />
          <OdometerCard trip={trip} />
          <TripNotesCard note={trip.note} />
        </div>
      </div>

      {cancellable && (
        <CancelTripDialog
          trip={trip}
          open={cancelling}
          onClose={() => navigate(detailsPath, { replace: true })}
          onCancelled={() => navigate(`${detailsPath}/cancelled`, { replace: true })}
        />
      )}
    </div>
  )
}
