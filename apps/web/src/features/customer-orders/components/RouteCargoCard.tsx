import { MapPin } from 'lucide-react'
import { SectionCard } from '@/components/shared/SectionCard'
import type { OrderCargo, OrderStop } from '../types'

const kg = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })

function Stop({ label, stop }: { label: string; stop: OrderStop }) {
  return (
    <div className="flex min-w-[220px] flex-1 items-start gap-2.5">
      <MapPin className="size-[18px] shrink-0 text-brand" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm leading-5 font-medium">{stop.address}</p>
        <p className="text-xs text-muted-foreground">
          {stop.when} · {stop.contact}
        </p>
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

type RouteCargoCardProps = { pickup: OrderStop; destination: OrderStop; cargo: OrderCargo }

/** Pickup and destination with their contacts, then what is carried and how to handle it. */
export function RouteCargoCard({ pickup, destination, cargo }: RouteCargoCardProps) {
  return (
    <SectionCard title="Route and cargo">
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <div className="flex flex-wrap gap-6">
          <Stop label="Pickup" stop={pickup} />
          <Stop label="Destination" stop={destination} />
        </div>
        <hr className="border-border" />
        <dl className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <Fact label="Cargo" value={cargo.type} />
          <Fact label="Weight" value={`${kg.format(cargo.weightKg)} kg`} />
          <Fact label={cargo.unitsLabel} value={String(cargo.unitsCount)} />
          <Fact label="Handling" value={cargo.handling} />
        </dl>
      </div>
    </SectionCard>
  )
}
