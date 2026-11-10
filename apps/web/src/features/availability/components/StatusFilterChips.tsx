import { cn } from '@/lib/utils'
import type { StatusFilter } from '../availabilityFilters'

type StatusFilterChipsProps = {
  options: { id: StatusFilter; label: string; count: number }[]
  active: StatusFilter
  onChange: (status: StatusFilter) => void
}

export function StatusFilterChips({ options, active, onChange }: StatusFilterChipsProps) {
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = option.id === active
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              selected ? 'border-brand bg-brand-soft text-brand' : 'bg-card hover:bg-secondary',
            )}
          >
            {option.label}
            <span className={cn('font-semibold', selected ? 'text-brand' : 'text-muted-foreground')}>{option.count}</span>
          </button>
        )
      })}
    </div>
  )
}
