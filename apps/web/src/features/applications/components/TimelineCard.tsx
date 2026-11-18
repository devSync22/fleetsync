import { SectionCard } from '@/components/shared/SectionCard'
import { cn } from '@/lib/utils'
import type { TimelineEntry } from '../types'

const dots = { accent: 'bg-brand', success: 'bg-success', neutral: 'bg-faint', danger: 'bg-danger' }

/** "Timeline": what happened to the application, newest first. */
export function TimelineCard({ entries }: { entries: TimelineEntry[] }) {
  return (
    <SectionCard title="Timeline">
      <ol className="flex flex-col gap-3.5 px-5 py-4">
        {entries.map((entry, i) => (
          <li key={`${entry.time}-${i}`} className="flex gap-3">
            <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', dots[entry.tone])} aria-hidden />
            <div className="flex flex-col">
              <span className="text-[13px]">{entry.text}</span>
              <span className="text-xs text-muted-foreground">{entry.time}</span>
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  )
}
