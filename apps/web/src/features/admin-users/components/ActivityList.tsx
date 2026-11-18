import { cn } from '@/lib/utils'
import type { ActivityItem } from '../types'

const dotTones = { success: 'bg-success', neutral: 'bg-faint', pending: 'bg-pending' }

/** Dot + text + time list of a user's recent actions. */
export function ActivityList({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return <p className="text-[13px] text-muted-foreground">No activity yet.</p>
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, i) => (
        <li key={`${item.time}-${i}`} className="flex gap-3">
          <span className={cn('mt-[7px] size-2 shrink-0 rounded-full', dotTones[item.tone])} aria-hidden />
          <div className="flex flex-col">
            <span className="text-sm">{item.text}</span>
            <span className="text-xs text-muted-foreground">{item.time}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
