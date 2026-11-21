import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/** The drawn box of a checkbox (the real input is visually hidden next to it). */
export function CheckboxMark({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded',
        checked ? 'bg-brand text-primary-foreground' : 'border-[1.5px] border-line bg-card',
        className,
      )}
    >
      {checked && <Check className="size-3" strokeWidth={3} />}
    </span>
  )
}
