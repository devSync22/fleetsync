import { useState } from 'react'
import { X } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { SelectField } from '@/components/shared/SelectField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAction } from '@/hooks/useAction'
import { rejectApplication } from '../services/applicationsApi'
import type { ApplicationDetail } from '../types'

/** Reasons and the polite message each one starts the applicant email with (editable). */
const reasons: { value: string; message: string }[] = [
  {
    value: 'Documents incomplete or unclear',
    message: 'Thank you for applying. We could not verify your medical certificate. Please apply again with a certificate issued within the last 6 months.',
  },
  { value: 'Licence expired', message: 'Thank you for applying. Your driving licence has expired. Please apply again once it has been renewed.' },
  { value: 'Licence photos unreadable', message: 'Thank you for applying. We could not read your licence photos. Please apply again with clear photos of the front and back.' },
  { value: 'Registration not valid', message: 'Thank you for applying. We could not verify your business registration number. Please check it and apply again.' },
  { value: 'Contact not verified', message: 'Thank you for applying. We could not verify your contact details. Please apply again with a working email and mobile number.' },
  { value: 'Duplicate account', message: 'Thank you for applying. An account already exists for these details. Please sign in or reset your password instead.' },
]

type RejectDialogProps = {
  application: ApplicationDetail
  onClose: () => void
  onRejected: (application: ApplicationDetail) => void
}

/** "Reject application" (90:2149): reason, message emailed to the applicant, and whether they may reapply. */
export function RejectDialog({ application, onClose, onRejected }: RejectDialogProps) {
  const [reason, setReason] = useState(reasons[0].value)
  const [message, setMessage] = useState(reasons[0].message)
  const [allowReapply, setAllowReapply] = useState(true)
  const { run, pending, error } = useAction(rejectApplication)

  function pickReason(value: string) {
    // Swap the template only if the admin hasn't edited the previous one.
    const previous = reasons.find((r) => r.value === reason)
    if (previous && message === previous.message) setMessage(reasons.find((r) => r.value === value)?.message ?? '')
    setReason(value)
  }

  async function confirm() {
    const rejected = await run(application.applicationId, { reason, message: message.trim(), allowReapply })
    if (rejected) onRejected(rejected)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-[540px]">
        <div className="flex items-start justify-between gap-4 border-b px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">Reject application</DialogTitle>
            <DialogDescription>
              {application.name} · <span className="font-mono">{application.applicationId}</span>
            </DialogDescription>
          </div>
          <DialogClose aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <X className="size-5" aria-hidden />
          </DialogClose>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <SelectField label="Reason" options={reasons.map((r) => ({ value: r.value, label: r.value }))} value={reason} onChange={(e) => pickReason(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reject-message">Message to applicant</Label>
            <Textarea id="reject-message" value={message} onChange={(e) => setMessage(e.target.value)} className="h-20" />
            <p className="text-xs text-muted-foreground">Sent by email. Keep it polite and say what to fix.</p>
          </div>
          <label className="flex items-center gap-2.5 text-[13px]">
            <Checkbox checked={allowReapply} onCheckedChange={(checked) => setAllowReapply(checked === true)} />
            Allow this person to apply again
          </label>
          <InfoNote>No account will be created. The decision is recorded in the audit log.</InfoNote>
          {error && <Banner tone="danger" title="Couldn’t reject the application" message={error.message} />}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-danger text-white hover:bg-danger/90" onClick={confirm} disabled={pending || !message.trim()}>
            {pending ? 'Rejecting…' : 'Reject application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
