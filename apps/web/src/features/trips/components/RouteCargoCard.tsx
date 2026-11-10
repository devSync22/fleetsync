import { MapPin } from 'lucide-react'
import { SectionCard } from '@/components/shared/SectionCard'
import { cn } from '@/lib/utils'
import type { TripDetail } from '../types'

function Stop({ label, place, note, accent }: { label: string; place: string; note: string | null; accent?: boolean }) {
  return (
    <div className="flex min-w-[220px] flex-1 items-start gap-2.5">
      <MapPin className={cn('size-[18px] shrink-0', accent ? 'text-brand' : 'text-muted-foreground')} aria-hidden />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm leading-5 font-medium">{place}</p>
        {note && <p className="text-xs text-muted-foreground">{note}</p>}
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex min-w-[110px] flex-1 flex-col gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? '—'}</p>
    </div>
  )
}

export function RouteCargoCard({ trip }: { trip: TripDetail }) {
  return (
    <SectionCard title="Route and cargo">
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <div className="flex flex-wrap gap-6">
          <Stop label="Pickup" place={trip.pickup.place} note={trip.pickup.note} />
          <Stop label="Destination" place={trip.destination.place} note={trip.destination.note} accent />
        </div>
        <div className="h-px bg-border" />
        <div className="flex flex-wrap gap-6">
          <Fact label="Cargo" value={trip.cargo} />
          <Fact label="Weight" value={trip.weight} />
          <Fact label="Distance" value={trip.distance} />
          <Fact label="Trip window" value={trip.tripWindow} />
        </div>
      </div>
    </SectionCard>
  )
}
