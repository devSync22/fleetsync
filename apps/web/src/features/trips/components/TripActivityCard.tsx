import { SectionCard } from '@/components/shared/SectionCard'
import type { TripActivity } from '../types'

/** Newest-first log of what happened on the trip and where it came from (Driver app, Mechanic app…). */
export function TripActivityCard({ activity }: { activity: TripActivity[] }) {
  return (
    <SectionCard title="Trip activity">
      {activity.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">Nothing has happened on this trip yet.</p>
      ) : (
        <ol>
          {activity.map((entry) => (
            <li key={`${entry.time}-${entry.title}`} className="flex items-start gap-3.5 border-b px-5 py-[11px] last:border-b-0">
              <span className="w-[110px] shrink-0 font-mono text-xs text-muted-foreground">{entry.time}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <p className="text-[13px] font-medium">{entry.title}</p>
                <p className="text-xs text-muted-foreground">{entry.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}
