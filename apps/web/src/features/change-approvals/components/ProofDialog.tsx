import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { markProofChecked } from '../services/changeApprovalsApi'
import type { ChangeRequest } from '../types'

type ProofDialogProps = {
  request: ChangeRequest
  onClose: () => void
  onChecked: (request: ChangeRequest) => void
}

/** Opens the attached proof; confirming marks it as checked so the change can be approved. */
export function ProofDialog({ request, onClose, onChecked }: ProofDialogProps) {
  const { run, pending, error } = useAction(markProofChecked)
  const proof = request.proof!

  async function confirm() {
    const updated = await run(request.requestId)
    if (updated) onChecked(updated)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent>
        <div className="flex flex-col gap-1 px-6 pt-6">
          <DialogTitle>{proof.fileName}</DialogTitle>
          <DialogDescription>
            {proof.meta} · attached by {request.userName}
          </DialogDescription>
        </div>
        {/* TODO: show the file from document storage once uploads are stored. */}
        <div className="mx-6 my-5 flex h-48 items-center justify-center rounded-[10px] bg-secondary text-[13px] text-muted-foreground">
          File preview is not available yet
        </div>
        {error && <Banner tone="danger" title="Couldn’t save" message={error.message} className="mx-6 mb-4" />}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Close
          </Button>
          {request.status === 'pending' && !proof.checked && (
            <Button type="button" onClick={confirm} disabled={pending}>
              {pending ? 'Saving…' : 'Document matches the change'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
