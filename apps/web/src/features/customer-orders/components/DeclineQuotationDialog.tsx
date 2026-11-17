import { useState } from 'react'
import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatLKR } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import { DECLINE_REASON_MAX } from '../quotationStatus'

type DeclineQuotationDialogProps = {
  open: boolean
  orderId: string
  total: number
  pending: boolean
  error: ApiError | null
  onClose: () => void
  /** Resolves to true once declined. */
  onDecline: (reason: string) => Promise<boolean>
}

/** Not in Figma: confirms declining, with an optional reason for the coordinator. */
export function DeclineQuotationDialog({ open, orderId, total, pending, error, onClose, onDecline }: DeclineQuotationDialogProps) {
  const [reason, setReason] = useState('')

  async function decline() {
    if (await onDecline(reason)) {
      setReason('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent>
        <div className="flex flex-col gap-1 px-6 pt-6">
          <DialogTitle>Decline this quotation?</DialogTitle>
          <DialogDescription>
            You won’t pay the {formatLKR(total)} quoted for {orderId}, and no trip is scheduled. The coordinator is told you declined.
          </DialogDescription>
        </div>
        <div className="flex flex-col gap-1.5 px-6 pt-4 pb-5">
          <label htmlFor="decline-reason" className="text-[13px] font-medium">
            Reason (optional)
          </label>
          <Textarea
            id="decline-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={DECLINE_REASON_MAX}
            placeholder="Tell the coordinator why, e.g. the price is above our budget."
            className="h-[110px]"
            aria-describedby="decline-reason-count"
            autoFocus
          />
          <p id="decline-reason-count" className="text-right text-xs text-muted-foreground">
            {reason.length}/{DECLINE_REASON_MAX}
          </p>
          {error && <Banner tone="danger" title="Couldn’t decline the quotation" message={error.message} />}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" className="text-brand hover:text-brand" onClick={onClose} disabled={pending}>
            Keep quotation
          </Button>
          <Button type="button" variant="destructive" onClick={decline} disabled={pending}>
            {pending ? 'Declining…' : 'Decline'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
