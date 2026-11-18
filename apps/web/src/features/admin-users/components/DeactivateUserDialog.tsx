import { useState } from 'react'
import { Ban, Bell, Lock, RotateCw } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { SelectField } from '@/components/shared/SelectField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { roleInfo } from '../roles'
import { setUserActive } from '../services/adminUsersApi'
import type { UserAccount } from '../types'

const reasons = ['Left the company', 'On long-term leave', 'Account compromised', 'Duplicate account', 'Other'].map((r) => ({
  value: r,
  label: r,
}))

type DeactivateUserDialogProps = {
  user: UserAccount
  onClose: () => void
  onDeactivated: (user: UserAccount) => void
}

/**
 * "Deactivate account" confirmation (106:3155). Deactivating ends the user's sessions and stops sign-in,
 * but keeps their history; the account can be reactivated later.
 */
export function DeactivateUserDialog({ user, onClose, onDeactivated }: DeactivateUserDialogProps) {
  const [reason, setReason] = useState(reasons[0].value)
  const { run, pending, error } = useAction(setUserActive)
  // The frames use "He / His"; we don't know pronouns, so the copy uses the name / "their".
  const firstName = user.isCompany ? user.name : user.name.split(' ')[0]

  async function confirm() {
    const updated = await run(user.userId, false, reason)
    if (updated) onDeactivated(updated)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent>
        <div className="flex flex-col gap-1 px-6 pt-6">
          <span className="mb-2 flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
            <Ban className="size-5" aria-hidden />
          </span>
          <DialogTitle className="text-xl">Deactivate {user.name}’s account?</DialogTitle>
          <DialogDescription>
            {roleInfo[user.role].label} · {user.email}
          </DialogDescription>
        </div>

        <ul className="flex flex-col gap-2.5 px-6 pt-4 text-[13px] leading-5">
          <li className="flex gap-2.5">
            <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            {firstName} can no longer sign in, and any open sessions end now.
          </li>
          <li className="flex gap-2.5">
            <RotateCw className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            Their history, trips and records are kept. You can reactivate the account later.
          </li>
          <li className="flex gap-2.5">
            <Bell className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            {firstName} will be told by email that the account was deactivated.
          </li>
        </ul>

        <div className="flex flex-col gap-3 px-6 pt-5 pb-5">
          <SelectField label="Reason" options={reasons} value={reason} onChange={(event) => setReason(event.target.value)} />
          <InfoNote>Recorded in the audit log.</InfoNote>
          {error && <Banner tone="danger" title="Couldn’t deactivate the account" message={error.message} />}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-danger text-white hover:bg-danger/90" onClick={confirm} disabled={pending}>
            {pending ? 'Deactivating…' : 'Deactivate account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
