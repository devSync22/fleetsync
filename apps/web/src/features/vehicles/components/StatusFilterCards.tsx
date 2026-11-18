import { cn } from '@/lib/utils'
import { statusFilters } from '../vehicleLabels'
import type { VehiclesPage, VehicleStatus } from '../types'

type StatusFilterCardsProps = {
  counts: VehiclesPage['statusCounts'] | null
  active: VehicleStatus | 'all'
  onChange: (status: VehicleStatus | 'all') => void
}

/** The count cards above the Vehicles table; they double as the status filter (selected = accent border). */
export function StatusFilterCards({ counts, active, onChange }: StatusFilterCardsProps) {
  return (
    <div role="group" aria-label="Filter by status" className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {statusFilters.map((filter) => {
        const selected = filter.id === active
        return (
          <button
            key={filter.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(filter.id)}
            className={cn(
              'flex flex-col items-start gap-1.5 rounded-xl border bg-card px-4 py-3.5 text-left transition-colors hover:bg-secondary/50',
              selected && 'border-2 border-brand px-[15px] py-[13px]',
            )}
          >
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {filter.dot && <span className={cn('size-2 rounded-sm', filter.dot)} aria-hidden />}
              {filter.label}
            </span>
            <span className="text-xl leading-7 font-semibold">{counts ? counts[filter.id] : '–'}</span>
          </button>
        )
      })}
    </div>
  )
}
