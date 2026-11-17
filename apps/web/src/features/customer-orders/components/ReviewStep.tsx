import type { ReactNode } from 'react'
import { Info, MapPin, Package, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  deliverByText,
  fullAddress,
  handlingText,
  pickupWhenLong,
  quantityText,
  weightText,
} from '../newOrderFormat'
import { packingTypes } from '../newOrderOptions'
import type { NewOrderDraft, NewOrderStep } from '../types'
import { CheckboxMark } from './CheckboxMark'
import { FormCard } from './FormCard'

function EditButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Edit ${label}`}
      className="flex shrink-0 items-center gap-1.5 rounded text-[13px] font-semibold text-brand outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Pencil className="size-3.5" aria-hidden />
      Edit
    </button>
  )
}

function Item({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-0.5', wide && 'sm:col-span-2')}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-5 break-words">{children}</dd>
    </div>
  )
}

const itemsGrid = 'grid gap-x-6 gap-y-4 px-6 py-[18px] sm:grid-cols-2'

type ReviewStepProps = {
  draft: NewOrderDraft
  onEdit: (step: NewOrderStep) => void
  confirmed: boolean
  confirmError: boolean
  onConfirmedChange: (value: boolean) => void
}

/** Step 3 (156:5595): read-only summary with Edit links, the "nothing to pay now" note and the confirm tick. */
export function ReviewStep({ draft, onEdit, confirmed, confirmError, onConfirmedChange }: ReviewStepProps) {
  const { pickup, destination, cargo } = draft
  const packing = cargo.packing ? packingTypes[cargo.packing] : null
  const unitPlural = packing?.unit[1] ?? 'units'
  const amount = [weightText(cargo), quantityText(cargo)].filter(Boolean).join(' · ')
  const size = cargo.unitSize.trim() && packing ? ` ${packing.sizeText(cargo.unitSize.trim())}` : ''

  return (
    <>
      <FormCard icon={MapPin} tone="info" title="Pickup" action={<EditButton label="pickup" onClick={() => onEdit(1)} />}>
        <dl className={itemsGrid}>
          <Item label="Address">{fullAddress(pickup.address, pickup.city)}</Item>
          <Item label="Date and time">{pickupWhenLong(pickup)}</Item>
          <Item label="Contact">
            {pickup.contactName.trim()} · {pickup.contactPhone.trim()}
          </Item>
        </dl>
      </FormCard>

      <FormCard icon={MapPin} tone="accent" title="Destination" action={<EditButton label="destination" onClick={() => onEdit(1)} />}>
        <dl className={itemsGrid}>
          <Item label="Address">{fullAddress(destination.address, destination.city)}</Item>
          <Item label="Deliver by">{deliverByText(destination, pickup.date, true) || 'Any time'}</Item>
          <Item label="Receiver">
            {destination.receiverName.trim()} · {destination.receiverPhone.trim()}
          </Item>
        </dl>
      </FormCard>

      <FormCard icon={Package} tone="pending" title="Cargo and handling" action={<EditButton label="cargo and handling" onClick={() => onEdit(2)} />}>
        <dl className={itemsGrid}>
          <Item label="Cargo">{packing ? `${cargo.cargoType} ${packing.cargoPhrase}` : cargo.cargoType}</Item>
          <Item label={`Weight and ${unitPlural}`}>{amount + size}</Item>
          <Item label="Handling">{handlingText(cargo.handling)}</Item>
          <Item label="Description" wide>
            {cargo.description.trim() || '—'}
          </Item>
          <Item label="Note for the coordinator" wide>
            {cargo.noteForCoordinator.trim() || 'None'}
          </Item>
        </dl>
      </FormCard>

      <p className="flex items-start gap-3 rounded-[10px] bg-info-soft px-4 py-3 text-[13px] leading-5 text-info">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
        Nothing to pay now. After a coordinator reviews your order you get a fare quotation, and you pay only if you accept it.
      </p>

      <div className="flex flex-col gap-1.5">
        <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded text-sm select-none has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50">
          <input
            id="new-order-confirm"
            type="checkbox"
            className="sr-only"
            checked={confirmed}
            onChange={(event) => onConfirmedChange(event.target.checked)}
            aria-invalid={confirmError || undefined}
            aria-describedby={confirmError ? 'new-order-confirm-error' : undefined}
          />
          <CheckboxMark checked={confirmed} className={cn('size-[18px]', confirmError && 'border-danger')} />I confirm
          these details are correct.
        </label>
        {confirmError && (
          <p id="new-order-confirm-error" className="text-xs text-danger">
            Tick the box to confirm before you submit.
          </p>
        )}
      </div>
    </>
  )
}
