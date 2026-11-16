import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ActiveTripCard } from '../components/ActiveTripCard'
import { CustomerDashboardSkeleton } from '../components/CustomerDashboardSkeleton'
import { CustomerKpis } from '../components/CustomerKpis'
import { LatestOrdersCard } from '../components/LatestOrdersCard'
import { QuotationBanner } from '../components/QuotationBanner'
import { RecentPaymentsCard } from '../components/RecentPaymentsCard'
import { dashboardSubtitle, greeting } from '../format'
import { useCustomerDashboard } from '../hooks/useCustomerDashboard'

/** "Customer — Dashboard" (150:5292). */
export function CustomerDashboardPage() {
  const { state, retry } = useCustomerDashboard()
  const data = state.status === 'success' ? state.data : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        className="items-end"
        title={data ? `${greeting()}, ${data.greetingName}` : greeting()}
        description={
          state.status === 'loading' ? (
            <Skeleton className="mt-1 h-3 w-80 max-w-full rounded-full" />
          ) : (
            data && dashboardSubtitle(data.companyName, data.kpis.quotationsToReview.value)
          )
        }
        actions={
          <Button asChild>
            <Link to="/customer/new-order">New transport order</Link>
          </Button>
        }
      />

      {state.status === 'loading' && <CustomerDashboardSkeleton />}

      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load your dashboard"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          }
        />
      )}

      {data && (
        <>
          <CustomerKpis kpis={data.kpis} />
          {data.quotationBanner && <QuotationBanner quotation={data.quotationBanner} />}
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <LatestOrdersCard orders={data.latestOrders} />
            <div className="flex min-w-0 flex-col gap-5">
              {data.activeTrip && <ActiveTripCard trip={data.activeTrip} />}
              <RecentPaymentsCard payments={data.recentPayments} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
