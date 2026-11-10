import { Bell, Check, Circle, X } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/services/apiClient'
import type { DriverCandidate, MechanicCandidate, ReadyOrder, VehicleCandidate } from '../types'
import { KeyValueRow } from './KeyValueRow'

type TripSummaryCardProps = {
  tripId: string
  order: ReadyOrder
  vehicle: VehicleCandidate | null
  driver: DriverCandidate | null
  mechanic: MechanicCandidate | null
  pending: boolean
  error: ApiError | null
  onCreate: () => void
  onCancel: () => void
}

type CheckState = 'ok' | 'fail' | 'todo'

function CheckLine({ state, children }: { state: CheckState; children: string }) {
  const Icon = state === 'ok' ? Check : state === 'fail' ? X : Circle
  return (
    <li className="flex items-center gap-2 text-[13px]">
      <Icon
        className={state === 'ok' ? 'size-4 text-success' : state === 'fail' ? 'size-4 text-danger' : 'size-4 text-faint'}
        aria-hidden
      />
      <span className={state === 'todo' ? 'text-muted-foreground' : state === 'fail' ? 'text-danger' : undefined}>
        {children}
      </span>
    </li>
  )
}

const firstName = (name: string) => name.split(' ')[0]

/** Right-hand "Trip summary" on Create trip, with the checks that must pass before creating. */
export function TripSummaryCard({ tripId, order, vehicle, driver, mechanic, pending, error, onCreate, onCancel }: TripSummaryCardProps) {
  const hours = order.tripWindow.split(' · ')[1] ?? order.tripWindow
  const capacity: CheckState = !vehicle ? 'todo' : vehicle.capacityTonnes >= order.weightTonnes ? 'ok' : 'fail'
  const allChosen = Boolean(vehicle && driver && mechanic)

  return (
    <SectionCard title="Trip summary" subtitle="Check before creating the trip">
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <dl className="flex flex-col gap-3.5">
          <KeyValueRow label="Trip ID" mono>{tripId}</KeyValueRow>
          <KeyValueRow label="Order" mono>{order.orderId}</KeyValueRow>
          <KeyValueRow label="Vehicle" mono={Boolean(vehicle)}>{vehicle?.plate ?? <span className="text-faint">Not chosen</span>}</KeyValueRow>
          <KeyValueRow label="Driver">{driver?.name ?? <span className="text-faint">Not chosen</span>}</KeyValueRow>
          <KeyValueRow label="Mechanic">{mechanic?.name ?? <span className="text-faint">Not chosen</span>}</KeyValueRow>
          <KeyValueRow label="Trip window">{order.tripWindow.replace(' · ', ', ')}</KeyValueRow>
          <KeyValueRow label="Distance">{order.distanceKm} km</KeyValueRow>
        </dl>
        <div className="h-px bg-border" />
        <ul className="flex flex-col gap-2">
          <CheckLine state={capacity}>
            {capacity === 'fail' ? `Vehicle capacity is below ${order.weightTonnes} t` : `Vehicle capacity covers ${order.weightTonnes} t`}
          </CheckLine>
          <CheckLine state={allChosen ? 'ok' : 'todo'}>{`Vehicle, driver and mechanic are free ${hours}`}</CheckLine>
          <CheckLine state="ok">Payment received</CheckLine>
        </ul>
        <p className="flex items-start gap-2.5 rounded-lg bg-info-soft px-3 py-2.5 text-xs leading-[18px] text-info">
          <Bell className="mt-px size-4 shrink-0" aria-hidden />
          {driver && mechanic
            ? `${firstName(driver.name)} and ${firstName(mechanic.name)} get a push notification with the trip details as soon as you create it.`
            : 'The driver and mechanic get a push notification with the trip details as soon as you create it.'}
        </p>
        {error && <Banner tone="danger" title="Couldn’t create the trip" message={error.message} />}
        <div className="flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={onCreate} disabled={!allChosen || capacity === 'fail' || pending}>
            {pending ? 'Creating trip…' : 'Assign & create trip'}
          </Button>
          <Button type="button" variant="ghost" className="w-full text-brand hover:text-brand" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </SectionCard>
  )
}
