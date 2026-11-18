import { useState, type FormEvent, type ReactNode } from 'react'
import { Truck } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { KeyValueRow } from '@/components/shared/KeyValueRow'
import { OptionCard } from '@/components/shared/OptionCard'
import { SelectField } from '@/components/shared/SelectField'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/services/apiClient'
import { manualStatuses, vehicleTypeLabel } from '../vehicleLabels'
import type { ManualVehicleStatus, Vehicle, VehicleInput, VehicleType } from '../types'
import { VehicleTypePicker } from './VehicleTypePicker'

type Form = {
  plate: string
  model: string
  year: string
  type: VehicleType
  capacity: string
  capacityUnit: 't' | 'kg'
  odometer: string
  status: ManualVehicleStatus
}

type Errors = Partial<Record<keyof Form, string>>

const THIS_YEAR = new Date().getFullYear()
/** "48,210" → 48210 */
const toNumber = (value: string) => Number(value.replace(/[,\s]/g, ''))

function validate(form: Form): Errors {
  const errors: Errors = {}
  // Sri Lankan plates: province letters, then letters and digits, e.g. "WP CAB-4521", "CP NA-3390".
  if (!/^[A-Z]{2}\s?[A-Z]{1,3}[-\s]?\d{4}$/i.test(form.plate.trim())) errors.plate = 'Enter a plate like WP CAB-4521'
  if (!form.model.trim()) errors.model = 'Enter the make and model'
  const year = toNumber(form.year)
  if (!Number.isInteger(year) || year < 1980 || year > THIS_YEAR + 1) errors.year = `Enter a year between 1980 and ${THIS_YEAR + 1}`
  const capacity = toNumber(form.capacity)
  if (!(capacity > 0)) errors.capacity = 'Enter the load capacity'
  const odometer = toNumber(form.odometer)
  if (!Number.isInteger(odometer) || odometer < 0) errors.odometer = 'Enter the odometer reading in whole km'
  return errors
}

function FormSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card">
      <header className="flex flex-col gap-0.5 border-b px-6 py-4">
        <h2 className="text-base leading-6 font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </header>
      <div className="px-6 py-5">{children}</div>
    </section>
  )
}

type VehicleFormProps = {
  /** The vehicle being edited; omitted when adding. */
  vehicle?: Vehicle
  pending: boolean
  error: ApiError | null
  onSubmit: (input: VehicleInput) => void
}

/**
 * The Add vehicle form (378:7357), also used to edit a vehicle. The summary card on the right
 * previews the vehicle as it will appear in the list.
 */
export function VehicleForm({ vehicle, pending, error, onSubmit }: VehicleFormProps) {
  const editing = !!vehicle
  // A vehicle on (or scheduled for) a trip keeps that status; it is set from trips, not here.
  const tripStatus = vehicle && (vehicle.status === 'on-trip' || vehicle.status === 'trip-scheduled') ? vehicle.status : null
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<Form>(() => ({
    plate: vehicle?.plate ?? '',
    model: vehicle?.model ?? '',
    year: vehicle ? String(vehicle.year) : '',
    type: vehicle?.type ?? 'light-truck',
    capacity: vehicle ? String(vehicle.capacity) : '',
    capacityUnit: vehicle?.capacityUnit ?? 't',
    odometer: vehicle ? vehicle.odometerKm.toLocaleString('en-LK') : '',
    status: tripStatus ? 'available' : ((vehicle?.status as ManualVehicleStatus | undefined) ?? 'available'),
  }))
  const errors = submitted ? validate(form) : {}

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validate(form)).length > 0) return
    onSubmit({
      plate: form.plate,
      model: form.model.trim(),
      year: toNumber(form.year),
      type: form.type,
      capacity: toNumber(form.capacity),
      capacityUnit: form.capacityUnit,
      odometerKm: toNumber(form.odometer),
      status: form.status,
    })
  }

  const odometer = toNumber(form.odometer)

  return (
    <form onSubmit={submit} noValidate className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <FormSection title="Vehicle details">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Registration number"
              monospace
              value={form.plate}
              onChange={(e) => set('plate', e.target.value.toUpperCase())}
              placeholder="WP CAB-9145"
              readOnly={editing}
              invalid={!!errors.plate}
              helperText={errors.plate ?? (editing ? 'The registration number can’t be changed' : 'As on the number plate · must be unique')}
            />
            <VehicleTypePicker value={form.type} onChange={(type) => set('type', type)} />
            <TextField
              label="Model"
              value={form.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder="Isuzu NPR 75"
              invalid={!!errors.model}
              helperText={errors.model}
            />
            <TextField
              label="Year"
              inputMode="numeric"
              monospace
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
              placeholder={String(THIS_YEAR)}
              invalid={!!errors.year}
              helperText={errors.year}
            />
          </div>
        </FormSection>

        <FormSection title="Capacity and odometer" subtitle="Used to match vehicles to orders and to schedule services">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Capacity"
              inputMode="decimal"
              monospace
              value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)}
              placeholder="4.5"
              invalid={!!errors.capacity}
              helperText={errors.capacity}
            />
            <SelectField
              label="Unit"
              options={[
                { value: 't', label: 'Tonnes (t)' },
                { value: 'kg', label: 'Kilograms (kg)' },
              ]}
              value={form.capacityUnit}
              onChange={(e) => set('capacityUnit', e.target.value as 't' | 'kg')}
            />
            <TextField
              className="md:col-span-2"
              label="Current odometer (km)"
              inputMode="numeric"
              monospace
              value={form.odometer}
              onChange={(e) => set('odometer', e.target.value)}
              placeholder="48,210"
              invalid={!!errors.odometer}
              helperText={errors.odometer ?? 'Read from the dashboard. The next service is calculated from this.'}
            />
          </div>
        </FormSection>

        <FormSection title="Operating status" subtitle="Can coordinators assign this vehicle to trips?">
          {tripStatus ? (
            <div className="flex items-center gap-3 text-[13px]">
              <StatusBadge status={tripStatus} />
              This vehicle has a trip, so its status is set from the trip until it finishes.
            </div>
          ) : (
            <fieldset className="grid gap-3 md:grid-cols-2">
              <legend className="sr-only">Operating status</legend>
              {manualStatuses.map((status) => (
                <OptionCard
                  key={status.id}
                  name="vehicle-status"
                  value={status.id}
                  checked={form.status === status.id}
                  onSelect={(value) => set('status', value as ManualVehicleStatus)}
                  title={status.label}
                  description={status.hint}
                />
              ))}
            </fieldset>
          )}
          <InfoNote className="mt-4">“On trip” and “Trip scheduled” are set automatically from trips.</InfoNote>
        </FormSection>

        {error && <Banner tone="danger" title={editing ? 'Couldn’t save the vehicle' : 'Couldn’t add the vehicle'} message={error.message} />}

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/vehicles">Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : editing ? 'Save changes' : 'Add vehicle'}
          </Button>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <FormSection title="Summary">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <Truck className="size-5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-mono text-base font-medium">{form.plate || 'New vehicle'}</span>
              <span className="truncate text-xs text-muted-foreground">
                {[form.model, form.year].filter(Boolean).join(' · ') || 'Model and year'}
              </span>
            </div>
          </div>
          <dl className="flex flex-col gap-3 pt-4">
            <KeyValueRow label="Type">{vehicleTypeLabel(form.type)}</KeyValueRow>
            <KeyValueRow label="Capacity" mono>
              {form.capacity ? `${form.capacity} ${form.capacityUnit}` : '—'}
            </KeyValueRow>
            <KeyValueRow label="Odometer" mono>
              {form.odometer && Number.isFinite(odometer) ? `${odometer.toLocaleString('en-LK')} km` : '—'}
            </KeyValueRow>
            <KeyValueRow label="Status">
              <StatusBadge status={tripStatus ?? form.status} />
            </KeyValueRow>
          </dl>
        </FormSection>

        {!editing && (
          <FormSection title="What happens next">
            <ol className="flex flex-col gap-3 text-[13px] leading-5">
              {[
                'The vehicle appears in the Vehicles list and in Availability.',
                'Coordinators can assign it to trips with a driver and mechanic.',
                'The first service is scheduled from the odometer and the service types.',
              ].map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </FormSection>
        )}
      </div>
    </form>
  )
}
