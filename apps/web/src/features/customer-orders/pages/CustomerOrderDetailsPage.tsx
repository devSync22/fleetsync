import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { DownloadInvoiceButton } from '../components/DownloadInvoiceButton'
import { OrderDetailsSkeleton } from '../components/OrderDetailsSkeleton'
import { OrderProgressStepper } from '../components/OrderProgressStepper'
import { OrderQuestionsCard } from '../components/OrderQuestionsCard'
import { PaymentCard } from '../components/PaymentCard'
import { QuotationReadyCard } from '../components/QuotationReadyCard'
import { RouteCargoCard } from '../components/RouteCargoCard'
import { TripStatusCard } from '../components/TripStatusCard'
import { useOrderDetail } from '../hooks/useOrderDetail'
import { customerStatusBadge } from '../myOrdersTabs'
import type { CustomerOrderDetail } from '../types'

const MY_ORDERS = '/customer/orders'

/** Header buttons: the customer's next step is the primary button; otherwise "Open chat" is. */
function HeaderActions({ order }: { order: CustomerOrderDetail }) {
  const chat = `/customer/chat?order=${order.orderId}`
  const next =
    order.status === 'quoted'
      ? { label: 'Review quote', to: `/customer/quotations/${order.orderId}` }
      : order.payment?.status === 'awaiting-payment'
        ? { label: 'Pay now', to: `/customer/quotations/${order.orderId}/pay` }
        : null

  return (
    <>
      {order.payment?.status === 'paid' && <DownloadInvoiceButton />}
      <Button asChild variant={next ? 'outline' : 'default'}>
        <Link to={chat}>Open chat</Link>
      </Button>
      {next && (
        <Button asChild>
          <Link to={next.to}>{next.label}</Link>
        </Button>
      )}
    </>
  )
}

/** "Customer — Order details" (158:5805), plus the states the frame doesn't show. */
export function CustomerOrderDetailsPage() {
  const { orderId = '' } = useParams()
  const { state, retry } = useOrderDetail(orderId)

  if (state.status === 'loading') return <OrderDetailsSkeleton />

  if (state.status === 'error') {
    if (state.error.status === 404) {
      return (
        <EmptyState
          className="mx-auto mt-10 w-[360px] max-w-full"
          icon={SearchX}
          tone="accent"
          title="Order not found"
          description={state.error.message}
          action={
            <Button asChild variant="outline">
              <Link to={MY_ORDERS}>Back to My orders</Link>
            </Button>
          }
        />
      )
    }
    return (
      <div className="flex flex-col gap-6">
        <Breadcrumbs items={[{ label: 'My orders', to: MY_ORDERS }, { label: orderId, mono: true }]} />
        <Banner
          tone="danger"
          title="Couldn’t load this order"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  const order = state.data

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs items={[{ label: 'My orders', to: MY_ORDERS }, { label: order.orderId, mono: true }]} />

      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            Order {order.orderId}
            <StatusBadge status={customerStatusBadge[order.status]} />
          </span>
        }
        description={`Placed ${order.placedLabel} · ${order.route} · ${order.cargoSummary}`}
        actions={<HeaderActions order={order} />}
      />

      <OrderProgressStepper steps={order.progress} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <TripStatusCard trip={order.trip} updates={order.updates} orderStatus={order.status} />
          <RouteCargoCard pickup={order.pickup} destination={order.destination} cargo={order.cargo} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          {order.status === 'quoted' ? (
            <QuotationReadyCard orderId={order.orderId} amount={order.amount} />
          ) : (
            order.payment && <PaymentCard orderId={order.orderId} payment={order.payment} />
          )}
          <OrderQuestionsCard orderId={order.orderId} hasTrip={order.trip !== null} />
        </div>
      </div>
    </div>
  )
}
