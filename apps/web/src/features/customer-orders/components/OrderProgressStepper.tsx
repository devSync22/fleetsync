import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderProgressState, OrderProgressStep } from '../types'

const stateText: Record<OrderProgressState, string> = {
  done: 'done',
  current: 'current step',
  upcoming: 'not reached yet',
  stopped: 'order ended here',
}

/**
 * Submitted → Quoted → Paid → Trip scheduled → In progress → Completed, with a caption under each step.
 * Orders that ended early (declined, expired, cancelled) show a red cross on the step where they stopped.
 */
export function OrderProgressStepper({ steps }: { steps: OrderProgressStep[] }) {
  return (
    <ol aria-label="Order progress" className="flex overflow-x-auto rounded-xl border bg-card px-6 py-[18px]">
      {steps.map((step, i) => (
        <li key={step.id} className="flex min-w-[150px] flex-1 items-center gap-2.5">
          <span
            className={cn(
              'flex size-[26px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold',
              step.state === 'done' && 'bg-success-soft text-success',
              step.state === 'current' && 'border-[1.5px] border-info bg-info-soft text-info',
              step.state === 'upcoming' && 'bg-secondary text-muted-foreground',
              step.state === 'stopped' && 'bg-danger-soft text-danger',
            )}
          >
            {step.state === 'done' ? (
              <Check className="size-[13px]" strokeWidth={2.5} aria-hidden />
            ) : step.state === 'stopped' ? (
              <X className="size-[13px]" strokeWidth={2.5} aria-hidden />
            ) : (
              i + 1
            )}
          </span>
          <div className="flex flex-col gap-px whitespace-nowrap">
            <p className={cn('text-[13px] font-semibold', step.state === 'upcoming' && 'text-muted-foreground')}>
              {step.label}
              <span className="sr-only"> ({stateText[step.state]})</span>
            </p>
            <p className={cn('text-[11px] text-muted-foreground', step.state === 'stopped' && 'text-danger')}>{step.caption}</p>
          </div>
          {i < steps.length - 1 && (
            <span aria-hidden className={cn('h-0.5 min-w-4 flex-1', step.state === 'done' ? 'bg-success' : 'bg-border')} />
          )}
        </li>
      ))}
    </ol>
  )
}
