import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FareEstimationCard } from '../components/FareEstimationCard'
import { CargoCard, CustomerCard, RouteCard } from '../components/OrderFactCards'
import { OrderHistoryCard } from '../components/OrderHistoryCard'
import { OrderStatusCard } from '../components/OrderStatusCard'
import { useOrderDetail } from '../hooks/useOrderDetail'

/**
 * "Review order / Fare estimation" (123:4232, cargo variants 392:13377 / 392:13135 / 392:13619).
 * Orders still pending review get the Prepare quote form; later orders get the order details view
 * (no frame): status, next step, the quotation link and the order history.
 */
export function OrderReviewPage() {
  const { orderId = '' } = useParams()
  const { state, retry } = useOrderDetail(orderId)
  const crumbs = (
    <Breadcrumbs items={[{ label: 'Submitted orders', to: '/coordinator/orders' }, { label: orderId, mono: true }]} />
  )

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Loading order" className="flex flex-col gap-6">
        {crumbs}
        <Skeleton className="h-8 w-80 rounded-full" />
        <TableSkeleton rows={5} />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        {crumbs}
        {state.error.status === 404 ? (
          <EmptyState
            className="mx-auto mt-6 w-[360px]"
            icon={SearchX}
            tone="accent"
            title="Order not found"
            description={state.error.message}
            action={
              <Button asChild variant="outline">
                <Link to="/coordinator/orders">Back to orders</Link>
              </Button>
            }
          />
        ) : (
          <Banner
            tone="danger"
            title="Couldn’t load the order"
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        )}
      </div>
    )
  }

  const order = state.data
  const reviewing = order.status === 'pending-review'
  return (
    <div className="flex flex-col gap-6">
      {crumbs}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[28px] leading-9 font-bold tracking-[-0.01em]">
            {reviewing ? 'Review order' : 'Order'} {order.orderId}
          </h1>
          <StatusBadge status={order.status} />
          {!reviewing && <StatusBadge status={order.payment} />}
        </div>
        <p className="text-[13px] text-muted-foreground">
          {order.customerName} · submitted {order.submittedLabel} ·{' '}
          {order.closedNote
            ? order.closedNote[0].toLowerCase() + order.closedNote.slice(1)
            : `pickup ${order.pickupLabel}`}
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex min-w-0 flex-col gap-5">
          <CustomerCard order={order} />
          <RouteCard order={order} />
          <CargoCard order={order} />
        </div>
        {/* Stacked below xl, an order past review leads with its status; the quote form stays after the facts. */}
        <div className={reviewing ? 'xl:sticky xl:top-6' : 'flex min-w-0 flex-col gap-5 max-xl:order-first'}>
          {reviewing ? (
            <FareEstimationCard order={order} />
          ) : (
            <>
              <OrderStatusCard order={order} />
              <OrderHistoryCard events={order.history} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
