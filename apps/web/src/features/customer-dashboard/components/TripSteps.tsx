import { cn } from '@/lib/utils'
import type { ActiveTripStep } from '../types'

/** Assigned → Started by the driver → Completed: filled dots for steps done, a hollow dot for the rest. */
export function TripSteps({ steps }: { steps: ActiveTripStep[] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const next = steps[i + 1]
        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex w-3.5 shrink-0 flex-col items-center pt-0.5" aria-hidden>
              <span
                className={cn('size-3 shrink-0 rounded-full', step.done ? 'bg-success' : 'border-2 border-line bg-card')}
              />
              {next && <span className={cn('w-0.5 flex-1', next.done ? 'bg-success' : 'bg-line')} />}
            </div>
            <div className={cn('flex flex-col gap-px', next && 'min-h-10', !step.done && 'text-muted-foreground')}>
              <span className="text-[13px] font-medium">{step.label}</span>
              <span className="text-xs text-muted-foreground">{step.timeLabel}</span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
