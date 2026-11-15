import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { NotificationPreview } from '@/components/shared/NotificationPreview'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { NotificationsTable } from '@/components/shared/NotificationsTable'
import { ResultHeader } from '@/components/shared/ResultHeader'
import { useTripCreation } from '../hooks/useTripCreation'

/** "Trip assigned" (130:4437): shown right after Assign & create trip. */
export function TripCreatedPage() {
  const { tripId = '' } = useParams()
  const { state, retry } = useTripCreation(tripId)

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: 'Trips', to: '/coordinator/trips' }, { label: tripId, mono: true }]} />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading trip" className="flex flex-col gap-6">
          <Skeleton className="h-[126px] w-full rounded-xl" />
          <TableSkeleton rows={2} />
        </div>
      )}

      {state.status === 'error' &&
        (state.error.status === 404 ? (
          <EmptyState
            className="mx-auto mt-6 w-[360px]"
            icon={SearchX}
            tone="accent"
            title="New trip not found"
            description={state.error.message}
            action={
              <Button asChild variant="outline">
                <Link to="/coordinator/trips">Back to trips</Link>
              </Button>
            }
          />
        ) : (
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
        ))}

      {state.status === 'success' && (
        <>
          <ResultHeader
            tone="success"
            title={`Trip ${state.data.tripId} created`}
            badge={<StatusBadge status="scheduled" />}
            description={`${state.data.orderId} for ${state.data.customerName} is scheduled for ${state.data.startLabel}. The driver and mechanic have been sent a push notification.`}
            actions={
              <>
                <Button asChild variant="outline">
                  <Link to="/coordinator/orders">Back to orders</Link>
                </Button>
                <Button asChild>
                  <Link to={`/coordinator/trips/${state.data.tripId}`}>View trip</Link>
                </Button>
              </>
            }
          />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex min-w-0 flex-col gap-5">
              <NotificationsTable
                title="Push notifications"
                subtitle="Sent automatically when the trip was created"
                notifications={state.data.notifications}
                footnote="If a notification is not opened 2 hours before the start time, it appears on your dashboard."
              />
              <NotificationPreview audience="driver"
                title={state.data.driverPreview.title}
                body={state.data.driverPreview.body}
                effects={[
                  'Opens the trip in the Driver app',
                  'Shows pickup, destination and start time',
                  'Mechanic gets the same alert with the vehicle details',
                ]}
              />
            </div>

            <SectionCard title="Trip details">
              <dl className="flex flex-col gap-3.5 px-5 py-[18px]">
                <KeyValueRow label="Trip ID" mono>{state.data.tripId}</KeyValueRow>
                <KeyValueRow label="Order" mono>{state.data.orderId}</KeyValueRow>
                <KeyValueRow label="Customer">{state.data.customerName}</KeyValueRow>
                <KeyValueRow label="Route">{state.data.route}</KeyValueRow>
                <KeyValueRow label="Trip window">{state.data.tripWindow}</KeyValueRow>
                <KeyValueRow label="Cargo">{state.data.cargo}</KeyValueRow>
                <div className="h-px bg-border" />
                <KeyValueRow label="Vehicle" mono>{state.data.vehiclePlate}</KeyValueRow>
                <KeyValueRow label="Driver">{state.data.driverName}</KeyValueRow>
                <KeyValueRow label="Mechanic">{state.data.mechanicName}</KeyValueRow>
                <KeyValueRow label="Created by">{state.data.createdBy}</KeyValueRow>
              </dl>
            </SectionCard>
          </div>
        </>
      )}
    </div>
  )
}
