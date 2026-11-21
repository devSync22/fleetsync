import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LifecycleStep } from '../types'

/** Draft → Assigned → In progress → (Cargo picked up) → Completed, with the time each step happened. */
export function LifecycleStepper({ steps }: { steps: LifecycleStep[] }) {
  return (
    <ol className="flex overflow-x-auto rounded-xl border bg-card px-6 py-[18px]">
      {steps.map((step, i) => {
        const next = steps[i + 1]
        return (
          <li key={step.label} className="flex min-w-[180px] flex-1 items-center gap-3">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                step.state === 'done' && 'bg-success-soft text-success',
                step.state === 'current' && 'border-[1.5px] border-info bg-info-soft text-info',
                step.state === 'upcoming' && 'bg-secondary text-muted-foreground',
              )}
            >
              {step.state === 'done' ? <Check className="size-3.5" aria-label="Done" /> : i + 1}
            </span>
            <div className="flex flex-col gap-px whitespace-nowrap">
              <p className={cn('text-sm font-semibold', step.state === 'upcoming' && 'text-muted-foreground')}>{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.detail}</p>
              <p className="font-mono text-xs text-faint">{step.time ?? '—'}</p>
            </div>
            {next && (
              <span
                aria-hidden
                className={cn('mx-1 h-0.5 min-w-4 flex-1', next.state === 'upcoming' ? 'bg-border' : 'bg-success')}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
