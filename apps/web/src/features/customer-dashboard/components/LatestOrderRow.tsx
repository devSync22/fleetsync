import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { orderStatusBadge } from '../format'
import type { DashboardOrderRow } from '../types'

/** Quoted → "Review" (the quotation); pending review → nothing yet; the rest → "View" (the order). */
function RowAction({ order }: { order: DashboardOrderRow }) {
  if (order.status === 'pending-review') return null
  if (order.status === 'quoted') {
    return (
      <Button asChild size="sm">
        <Link to={`/customer/quotations/${order.orderId}`}>Review</Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={`/customer/orders/${order.orderId}`}>View</Link>
    </Button>
  )
}

export function LatestOrderRow({ order }: { order: DashboardOrderRow }) {
  return (
    <li className="flex items-center gap-4 border-b px-5 py-3 last:border-b-0">
      <div className="flex w-[110px] shrink-0 flex-col gap-px">
        <span className="font-mono text-sm font-medium">{order.orderId}</span>
        <span className="text-xs text-muted-foreground">{order.dateLabel}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <span className="truncate text-sm font-medium">{order.route}</span>
        <span className="truncate text-xs text-muted-foreground">{order.cargoSummary}</span>
      </div>
      <div className="w-[130px] shrink-0">
        <StatusBadge status={orderStatusBadge[order.status]} />
      </div>
      <div className="flex w-20 shrink-0 justify-end">
        <RowAction order={order} />
      </div>
    </li>
  )
}
