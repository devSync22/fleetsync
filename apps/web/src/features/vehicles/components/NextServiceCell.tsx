import { StatusBadge } from '@/components/shared/StatusBadge'
import { DUE_SOON_KM } from '../vehicleLabels'
import type { NextService } from '../types'

const km = (value: number) => `${value.toLocaleString('en-LK')} km`

/** "in 1,200 km", "in 300 km · Due soon", "2,350 km overdue · Overdue" or "In workshop now". */
export function NextServiceCell({ next }: { next: NextService }) {
  if (next.kind === 'in-workshop') return <span className="whitespace-nowrap">In workshop now</span>
  if (next.kind === 'overdue') {
    return (
      <div className="flex flex-col items-start gap-1 whitespace-nowrap">
        <span>{km(next.km)} overdue</span>
        <StatusBadge status="overdue" />
      </div>
    )
  }
  return (
    <div className="flex flex-col items-start gap-1 whitespace-nowrap">
      <span>in {km(next.km)}</span>
      {next.km <= DUE_SOON_KM && <StatusBadge status="due-soon" />}
    </div>
  )
}
