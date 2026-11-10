import { Activity, Plus, Truck, Users, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { KpiCard } from '@/components/shared/KpiCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ActiveTripsCard } from '../components/ActiveTripsCard'
import { AvailabilityCard } from '../components/AvailabilityCard'
import { DashboardSkeleton } from '../components/DashboardSkeleton'
import { ExpiringQuotationsCard } from '../components/ExpiringQuotationsCard'
import { OperationalReportCard } from '../components/OperationalReportCard'
import { OrderPaymentsCard } from '../components/OrderPaymentsCard'
import { WaitingOrdersCard } from '../components/WaitingOrdersCard'
import { attentionSummary, greeting, plural } from '../format'
import { useCoordinatorDashboard } from '../hooks/useCoordinatorDashboard'

export function CoordinatorDashboardPage() {
  const { state, retry } = useCoordinatorDashboard()
  const data = state.status === 'success' ? state.data : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={data ? `${greeting()}, ${data.coordinatorFirstName}` : greeting()}
        description={
          state.status === 'loading' ? <Skeleton className="mt-1 h-3 w-96 max-w-full rounded-full" /> : data && attentionSummary(data)
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/coordinator/reports">Generate report</Link>
            </Button>
            <Button asChild>
              <Link to="/coordinator/trips/new">
                <Plus aria-hidden />
                Create trip
              </Link>
            </Button>
          </>
        }
      />

      {state.status === 'loading' && <DashboardSkeleton />}

      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load the dashboard"
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
              icon={Wrench}
              tone="pending"
              label="Orders to quote"
              value={data.ordersToQuote}
              meta={
                data.ordersToQuote > 0
                  ? `Oldest waiting ${plural(data.oldestOrderWaitingHours, 'hour')}`
                  : 'No orders waiting'
              }
            />
            <KpiCard
              icon={Activity}
              tone="info"
              label="Trips in progress"
              value={data.tripsInProgress}
              meta="Started by drivers today"
            />
            <KpiCard
              icon={Truck}
              label="Vehicles available"
              value={data.vehicles.free}
              meta={`of ${data.vehicles.total} · ${data.vehicles.inMaintenance} in maintenance`}
            />
            <KpiCard
              icon={Users}
              tone="success"
              label="Drivers available"
              value={data.drivers.free}
              meta={`of ${data.drivers.total} on shift today`}
            />
          </div>

          <ExpiringQuotationsCard quotations={data.expiringQuotations} />

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <WaitingOrdersCard orders={data.waitingOrders} />
            <ActiveTripsCard trips={data.activeTrips} inProgressCount={data.tripsInProgress} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_380px]">
            <AvailabilityCard vehicles={data.vehicles} drivers={data.drivers} />
            <OrderPaymentsCard payments={data.payments} />
            <OperationalReportCard report={data.report} />
          </div>
        </>
      )}
    </div>
  )
}
