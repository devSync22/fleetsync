import { Ellipsis, Eye, MessageCircle } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { OrderStatus, SubmittedOrder } from '../types'

type PrimaryAction = { label: string; variant: 'default' | 'outline'; to: (orderId: string) => string }

const viewOrder: PrimaryAction = { label: 'View', variant: 'outline', to: (id) => `/coordinator/orders/${id}` }

/** The next step for the coordinator depends on where the order is. */
const primaryAction: Record<OrderStatus, PrimaryAction> = {
  'pending-review': { label: 'Prepare quote', variant: 'default', to: (id) => `/coordinator/orders/${id}` },
  paid: { label: 'Create trip', variant: 'default', to: (id) => `/coordinator/trips/new?order=${id}` },
  quoted: viewOrder,
  'awaiting-payment': viewOrder,
  'payment-failed': viewOrder,
  assigned: viewOrder,
  completed: viewOrder,
  cancelled: viewOrder,
}

/** Actions column: one small button for the next step, plus a ⋯ menu for the rest. */
export function OrderRowActions({ order }: { order: SubmittedOrder }) {
  const action = primaryAction[order.status]
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button asChild variant={action.variant} size="sm">
        <Link to={action.to(order.orderId)}>{action.label}</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`More actions for ${order.orderId}`}>
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={`/coordinator/orders/${order.orderId}`}>
              <Eye aria-hidden />
              View order
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={`/coordinator/chat?order=${order.orderId}`}>
              <MessageCircle aria-hidden />
              Open chat with customer
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
