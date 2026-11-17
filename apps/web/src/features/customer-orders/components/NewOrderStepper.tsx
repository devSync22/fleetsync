import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { newOrderSteps } from '../newOrderOptions'
import type { NewOrderStep } from '../types'

/** "Step 1 of 3 · Pickup and destination" … at the top of the wizard. Done steps get a green tick. */
export function NewOrderStepper({ current }: { current: NewOrderStep }) {
  return (
    <ol aria-label="Order steps" className="flex overflow-x-auto rounded-xl border bg-card px-6 py-4">
      {newOrderSteps.map(({ step, title }, i) => {
        const done = step < current
        const active = step === current
        return (
          <li key={step} aria-current={active ? 'step' : undefined} className="flex min-w-[200px] flex-1 items-center gap-3">
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                done && 'bg-success-soft text-success',
                active && 'bg-brand text-primary-foreground',
                !done && !active && 'bg-secondary text-muted-foreground',
              )}
            >
              {done ? <Check className="size-3.5" strokeWidth={2.5} aria-label="Done" /> : step}
            </span>
            <div className="flex flex-col gap-px whitespace-nowrap">
              <p className="text-[11px] text-muted-foreground">
                Step {step} of {newOrderSteps.length}
              </p>
              <p className={cn('text-sm font-semibold', !done && !active && 'text-muted-foreground')}>{title}</p>
            </div>
            {i < newOrderSteps.length - 1 && (
              <span aria-hidden className={cn('h-0.5 min-w-4 flex-1', done ? 'bg-success' : 'bg-border')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}
