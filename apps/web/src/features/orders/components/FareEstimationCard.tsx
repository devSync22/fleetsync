import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { InfoNote } from '@/components/shared/InfoNote'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { formatLKR } from '@/lib/utils'
import { distanceLine, totalOf, vehicleClasses } from '../fareRates'
import { saveQuotationDraft, sendQuotation } from '../services/ordersApi'
import type { FareLine, OrderDetail, VehicleClass } from '../types'

const amountFormatter = new Intl.NumberFormat('en-LK')

function AmountInput({ line, onChange }: { line: FareLine; onChange: (amount: number) => void }) {
  return (
    <label className="flex w-[120px] shrink-0 items-center justify-end gap-1.5 rounded-md border border-line px-2.5 py-1.5 focus-within:ring-3 focus-within:ring-ring/50">
      <span className="text-xs text-muted-foreground">LKR</span>
      <input
        inputMode="numeric"
        aria-label={`${line.label} amount in LKR`}
        value={amountFormatter.format(line.amount)}
        onChange={(event) => onChange(Number(event.target.value.replace(/\D/g, '')) || 0)}
        className="w-full min-w-0 bg-transparent text-right font-mono text-[13px] font-medium outline-none"
      />
    </label>
  )
}

/** "Fare estimation": price lines, total, validity and message, then Save draft / Send quotation. */
export function FareEstimationCard({ order }: { order: OrderDetail }) {
  const navigate = useNavigate()
  const { distanceKm } = order.route
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>(order.estimate.vehicleClass)
  const [lines, setLines] = useState<FareLine[]>(() => [distanceLine(distanceKm, order.estimate.vehicleClass), ...order.estimate.lines])
  const [validUntil, setValidUntil] = useState(order.estimate.validUntil)
  const [message, setMessage] = useState(order.estimate.message)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const save = useAction(saveQuotationDraft)
  const send = useAction(sendQuotation)
  const total = totalOf(lines)
  const input = { vehicleClass, lines, validUntil, message }

  function changeVehicle(next: VehicleClass) {
    setVehicleClass(next)
    // The distance charge follows the vehicle's per-km rate.
    setLines((current) => current.map((line) => (line.id === 'distance' ? distanceLine(distanceKm, next) : line)))
  }

  function changeAmount(id: string, amount: number) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, amount } : line)))
  }

  async function saveDraft() {
    const result = await save.run(order.orderId, input)
    if (result) setSavedAt(result.savedAt)
  }

  async function sendIt() {
    const result = await send.run(order.orderId, input)
    if (result) navigate(`/coordinator/orders/${order.orderId}/quotation-sent`, { state: { justSent: true } })
  }

  const error = send.error ?? save.error
  const busy = save.pending || send.pending

  return (
    <SectionCard title="Fare estimation" subtitle="Sent to the customer as a quotation by email">
      <div className="flex flex-col gap-3.5 px-5 py-[18px]">
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium" id="vehicle-type-label">
            Vehicle type needed
          </span>
          <FilterSelect
            label="Vehicle type needed"
            value={vehicleClass}
            onChange={changeVehicle}
            className="w-full"
            options={vehicleClasses.map((v) => ({ id: v.id, label: v.label }))}
          />
        </div>

        <div className="overflow-hidden rounded-[10px] border">
          {lines.map((line) => (
            <div key={line.id} className="flex items-center gap-3 border-b px-3.5 py-2.5">
              <div className="flex min-w-0 flex-1 flex-col gap-px">
                <p className="text-[13px] font-medium">{line.label}</p>
                <p className="text-xs text-muted-foreground">{line.detail}</p>
              </div>
              <AmountInput line={line} onChange={(amount) => changeAmount(line.id, amount)} />
            </div>
          ))}
          <div className="flex items-center bg-background px-3.5 py-3">
            <p className="flex-1 text-sm font-semibold">Total quotation</p>
            <p className="font-mono text-base font-medium">{formatLKR(total)}</p>
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] leading-5 font-medium">Valid until</span>
          <input
            type="datetime-local"
            value={validUntil}
            onChange={(event) => setValidUntil(event.target.value)}
            required
            className="rounded-lg border bg-card px-3 py-2.5 text-sm outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-ring/15"
          />
          <span className="text-xs text-muted-foreground">The quotation expires after this date and time.</span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[13px] font-medium">Message to customer (optional)</span>
          <input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Anything the customer should know about this price"
            className="rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] outline-none placeholder:text-faint focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-ring/15"
          />
        </label>

        {error && <Banner tone="danger" title="Couldn’t save the quotation" message={error.message} />}

        <div className="flex items-center justify-end gap-2">
          {savedAt && !busy && <span className="mr-auto text-xs text-muted-foreground">Draft saved at {savedAt}</span>}
          <Button type="button" variant="outline" onClick={saveDraft} disabled={busy}>
            {save.pending ? 'Saving…' : 'Save draft'}
          </Button>
          <Button type="button" onClick={sendIt} disabled={busy || total <= 0 || !validUntil}>
            {send.pending ? 'Sending…' : 'Send quotation'}
          </Button>
        </div>
        <InfoNote>The customer can accept or decline it from their account.</InfoNote>
      </div>
    </SectionCard>
  )
}
