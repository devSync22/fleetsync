import { Check, Play, Smartphone } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import type { DriverUpdate } from '../types'

export function DriverUpdatesCard({ updates }: { updates: DriverUpdate[] }) {
  return (
    <SectionCard title="Driver updates" subtitle="Status changes sent from the Driver app today">
      {updates.length === 0 ? (
        <EmptyState
          bare
          icon={Smartphone}
          title="No driver updates yet"
          description="Starts and completions from the Driver app appear here as they happen."
        />
      ) : (
        <ul>
          {updates.map((update) => {
            const done = update.action === 'completed'
            const Icon = done ? Check : Play
            return (
              <li key={`${update.tripId}-${update.action}`} className="flex items-center gap-3.5 border-b px-5 py-3 last:border-b-0">
                <span className="w-11 shrink-0 font-mono text-xs text-muted-foreground">{update.time}</span>
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-full',
                    done ? 'bg-success-soft text-success' : 'bg-info-soft text-info',
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-px">
                  <p className="text-[13px]">
                    <span className="font-semibold">{update.driverName}</span> {update.action}{' '}
                    <span className="font-mono font-medium">{update.tripId}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{update.detail}</p>
                </div>
                <StatusBadge status={done ? 'completed' : 'in-progress'} />
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
