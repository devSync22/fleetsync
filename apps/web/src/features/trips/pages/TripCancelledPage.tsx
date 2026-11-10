import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLKR } from '@/lib/utils'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { DriverNotificationPreview } from '../components/DriverNotificationPreview'
import { KeyValueRow } from '../components/KeyValueRow'
import { NotificationsTable } from '../components/NotificationsTable'
import { ResultHeader } from '../components/ResultHeader'
import { useTripCancellation } from '../hooks/useTripCancellation'

/** "Trip cancelled" (405:8350): who was notified and what was freed. */
export function TripCancelledPage() {
  const { tripId = '' } = useParams()
  const { state, retry } = useTripCancellation(tripId)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: 'Trips', to: '/coordinator/trips' }, { label: tripId, mono: true }]} />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading cancellation" className="flex flex-col gap-6">
          <Skeleton className="h-[126px] w-full rounded-xl" />
          <TableSkeleton rows={3} />
        </div>
      )}

      {state.status === 'error' &&
        (state.error.status === 404 ? (
          <EmptyState
            className="mx-auto mt-6 w-[360px]"
            icon={SearchX}
            tone="accent"
            title="No cancellation found"
            description={state.error.message}
            action={
              <Button asChild variant="outline">
                <Link to={`/coordinator/trips/${tripId}`}>View trip</Link>
              </Button>
            }
          />
        ) : (
          <Banner
            tone="danger"
            title="Couldn’t load the cancellation"
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        ))}

      {state.status === 'success' && (
        <>
          <ResultHeader
            tone="danger"
            title={`Trip ${state.data.tripId} cancelled`}
            badge={<StatusBadge status="cancelled" />}
            description={`${state.data.orderId} for ${state.data.customerName} was cancelled ${
              state.data.statusWhenCancelled === 'Assigned' ? 'before the trip started' : 'before the cargo was picked up'
            }. The driver, mechanic and customer have been notified.`}
            actions={
              <>
                <Button asChild variant="outline">
                  <Link to={`/coordinator/orders/${state.data.orderId}`}>View order</Link>
                </Button>
                <Button asChild>
                  <Link to="/coordinator/trips?status=cancelled">Back to trips</Link>
                </Button>
              </>
            }
          />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-5">
              <NotificationsTable
                title="Notifications sent"
                subtitle="Sent automatically when the trip was cancelled"
                notifications={state.data.notifications}
                footnote="The trip moves to the Cancelled tab. The driver’s app stops the trip and removes it from their list."
              />
              <DriverNotificationPreview
                title={state.data.driverPreview.title}
                body={state.data.driverPreview.body}
                effects={[
                  'Trip is removed from the driver’s list',
                  ...(state.data.startOdometerKm
                    ? [`Start odometer ${state.data.startOdometerKm.toLocaleString('en-LK')} km is kept in the history`]
                    : []),
                  'Mechanic gets the same alert',
                ]}
              />
            </div>

            <SectionCard title="Cancellation details">
              <dl className="flex flex-col gap-3.5 px-5 py-[18px]">
                <KeyValueRow label="Trip ID" mono>{state.data.tripId}</KeyValueRow>
                <KeyValueRow label="Order" mono>{state.data.orderId}</KeyValueRow>
                <KeyValueRow label="Customer">{state.data.customerName}</KeyValueRow>
                <KeyValueRow label="Status when cancelled">{state.data.statusWhenCancelled}</KeyValueRow>
                <KeyValueRow label="Cancelled by">{state.data.cancelledBy}</KeyValueRow>
                <p className="text-[13px] leading-5 text-muted-foreground">Reason: “{state.data.reason}”</p>
                {state.data.refund !== null && (
                  <KeyValueRow label="Full refund" mono>{formatLKR(state.data.refund)}</KeyValueRow>
                )}
                <div className="h-px bg-border" />
                <KeyValueRow label="Vehicle freed" mono>{state.data.vehiclePlate ?? '—'}</KeyValueRow>
                <KeyValueRow label="Driver freed">{state.data.driverName ?? '—'}</KeyValueRow>
                <KeyValueRow label="Mechanic freed">{state.data.mechanicName ?? '—'}</KeyValueRow>
              </dl>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
