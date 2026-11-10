import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatLKR } from '@/lib/utils'
import { FareEstimationCard } from '../components/FareEstimationCard'
import { CargoCard, CustomerCard, RouteCard } from '../components/OrderFactCards'
import { useOrderDetail } from '../hooks/useOrderDetail'
import type { OrderDetail } from '../types'

/** For orders past review there is no frame yet: show where the order stands and the next step. */
function OrderStatusCard({ order }: { order: OrderDetail }) {
  return (
    <SectionCard title="Order status">
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <dl className="flex flex-col gap-3.5">
          <KeyValueRow label="Status">
            <StatusBadge status={order.status} />
          </KeyValueRow>
          <KeyValueRow label="Payment">
            <StatusBadge status={order.payment} />
          </KeyValueRow>
          <KeyValueRow label="Quotation" mono={Boolean(order.quotation)}>
            {order.quotation ? formatLKR(order.quotation.amount) : '—'}
          </KeyValueRow>
          {order.quotation && <KeyValueRow label="Customer">{order.quotation.openedLabel}</KeyValueRow>}
        </dl>
        <div className="flex flex-wrap justify-end gap-2">
          {order.status === 'quoted' && (
            <Button asChild variant="outline">
              <Link to={`/coordinator/orders/${order.orderId}/quotation-sent`}>View quotation</Link>
            </Button>
          )}
          {order.status === 'accepted' && order.payment === 'paid' && (
            <Button asChild>
              <Link to={`/coordinator/trips/new?order=${order.orderId}`}>Create trip</Link>
            </Button>
          )}
          {order.tripId && (
            <Button asChild variant="outline">
              <Link to={`/coordinator/trips/${order.tripId}`}>View trip</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to={`/coordinator/chat?order=${order.orderId}`}>Open chat</Link>
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}

/**
 * "Review order / Fare estimation" (123:4232, cargo variants 392:13377 / 392:13135 / 392:13619).
 * Orders still pending review get the Prepare quote form; others show their status.
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
  return (
    <div className="flex flex-col gap-6">
      {crumbs}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[28px] leading-9 font-bold tracking-[-0.01em]">Review order {order.orderId}</h1>
          <StatusBadge status={order.status} />
        </div>
        <p className="text-[13px] text-muted-foreground">
          {order.customerName} · submitted {order.submittedLabel} · pickup {order.pickupLabel}
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex min-w-0 flex-col gap-5">
          <CustomerCard order={order} />
          <RouteCard order={order} />
          <CargoCard order={order} />
        </div>
        <div className="xl:sticky xl:top-6">
          {order.status === 'pending-review' ? <FareEstimationCard order={order} /> : <OrderStatusCard order={order} />}
        </div>
      </div>
    </div>
  )
}
