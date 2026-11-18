import { useState } from 'react'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAction } from '@/hooks/useAction'
import { rejectChangeRequest } from '../services/changeApprovalsApi'
import type { ChangeRequest } from '../types'

type RejectChangeDialogProps = {
  request: ChangeRequest
  onClose: () => void
  onRejected: (request: ChangeRequest) => void
}

/** Rejecting a change needs a reason; the user sees it with their request. */
export function RejectChangeDialog({ request, onClose, onRejected }: RejectChangeDialogProps) {
  const [reason, setReason] = useState('')
  const { run, pending, error } = useAction(rejectChangeRequest)

  async function confirm() {
    const updated = await run(request.requestId, reason)
    if (updated) onRejected(updated)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent>
        <div className="flex flex-col gap-1 px-6 pt-6">
          <DialogTitle>Reject this change?</DialogTitle>
          <DialogDescription>
            {request.userName} · <span className="font-mono">{request.requestId}</span>. Their profile stays as it is.
          </DialogDescription>
        </div>
        <div className="flex flex-col gap-2 px-6 py-5">
          <Label htmlFor="reject-change-reason">
            Reason <span className="text-danger">*</span>
          </Label>
          <Textarea
            id="reject-change-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The document doesn’t show the new expiry date. Please upload a clear copy."
            className="h-24"
            autoFocus
          />
          <InfoNote>The user is told the reason by email. The decision is recorded in the audit log.</InfoNote>
          {error && <Banner tone="danger" title="Couldn’t reject the change" message={error.message} />}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-danger text-white hover:bg-danger/90" onClick={confirm} disabled={pending || !reason.trim()}>
            {pending ? 'Rejecting…' : 'Reject change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
