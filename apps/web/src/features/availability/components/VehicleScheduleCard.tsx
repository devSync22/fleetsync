import { useState } from 'react'
import { EmptyState } from '@/components/shared/EmptyState'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { Truck } from 'lucide-react'
import { vehicleStatus } from '../schedule'
import type { ScheduledVehicle, TimeWindow, VehicleWindowStatus } from '../types'
import { Timeline, TimelineHours } from './Timeline'

type Filter = 'all' | VehicleWindowStatus
type Capacity = 'any' | '5' | '10'

const PAGE_SIZE = 8

const tabsConfig: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'free', label: 'Free' },
  { id: 'busy', label: 'Busy' },
  { id: 'maintenance', label: 'Maintenance' },
]

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`h-2.5 w-3.5 rounded-[3px] border ${swatch}`} aria-hidden />
      {label}
    </span>
  )
}

type VehicleScheduleCardProps = {
  vehicles: ScheduledVehicle[]
  window: TimeWindow
}

/** "Vehicle schedule": each vehicle's bookings on a 06:00–20:00 timeline, with the window shaded. */
export function VehicleScheduleCard({ vehicles, window }: VehicleScheduleCardProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [capacity, setCapacity] = useState<Capacity>('any')
  const [showAll, setShowAll] = useState(false)

  const byCapacity = vehicles.filter((v) => capacity === 'any' || v.capacityTonnes >= Number(capacity))
  const withStatus = byCapacity.map((v) => ({ vehicle: v, status: vehicleStatus(v, window) }))
  const tabs = tabsConfig.map((t) => ({
    id: t.id,
    label: t.label,
    count: t.id === 'all' ? withStatus.length : withStatus.filter((r) => r.status === t.id).length,
  }))
  const rows = withStatus.filter((r) => filter === 'all' || r.status === filter)
  const visible = showAll ? rows : rows.slice(0, PAGE_SIZE)

  return (
    <SectionCard
      title="Vehicle schedule"
      subtitle="Booked trips and service for the day. The shaded band is your time window."
      action={
        <FilterSelect
          label="Vehicle capacity"
          value={capacity}
          onChange={setCapacity}
          className="w-[170px]"
          options={[
            { id: 'any', label: 'Capacity: any' },
            { id: '5', label: 'Capacity ≥ 5 t' },
            { id: '10', label: 'Capacity ≥ 10 t' },
          ]}
        />
      }
    >
      <div className="px-5 pt-3">
        <StatusTabs label="Vehicle status in window" tabs={tabs} activeId={filter} onChange={setFilter} />
      </div>

      {rows.length === 0 ? (
        <EmptyState bare icon={Truck} title="No vehicles match" description="Try another tab or capacity." />
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="flex items-center gap-4 border-b bg-background px-5 py-2 text-muted-foreground">
              <span className="min-w-0 flex-1 text-xs font-medium">Vehicle</span>
              <TimelineHours />
              <span className="w-[110px] shrink-0 text-xs font-medium">In window</span>
            </div>
            <ul>
              {visible.map(({ vehicle, status }) => (
                <li key={vehicle.plate} className="flex items-center gap-4 border-b px-5 py-2.5">
                  <div className="flex min-w-0 flex-1 flex-col gap-px">
                    <span className="font-mono text-sm font-medium">{vehicle.plate}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {vehicle.model} · {vehicle.capacityTonnes} t
                    </span>
                  </div>
                  <Timeline bookings={vehicle.bookings} window={window} />
                  <div className="w-[110px] shrink-0">
                    <StatusBadge status={status} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 px-5 py-3">
        <Legend swatch="border-brand bg-brand-soft" label="Booked trip" />
        <Legend swatch="border-pending bg-pending-soft" label="Service" />
        <Legend swatch="border-info bg-info-soft" label="Your time window" />
        <span className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
          Showing {visible.length} of {rows.length}
          {rows.length > PAGE_SIZE && (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="font-semibold text-brand hover:underline">
              {showAll ? 'Show fewer' : 'Show all'}
            </button>
          )}
        </span>
      </div>
    </SectionCard>
  )
}
