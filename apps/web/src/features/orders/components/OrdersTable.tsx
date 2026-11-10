import { Link } from 'react-router'
import { ListCell } from '@/components/shared/ListCell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatLKR } from '@/lib/utils'
import type { SubmittedOrder } from '../types'

// Cargo and Payment only fit from xl (1280px) up; tighter padding keeps the rest within 1024px.
const cell = 'px-2 py-3 first:pl-5 last:pr-5 xl:px-3'
const headCell = 'px-2 py-2.5 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap text-muted-foreground uppercase first:pl-5 last:pr-5 xl:px-3'
const wideOnly = 'hidden xl:table-cell'

function expiresLabel(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h === 0 ? `${m} min` : m === 0 ? `${h} h` : `${h} h ${m} min`
}

/** The single next step for each row (Style Guide: small button in the Actions column). */
function OrderAction({ order }: { order: SubmittedOrder }) {
  if (order.status === 'pending-review') {
    return (
      <Button asChild size="sm">
        <Link to={`/coordinator/orders/${order.orderId}`}>Prepare quote</Link>
      </Button>
    )
  }
  if (order.status === 'accepted' && order.payment === 'paid') {
    return (
      <Button asChild size="sm">
        <Link to={`/coordinator/trips/new?order=${order.orderId}`}>Create trip</Link>
      </Button>
    )
  }
  if (order.tripId) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link to={`/coordinator/trips/${order.tripId}`}>View trip</Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={`/coordinator/orders/${order.orderId}`}>View</Link>
    </Button>
  )
}

function OrderStatusBadge({ order }: { order: SubmittedOrder }) {
  const minutes = order.quotation?.expiresInMinutes
  if (order.status === 'quoted' && minutes != null && minutes <= 120) {
    return <StatusBadge tone={minutes < 60 ? 'danger' : 'pending'}>Expires in {expiresLabel(minutes)}</StatusBadge>
  }
  return <StatusBadge status={order.status} />
}

type OrdersTableProps = {
  orders: SubmittedOrder[]
  /** The Quoted tab shows the quotation instead of the payment status. */
  showQuotation: boolean
}

export function OrdersTable({ orders, showQuotation }: OrdersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b bg-background">
          <tr>
            <th scope="col" className={headCell}>Order</th>
            <th scope="col" className={headCell}>Customer</th>
            <th scope="col" className={headCell}>Route &amp; pickup</th>
            <th scope="col" className={`${headCell} ${wideOnly}`}>Cargo</th>
            <th scope="col" className={showQuotation ? headCell : `${headCell} ${wideOnly}`}>
              {showQuotation ? 'Quotation' : 'Payment'}
            </th>
            <th scope="col" className={headCell}>Status</th>
            <th scope="col" className={`${headCell} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={cell}>
                <ListCell mono primary={order.orderId} secondary={order.submittedLabel} />
              </td>
              <td className={`${cell} max-w-[150px] font-medium xl:max-w-none xl:whitespace-nowrap`}>{order.customerName}</td>
              <td className={cell}>
                <ListCell primary={order.route} secondary={order.routeNote} className="[&>p:first-child]:font-normal" />
              </td>
              <td className={`${cell} ${wideOnly}`}>
                <ListCell primary={order.cargo} secondary={order.cargoAmount} className="[&>p:first-child]:font-normal" />
              </td>
              <td className={showQuotation ? cell : `${cell} ${wideOnly}`}>
                {showQuotation && order.quotation ? (
                  <ListCell mono primary={formatLKR(order.quotation.amount)} secondary={order.quotation.openedLabel} />
                ) : (
                  <StatusBadge status={order.payment} />
                )}
              </td>
              <td className={cell}>
                <OrderStatusBadge order={order} />
              </td>
              <td className={`${cell} text-right`}>
                <OrderAction order={order} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
