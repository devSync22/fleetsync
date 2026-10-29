import { cn } from '@/lib/utils'

type ListCellProps = {
  primary: string
  secondary: string
  /** JetBrains Mono for IDs and amounts. */
  mono?: boolean
  className?: string
}

/** Two-line cell used in the dashboard's list rows. */
export function ListCell({ primary, secondary, mono = false, className }: ListCellProps) {
  return (
    <div className={cn('flex shrink-0 flex-col gap-[3px] whitespace-nowrap', className)}>
      <p className={cn('text-[13px] leading-[18px] font-medium', mono && 'font-mono')}>{primary}</p>
      <p className="text-xs leading-4 text-muted-foreground">{secondary}</p>
    </div>
  )
}
