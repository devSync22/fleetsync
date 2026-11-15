import { SectionCard } from '@/components/shared/SectionCard'
import { cn } from '@/lib/utils'
import type { OrderEvent } from '../types'

const dotTones: Record<OrderEvent['tone'], string> = {
  neutral: 'bg-faint',
  accent: 'bg-brand',
  info: 'bg-info',
  success: 'bg-success',
  pending: 'bg-pending',
  danger: 'bg-danger',
}

/** Vertical timeline of what has happened to the order, oldest first. */
export function OrderHistoryCard({ events }: { events: OrderEvent[] }) {
  return (
    <SectionCard title="Order history">
      <ol className="flex flex-col px-5 py-[18px]">
        {events.map((event, i) => (
          <li key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
            {i < events.length - 1 && <span aria-hidden className="absolute top-3.5 bottom-0 left-[4.5px] w-px bg-border" />}
            <span aria-hidden className={cn('mt-1.5 size-2.5 shrink-0 rounded-full ring-3 ring-card', dotTones[event.tone])} />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="text-[13px] font-semibold">{event.title}</p>
                <p className="font-mono text-xs text-muted-foreground">{event.when}</p>
              </div>
              {event.detail && <p className="text-xs leading-[18px] text-muted-foreground">{event.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
