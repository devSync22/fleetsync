import { useState, type FormEvent } from 'react'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { SelectField } from '@/components/shared/SelectField'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { saveServiceType } from '../services/referenceDataApi'
import type { ServiceType } from '../types'

const appliesToOptions = ['All vehicle types', 'Heavy trucks', 'Light trucks', 'Trucks, vans', 'Vans', 'Refrigerated trucks'].map((v) => ({
  value: v,
  label: v,
}))

/** Empty text = no limit; otherwise a whole positive number. */
function parseLimit(value: string): number | null | 'invalid' {
  const trimmed = value.replace(/[,\s]/g, '')
  if (!trimmed) return null
  const n = Number(trimmed)
  return Number.isInteger(n) && n > 0 ? n : 'invalid'
}

type ServiceTypeDialogProps = {
  /** The type being edited; omitted when adding. */
  serviceType?: ServiceType
  onClose: () => void
  onSaved: (serviceType: ServiceType) => void
}

/** Add or edit a service type. There is no frame for this dialog; it follows the Style Guide dialog. */
export function ServiceTypeDialog({ serviceType, onClose, onSaved }: ServiceTypeDialogProps) {
  const [name, setName] = useState(serviceType?.name ?? '')
  const [note, setNote] = useState(serviceType?.note ?? '')
  const [everyKm, setEveryKm] = useState(serviceType?.everyKm != null ? String(serviceType.everyKm) : '')
  const [everyMonths, setEveryMonths] = useState(serviceType?.everyMonths != null ? String(serviceType.everyMonths) : '')
  const [appliesTo, setAppliesTo] = useState(serviceType?.appliesTo ?? appliesToOptions[0].value)
  const [cost, setCost] = useState(serviceType ? String(serviceType.typicalCost) : '')
  const [submitted, setSubmitted] = useState(false)
  const { run, pending, error } = useAction(saveServiceType)

  const km = parseLimit(everyKm)
  const months = parseLimit(everyMonths)
  const costValue = Number(cost.replace(/[,\s]/g, ''))
  const errors = {
    name: !name.trim() ? 'Enter a name' : undefined,
    km: km === 'invalid' ? 'Whole kilometres, e.g. 5000' : undefined,
    months: months === 'invalid' ? 'Whole months, e.g. 6' : undefined,
    limits: km === null && months === null ? 'Give a distance, a time, or both' : undefined,
    cost: !(costValue >= 0) || cost.trim() === '' ? 'Enter the typical cost in LKR' : undefined,
  }
  const valid = Object.values(errors).every((e) => !e)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!valid || km === 'invalid' || months === 'invalid') return
    const saved = await run(
      { name, note: note.trim(), everyKm: km, everyMonths: months, appliesTo, typicalCost: costValue },
      serviceType?.id,
    )
    if (saved) onSaved(saved)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex min-h-0 flex-col">
          <div className="flex flex-col gap-1 px-6 pt-6">
            <DialogTitle>{serviceType ? `Edit ${serviceType.name}` : 'Add service type'}</DialogTitle>
            <DialogDescription>The service is due at whichever limit comes first.</DialogDescription>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto px-6 py-5">
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} invalid={submitted && !!errors.name} helperText={submitted ? errors.name : undefined} autoFocus />
            <TextField label="Short description" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Pads, discs and fluid" />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Every (km)"
                monospace
                inputMode="numeric"
                value={everyKm}
                onChange={(e) => setEveryKm(e.target.value)}
                placeholder="5,000"
                invalid={submitted && !!(errors.km || errors.limits)}
                helperText={submitted ? (errors.km ?? errors.limits) : 'Leave empty if only time matters'}
              />
              <TextField
                label="Or every (months)"
                monospace
                inputMode="numeric"
                value={everyMonths}
                onChange={(e) => setEveryMonths(e.target.value)}
                placeholder="12"
                invalid={submitted && !!errors.months}
                helperText={submitted ? errors.months : 'Leave empty if only distance matters'}
              />
            </div>
            <SelectField label="Applies to" options={appliesToOptions} value={appliesTo} onChange={(e) => setAppliesTo(e.target.value)} />
            <TextField
              label="Typical cost (LKR)"
              monospace
              inputMode="numeric"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="18,500"
              invalid={submitted && !!errors.cost}
              helperText={submitted ? errors.cost : undefined}
            />
            <InfoNote>Every change is recorded in the audit log.</InfoNote>
            {error && <Banner tone="danger" title="Couldn’t save the service type" message={error.message} />}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : serviceType ? 'Save changes' : 'Add service type'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
