import { useState } from 'react'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { SectionCard } from '@/components/shared/SectionCard'
import { cn } from '@/lib/utils'
import { personLabel } from '../schedule'
import type { ScheduledPerson, TimeWindow } from '../types'

type PeopleFreeCardProps = {
  title: string
  subtitle: string
  /** "drivers" → "View all 35 drivers". */
  noun: string
  people: ScheduledPerson[]
  window: TimeWindow
  initialCount: number
}

/** "Drivers free" / "Mechanics free": who is free in the window, and when the busy ones are. */
export function PeopleFreeCard({ title, subtitle, noun, people, window, initialCount }: PeopleFreeCardProps) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? people : people.slice(0, initialCount)

  return (
    <SectionCard title={title} subtitle={subtitle}>
      {people.length === 0 ? (
        <p className="px-5 py-4 text-[13px] text-muted-foreground">No {noun} on shift this day.</p>
      ) : (
        <ul>
          {visible.map((person) => {
            const label = personLabel(person, window)
            return (
              <li key={person.name} className="flex items-center gap-2.5 border-b px-5 py-2.5 last:border-b-0">
                <InitialsAvatar initials={person.initials} size={32} />
                <div className="flex min-w-0 flex-1 flex-col gap-px">
                  <span className="truncate text-sm font-medium">{person.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{person.detail}</span>
                </div>
                <span
                  className={cn(
                    'shrink-0 text-xs font-medium whitespace-nowrap',
                    label === 'Free all day' ? 'text-success' : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      )}
      {people.length > initialCount && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="border-t px-5 py-3 text-left text-[13px] font-semibold text-brand hover:underline"
        >
          {showAll ? 'Show fewer' : `View all ${people.length} ${noun}`}
        </button>
      )}
    </SectionCard>
  )
}
