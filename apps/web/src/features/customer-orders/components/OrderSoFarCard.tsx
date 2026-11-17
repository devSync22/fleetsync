import type { ReactNode } from 'react'
import { MapPin, Package, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cargoSummary, deliverByText, pickupWhenShort } from '../newOrderFormat'
import type { NewOrderDraft, NewOrderStep } from '../types'

function Row({ icon: Icon, iconClass, label, value, empty, sub }: {
  icon: LucideIcon
  iconClass: string
  label: string
  value: string
  /** Shown in faint text while `value` is empty. */
  empty: string
  sub?: ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} aria-hidden />
      <div className="flex min-w-0 flex-col gap-px">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-sm', value ? 'font-medium' : 'text-faint')}>{value || empty}</p>
        {value && sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

/** "Your order so far": updates as the customer types on steps 1 and 2. */
export function OrderSoFarCard({ draft, step }: { draft: NewOrderDraft; step: NewOrderStep }) {
  const { pickup, destination, cargo } = draft
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border bg-card" aria-live="polite">
      <h2 className="border-b px-5 py-3.5 text-[15px] font-semibold">Your order so far</h2>
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <Row icon={MapPin} iconClass="text-brand" label="Pickup" value={pickup.city} empty="Not set yet" sub={pickupWhenShort(pickup)} />
        <Row
          icon={MapPin}
          iconClass="text-brand"
          label="Destination"
          value={destination.city}
          empty="Not set yet"
          sub={deliverByText(destination, pickup.date, false)}
        />
        <Row
          icon={Package}
          iconClass="text-muted-foreground"
          label="Cargo"
          value={cargoSummary(cargo)}
          empty={step === 1 ? 'Added in step 2' : 'Not set yet'}
        />
      </div>
    </section>
  )
}
