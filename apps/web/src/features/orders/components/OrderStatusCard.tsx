import { Link } from 'react-router'
import { InfoNote } from '@/components/shared/InfoNote'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import { vehicleClassOf } from '../fareRates'
import type { OrderDetail } from '../types'

/** What the coordinator should know or do next, by where the order stands. */
function nextStep(order: OrderDetail): string {
  switch (order.status) {
    case 'quoted':
      return 'Waiting for the customer to accept and pay. If they haven’t answered 2 hours before it expires, it shows on your dashboard.'
    case 'accepted':
      return order.payment === 'paid'
        ? 'The customer has paid. Create a trip to assign a vehicle and driver.'
        : 'The customer accepted, but the card payment failed. They can retry from their account — remind them in the order’s chat.'
    case 'trip-created':
      return `Trip ${order.tripId} is assigned. Follow it from Trips.`
    case 'completed':
      return 'The order is delivered and closed.'
    case 'trip-cancelled':
      return 'The trip was cancelled and the customer was refunded in full.'
    case 'quotation-expired':
      return 'The customer didn’t answer before the quotation expired. They can submit the order again.'
    case 'declined':
      return 'The customer declined the quotation. The order is closed.'
    default:
      return ''
  }
}

/** Right-hand summary for orders past review: status, payment, quotation and the next step. */
export function OrderStatusCard({ order }: { order: OrderDetail }) {
  const hasQuotation = order.quotation !== null
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
          {order.quotation && (
            <>
              <KeyValueRow label="Quotation total" mono>
                {formatLKR(order.quotation.amount)}
              </KeyValueRow>
              <KeyValueRow label="Vehicle type">{vehicleClassOf(order.estimate.vehicleClass).label}</KeyValueRow>
              {order.status === 'quoted' && <KeyValueRow label="Customer">{order.quotation.openedLabel}</KeyValueRow>}
            </>
          )}
          {order.tripId && (
            <KeyValueRow label="Trip" mono>
              <Link to={`/coordinator/trips/${order.tripId}`} className="text-brand hover:underline">
                {order.tripId}
              </Link>
            </KeyValueRow>
          )}
          {order.closedNote && <KeyValueRow label="Closed">{order.closedNote}</KeyValueRow>}
        </dl>

        <InfoNote className="rounded-lg bg-background px-3 py-2.5">{nextStep(order)}</InfoNote>

        <div className="flex flex-wrap justify-end gap-2">
          <Button asChild variant="outline">
            <Link to={`/coordinator/chat?order=${order.orderId}`}>Open chat</Link>
          </Button>
          {hasQuotation && (
            <Button asChild variant={order.status === 'quoted' ? 'default' : 'outline'}>
              <Link to={`/coordinator/orders/${order.orderId}/quotation-sent`}>View quotation</Link>
            </Button>
          )}
          {order.tripId && (
            <Button asChild variant="outline">
              <Link to={`/coordinator/trips/${order.tripId}`}>View trip</Link>
            </Button>
          )}
          {order.status === 'accepted' && order.payment === 'paid' && (
            <Button asChild>
              <Link to={`/coordinator/trips/new?order=${order.orderId}`}>Create trip</Link>
            </Button>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
