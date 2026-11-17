import { Package, ShieldAlert } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { formatNumber, parseNumber } from '../newOrderFormat'
import { cargoTypes, fieldAria, fieldId, handlingOptions, packingOptions, packingTypes } from '../newOrderOptions'
import type { HandlingFlag, NewOrderCargo, NewOrderErrors, PackingType } from '../types'
import { FormCard } from './FormCard'
import { FormField } from './FormField'
import { HandlingOption } from './HandlingOption'
import { SelectInput } from './SelectInput'
import { TextField } from './TextField'

const cargoTypeOptions = cargoTypes.map((type) => ({ id: type, label: type }))

/** "About 8 t. Include pallets and packing." — the tonnes part appears once a weight is typed. */
function weightHelper(cargo: NewOrderCargo) {
  const hint = cargo.packing ? packingTypes[cargo.packing].weightHint : 'Include the packing.'
  const kg = parseNumber(cargo.weightKg)
  return Number.isFinite(kg) && kg > 0 ? `About ${formatNumber(kg / 1000)} t. ${hint}` : hint
}

type CargoStepProps = {
  cargo: NewOrderCargo
  errors: NewOrderErrors
  onChange: <K extends keyof NewOrderCargo>(key: K, value: NewOrderCargo[K]) => void
  onToggleHandling: (flag: HandlingFlag) => void
}

/**
 * Step 2: the Cargo and Handling cards. The quantity and size fields follow the packing type
 * (pallets 155:5503, cartons 388:7900, bags 388:8145, loose items 388:8390).
 */
export function CargoStep({ cargo, errors, onChange, onToggleHandling }: CargoStepProps) {
  const packing = cargo.packing ? packingTypes[cargo.packing] : null
  const typeId = fieldId('cargo.cargoType')
  const packingId = fieldId('cargo.packing')
  const descriptionId = fieldId('cargo.description')
  const noteId = fieldId('cargo.noteForCoordinator')

  return (
    <>
      <FormCard icon={Package} tone="info" title="Cargo" subtitle="What is being transported">
        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={typeId} label="Cargo type" error={errors['cargo.cargoType']}>
              <SelectInput
                id={typeId}
                value={cargo.cargoType}
                onChange={(v) => onChange('cargoType', v)}
                options={cargoTypeOptions}
                placeholder="Choose cargo type"
                {...fieldAria(typeId, { error: errors['cargo.cargoType'] })}
              />
            </FormField>
            <FormField id={packingId} label="Packing" error={errors['cargo.packing']}>
              <SelectInput
                id={packingId}
                value={cargo.packing}
                onChange={(v) => onChange('packing', v as PackingType)}
                options={packingOptions}
                placeholder="Choose packing"
                {...fieldAria(packingId, { error: errors['cargo.packing'] })}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              field="cargo.weightKg"
              label="Total weight"
              inputMode="decimal"
              suffix="kg"
              value={cargo.weightKg}
              onChange={(v) => onChange('weightKg', v)}
              error={errors['cargo.weightKg']}
              helper={weightHelper(cargo)}
              placeholder="8,000"
            />
            <TextField
              field="cargo.quantity"
              label={packing?.quantityLabel ?? 'Quantity'}
              inputMode="numeric"
              value={cargo.quantity}
              onChange={(v) => onChange('quantity', v)}
              error={errors['cargo.quantity']}
              placeholder="16"
            />
            <TextField
              field="cargo.unitSize"
              label={packing?.sizeLabel ?? 'Unit size'}
              value={cargo.unitSize}
              onChange={(v) => onChange('unitSize', v)}
              placeholder={packing?.sizePlaceholder ?? 'Choose packing first'}
            />
          </div>
          <FormField id={descriptionId} label="Description" error={errors['cargo.description']}>
            <Textarea
              id={descriptionId}
              value={cargo.description}
              onChange={(event) => onChange('description', event.target.value)}
              placeholder="What it is and how it is packed, e.g. floor tiles 60 × 60 cm, 64 cartons per pallet."
              className="min-h-[72px] text-sm aria-invalid:border-danger"
              {...fieldAria(descriptionId, { error: errors['cargo.description'] })}
            />
          </FormField>
        </div>
      </FormCard>

      <FormCard icon={ShieldAlert} tone="pending" title="Handling and transport needs" subtitle="Tick everything that applies">
        <div className="flex flex-col gap-4 px-6 py-5">
          <fieldset className="flex flex-wrap gap-2.5">
            <legend className="sr-only">Handling and transport needs</legend>
            {handlingOptions.map((option) => (
              <HandlingOption
                key={option.id}
                label={option.label}
                checked={cargo.handling.includes(option.id)}
                onToggle={() => onToggleHandling(option.id)}
              />
            ))}
          </fieldset>
          <FormField id={noteId} label="Note for the coordinator (optional)" error={errors['cargo.noteForCoordinator']}>
            <Textarea
              id={noteId}
              value={cargo.noteForCoordinator}
              onChange={(event) => onChange('noteForCoordinator', event.target.value)}
              placeholder="Gate times, who to call before arrival…"
              className="min-h-[44px] text-sm aria-invalid:border-danger"
              rows={1}
              {...fieldAria(noteId, { error: errors['cargo.noteForCoordinator'] })}
            />
          </FormField>
        </div>
      </FormCard>
    </>
  )
}
