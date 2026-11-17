import { cn } from '@/lib/utils'
import type { OrderUpdate, OrderUpdateTone } from '../types'

const dotClasses: Record<OrderUpdateTone, string> = {
  neutral: 'bg-faint',
  pending: 'bg-pending',
  accent: 'bg-brand',
  info: 'bg-info',
  success: 'bg-success',
  danger: 'bg-danger',
}

/** Newest-first list of what happened on the order, joined by a vertical line. */
export function OrderUpdatesTimeline({ updates }: { updates: OrderUpdate[] }) {
  return (
    <ol className="flex flex-col">
      {updates.map((update, i) => (
        <li key={`${update.when}-${update.title}`} className="relative flex items-start gap-3 pb-[17px] last:pb-0">
          {i < updates.length - 1 && <span aria-hidden className="absolute top-3.5 -bottom-[3px] left-[4.5px] w-px bg-line" />}
          <span aria-hidden className={cn('mt-1 size-2.5 shrink-0 rounded-full', dotClasses[update.tone])} />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <p className="text-[13px] font-medium">{update.title}</p>
            <p className="text-xs text-muted-foreground">{update.detail}</p>
          </div>
          <p className="shrink-0 text-xs whitespace-nowrap text-muted-foreground">{update.when}</p>
        </li>
      ))}
    </ol>
  )
}
