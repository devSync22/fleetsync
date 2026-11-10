import { MapPin } from 'lucide-react'
import { SectionCard } from '@/components/shared/SectionCard'
import type { OrderDetail } from '../types'

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs leading-4 text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-5">{value}</dd>
    </div>
  )
}

const factGrid = 'grid gap-x-4 gap-y-3.5 px-5 py-[18px] sm:grid-cols-2'

export function CustomerCard({ order }: { order: OrderDetail }) {
  return (
    <SectionCard title="Customer">
      <dl className={factGrid}>
        <Fact label="Company" value={order.customerName} />
        <Fact label="Contact" value={order.customer.contact} />
        <Fact label="Email" value={order.customer.email} />
        <Fact label="Customer since" value={order.customer.customerSince} />
      </dl>
    </SectionCard>
  )
}

function Stop({ label, place, when, accent }: { label: string; place: string; when: string; accent?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <MapPin className={accent ? 'size-[18px] shrink-0 text-brand' : 'size-[18px] shrink-0 text-muted-foreground'} aria-hidden />
      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{place}</p>
        <p className="text-xs text-muted-foreground">{when}</p>
      </div>
    </div>
  )
}

export function RouteCard({ order }: { order: OrderDetail }) {
  const { route } = order
  return (
    <SectionCard title="Route">
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <div className="flex flex-col gap-2.5">
          <Stop label="Pickup" place={route.pickupPlace} when={route.pickupWhen} />
          <Stop label="Destination" place={route.destinationPlace} when={route.destinationWhen} accent />
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Distance</p>
          <p className="text-sm font-medium">{route.distanceKm ? `${route.distanceKm} km` : '—'}</p>
        </div>
      </div>
    </SectionCard>
  )
}

export function CargoCard({ order }: { order: OrderDetail }) {
  const { cargo } = order
  return (
    <SectionCard title="Cargo">
      <div className="flex flex-col gap-3.5 pb-[18px]">
        <dl className={`${factGrid} pb-0`}>
          <Fact label="Type" value={cargo.type} />
          <Fact label="Weight" value={cargo.weight} />
          <Fact label={cargo.unitsLabel} value={cargo.units} />
          <Fact label="Handling" value={cargo.handling} />
        </dl>
        {cargo.note && (
          <div className="mx-5 flex flex-col gap-1 rounded-lg bg-background px-3 py-2.5">
            <p className="text-xs text-muted-foreground">Note from customer</p>
            <p className="text-[13px] leading-5">{cargo.note}</p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
