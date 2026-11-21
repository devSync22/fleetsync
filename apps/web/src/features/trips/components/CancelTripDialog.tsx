import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAction } from '@/hooks/useAction'
import { formatLKR } from '@/lib/utils'
import { cancelTrip } from '../services/tripsApi'
import type { TripCancellation, TripDetail } from '../types'

type CancelTripDialogProps = {
  trip: TripDetail
  open: boolean
  onClose: () => void
  onCancelled: (cancellation: TripCancellation) => void
}

function listOf(items: string[]) {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function consequences(trip: TripDetail) {
  const freed = listOf([trip.vehicle?.plate, trip.driver?.name, trip.mechanic?.name].filter((x): x is string => Boolean(x)))
  const refund = trip.quotedFare ? ` The customer is refunded ${formatLKR(trip.quotedFare)} in full.` : ''
  if (trip.status === 'assigned') {
    return `This trip is Assigned and has not started. Cancelling it frees ${freed} for other trips.${refund} This cannot be undone.`
  }
  const driver = trip.driver?.name ?? 'The driver'
  return `This trip is In progress, but ${driver} has not picked up the cargo yet. ${driver} gets a notification to stop, and ${freed} are freed for other trips.${refund} This can’t be undone.`
}

/** Style Guide dialog: asks for a reason, then cancels the trip (only before pickup). */
export function CancelTripDialog({ trip, open, onClose, onCancelled }: CancelTripDialogProps) {
  const [reason, setReason] = useState('')
  const { run, pending, error } = useAction(cancelTrip)

  async function confirm() {
    const cancellation = await run(trip.tripId, reason)
    if (cancellation) onCancelled(cancellation)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent>
        <div className="flex gap-3.5 px-6 pt-6 pb-2">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
            <TriangleAlert className="size-[18px]" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <DialogTitle>Cancel trip {trip.tripId}?</DialogTitle>
            <DialogDescription>{consequences(trip)}</DialogDescription>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-6 pt-4 pb-5">
          <label htmlFor="cancel-reason" className="text-[13px] font-medium">
            Reason for cancelling <span className="text-danger">*</span>
          </label>
          <Textarea
            id="cancel-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Why is this trip being cancelled? The driver, mechanic and customer see this."
            className="h-[120px]"
            required
            autoFocus
          />
          {error && <Banner tone="danger" title="Couldn’t cancel the trip" message={error.message} className="mt-2" />}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" className="text-brand hover:text-brand" onClick={onClose} disabled={pending}>
            Keep trip
          </Button>
          <Button type="button" variant="destructive" onClick={confirm} disabled={!reason.trim() || pending}>
            {pending ? 'Cancelling…' : 'Cancel trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
