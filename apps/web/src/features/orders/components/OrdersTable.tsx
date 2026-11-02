import { ListCell } from '@/components/shared/ListCell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatLKR } from '@/lib/utils'
import type { SubmittedOrder } from '../types'
import { OrderRowActions } from './OrderRowActions'

const kgFormatter = new Intl.NumberFormat('en-LK')

// Cargo and Pickup only fit from xl (1280px) up; tighter padding keeps the rest within 1024px.
const cell = 'px-3 py-3 xl:px-4'
const wideOnly = 'hidden xl:table-cell'
const headCell = `${cell} text-xs font-medium whitespace-nowrap text-muted-foreground`

export function OrdersTable({ orders }: { orders: SubmittedOrder[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b">
          <tr>
            <th scope="col" className={`${headCell} pl-5 xl:pl-5`}>
              Order
            </th>
            <th scope="col" className={headCell}>
              Customer
            </th>
            <th scope="col" className={`${headCell} ${wideOnly}`}>
              Cargo
            </th>
            <th scope="col" className={`${headCell} ${wideOnly}`}>
              Pickup
            </th>
            <th scope="col" className={`${headCell} text-right`}>
              Quotation
            </th>
            <th scope="col" className={headCell}>
              Status
            </th>
            <th scope="col" className={`${headCell} pr-5 text-right xl:pr-5`}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={`${cell} pl-5 xl:pl-5`}>
                <ListCell mono primary={order.orderId} secondary={order.submittedLabel} />
              </td>
              <td className={cell}>
                <ListCell primary={order.customerName} secondary={order.route} />
              </td>
              <td className={`${cell} ${wideOnly}`}>
                <ListCell primary={order.cargoType} secondary={`${kgFormatter.format(order.cargoWeightKg)} kg`} />
              </td>
              <td className={`${cell} ${wideOnly} whitespace-nowrap`}>{order.pickupLabel}</td>
              <td className={`${cell} text-right whitespace-nowrap`}>
                {order.quotedAmount === null ? (
                  <span className="text-faint">Not quoted</span>
                ) : (
                  <span className="font-mono font-medium">{formatLKR(order.quotedAmount)}</span>
                )}
              </td>
              <td className={cell}>
                <StatusBadge status={order.status} />
              </td>
              <td className={`${cell} pr-5 xl:pr-5`}>
                <OrderRowActions order={order} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
