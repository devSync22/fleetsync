import { Package } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { WaitingOrder, WaitingOrderStatus } from '../types'
import { DashboardCard } from './DashboardCard'
import { ListCell } from './ListCell'

/** The next step for the coordinator depends on where the order is. */
const nextAction: Record<
  WaitingOrderStatus,
  { label: string; variant: 'default' | 'outline'; to: (orderId: string) => string }
> = {
  'pending-review': { label: 'Prepare quote', variant: 'default', to: (id) => `/coordinator/orders/${id}` },
  quoted: { label: 'View', variant: 'outline', to: (id) => `/coordinator/orders/${id}` },
  paid: { label: 'Create trip', variant: 'default', to: (id) => `/coordinator/trips/new?order=${id}` },
}

export function WaitingOrdersCard({ orders }: { orders: WaitingOrder[] }) {
  return (
    <DashboardCard
      title="Orders waiting for you"
      subtitle="Newest first"
      link={{ label: 'All orders', to: '/coordinator/orders' }}
    >
      {orders.length === 0 ? (
        <EmptyState
          bare
          icon={Package}
          title="No orders waiting"
          description="New customer orders will appear here for review."
        />
      ) : (
        <ul>
          {orders.map((order) => {
            const action = nextAction[order.status]
            return (
              <li
                key={order.orderId}
                className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b px-5 py-3 last:border-b-0"
              >
                <ListCell mono className="w-[130px]" primary={order.orderId} secondary={order.receivedLabel} />
                <ListCell className="w-[200px]" primary={order.customerName} secondary={order.route} />
                <div className="w-[130px] shrink-0">
                  <StatusBadge status={order.status} />
                </div>
                <div className="ml-auto">
                  <Button asChild variant={action.variant} size="sm">
                    <Link to={action.to(order.orderId)}>{action.label}</Link>
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardCard>
  )
}
