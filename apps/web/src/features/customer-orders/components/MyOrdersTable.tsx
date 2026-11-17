import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn, formatLKR } from '@/lib/utils'
import { customerStatusBadge } from '../myOrdersTabs'
import type { CustomerOrderRow } from '../types'

const cell = 'px-2 py-3 first:pl-5 last:pr-5 xl:px-2'
const headCell = 'px-2 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground first:pl-5 last:pr-5 xl:px-2'
// Cargo only fits from xl (1280px) up; the rest stays within a 1024px window.
const wideOnly = 'hidden xl:table-cell'

/** Quoted orders go to the quotation; everything else opens the order. */
function OrderAction({ order }: { order: CustomerOrderRow }) {
  if (order.status === 'quoted') {
    return (
      <Button asChild size="sm">
        <Link to={`/customer/quotations/${order.orderId}`}>Review quote</Link>
      </Button>
    )
  }
  return (
    <Button asChild variant="outline" size="sm">
      <Link to={`/customer/orders/${order.orderId}`}>View</Link>
    </Button>
  )
}

/** The orders table of "Customer — My orders" (157:5675). */
export function MyOrdersTable({ orders }: { orders: CustomerOrderRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b bg-background">
          <tr>
            <th scope="col" className={headCell}>Order</th>
            <th scope="col" className={cn(headCell, 'w-[210px]')}>Route</th>
            <th scope="col" className={cn(headCell, wideOnly, 'w-[150px]')}>Cargo</th>
            <th scope="col" className={cn(headCell, 'w-[130px]')}>Pickup</th>
            <th scope="col" className={cn(headCell, 'w-[120px] text-right')}>Amount</th>
            <th scope="col" className={cn(headCell, 'w-[140px]')}>Status</th>
            <th scope="col" className={cn(headCell, 'w-[120px]')}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={cell}>
                <div className="flex flex-col gap-px whitespace-nowrap">
                  <span className="font-mono text-sm font-medium">{order.orderId}</span>
                  <span className="text-xs text-muted-foreground">{order.placedLabel}</span>
                </div>
              </td>
              <td className={cn(cell, 'whitespace-nowrap')}>{order.route}</td>
              <td className={cn(cell, wideOnly, 'whitespace-nowrap text-muted-foreground')}>{order.cargo}</td>
              <td className={cn(cell, 'whitespace-nowrap')}>{order.pickupLabel}</td>
              <td className={cn(cell, 'text-right font-mono whitespace-nowrap', order.amount === null && 'text-faint')}>
                {order.amount === null ? '—' : formatLKR(order.amount)}
              </td>
              <td className={cell}>
                <StatusBadge status={customerStatusBadge[order.status]} />
              </td>
              <td className={cn(cell, 'text-right')}>
                <OrderAction order={order} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
