import { Package } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import type { DashboardOrderRow } from '../types'
import { LatestOrderRow } from './LatestOrderRow'

/** "My orders": the newest orders, latest first. */
export function LatestOrdersCard({ orders }: { orders: DashboardOrderRow[] }) {
  return (
    <SectionCard title="My orders" subtitle="Latest first" link={{ label: 'View all', to: '/customer/orders' }}>
      {orders.length > 0 ? (
        <ul>
          {orders.map((order) => (
            <LatestOrderRow key={order.orderId} order={order} />
          ))}
        </ul>
      ) : (
        <EmptyState
          bare
          icon={Package}
          title="No orders yet"
          description="Place a transport order and a coordinator will send you a fare quotation."
          action={
            <Button asChild size="sm">
              <Link to="/customer/new-order">New transport order</Link>
            </Button>
          }
        />
      )}
    </SectionCard>
  )
}
