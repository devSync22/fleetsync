import type { ReactNode } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { ReadyOrder } from '../types'

function Cell({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-r border-b px-[18px] py-3.5 last:border-r-0 xl:border-b-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className={cn('text-sm font-medium', mono && 'font-mono')}>{children}</div>
    </div>
  )
}

/** The order this trip is for, across the top of Create trip. */
export function OrderSummaryStrip({ order }: { order: ReadyOrder }) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-xl border bg-card xl:grid-cols-[0.8fr_1fr_1.3fr_1.3fr_1.2fr_0.7fr]">
      <Cell label="Order" mono>{order.orderId}</Cell>
      <Cell label="Customer">{order.customerName}</Cell>
      <Cell label="Route">{order.route}</Cell>
      <Cell label="Trip window">{order.tripWindow}</Cell>
      <Cell label="Cargo">{order.cargoLabel}</Cell>
      <Cell label="Payment">
        <StatusBadge status="paid" />
      </Cell>
    </div>
  )
}
