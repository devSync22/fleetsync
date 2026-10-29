import type { ResourceAvailability } from '../types'
import { DashboardCard } from './DashboardCard'

type AvailabilityCardProps = {
  vehicles: ResourceAvailability
  drivers: ResourceAvailability
}

function AvailabilityMeter({ label, resource }: { label: string; resource: ResourceAvailability }) {
  const percent = resource.total === 0 ? 0 : Math.round((resource.free / resource.total) * 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 text-[13px]">
        <p className="min-w-0 flex-1 font-medium">{label}</p>
        <p className="shrink-0 font-semibold">
          {resource.free} of {resource.total} free
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} free`}
        aria-valuemin={0}
        aria-valuemax={resource.total}
        aria-valuenow={resource.free}
        className="h-2 w-full overflow-hidden rounded-sm bg-secondary"
      >
        <div className="h-full rounded-sm bg-success" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-xs text-muted-foreground">
        {resource.breakdown.map((line) => `${line.label} ${line.count}`).join(' · ')}
      </p>
    </div>
  )
}

export function AvailabilityCard({ vehicles, drivers }: AvailabilityCardProps) {
  return (
    <DashboardCard
      title="Availability today"
      subtitle="Checked before a trip is assigned"
      link={{ label: 'Check availability', to: '/coordinator/availability' }}
    >
      <div className="flex flex-col gap-4 px-5 py-4">
        <AvailabilityMeter label="Vehicles" resource={vehicles} />
        <AvailabilityMeter label="Drivers" resource={drivers} />
      </div>
    </DashboardCard>
  )
}
