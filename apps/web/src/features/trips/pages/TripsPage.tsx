import { Activity, TriangleAlert, Truck, Users } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { KpiCard } from '@/components/shared/KpiCard'
import { KpiCardSkeleton } from '@/components/shared/KpiCardSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { AllTripsCard } from '../components/AllTripsCard'
import { DriverUpdatesCard } from '../components/DriverUpdatesCard'
import { NeedsAttentionCard } from '../components/NeedsAttentionCard'
import { useTripsOverview } from '../hooks/useTripsOverview'

export function TripsPage() {
  const { state, retry } = useTripsOverview()
  const data = state.status === 'success' ? state.data : null
  const count = (predicate: (trip: NonNullable<typeof data>['trips'][number]) => boolean) =>
    data ? data.trips.filter(predicate).length : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Trips"
        description="Every trip and its status, from draft to completed. Drivers update the status from the Driver app when they start and complete a trip."
        actions={
          <Button asChild>
            <Link to="/coordinator/trips/new">Create trip</Link>
          </Button>
        }
      />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading trips" className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={5} />
        </div>
      )}

      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load trips"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KpiCard
              icon={Activity}
              tone="info"
              label="In progress"
              value={count((t) => t.status === 'in-progress')}
              meta="Started by the driver"
            />
            <KpiCard
              icon={Users}
              tone="success"
              label="Assigned"
              value={count((t) => t.status === 'assigned')}
              meta="Waiting for the driver to start"
            />
            <KpiCard
              icon={TriangleAlert}
              tone="danger"
              label="Not started on time"
              value={count((t) => Boolean(t.notStartedOnTime))}
              meta="Past its scheduled start"
            />
            <KpiCard
              icon={Truck}
              label="Completed today"
              value={count((t) => Boolean(t.completedToday))}
              meta={`${count((t) => Boolean(t.endOdometerMissing))} waiting for end odometer`}
            />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <DriverUpdatesCard updates={data.driverUpdates} />
            <NeedsAttentionCard items={data.attention} />
          </div>

          <AllTripsCard trips={data.trips} />
        </>
      )}
    </div>
  )
}
