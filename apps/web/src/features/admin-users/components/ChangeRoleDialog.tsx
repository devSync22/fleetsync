import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { OptionCard } from '@/components/shared/OptionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useAction } from '@/hooks/useAction'
import { roleInfo, roleOrder } from '../roles'
import { changeUserRole } from '../services/adminUsersApi'
import type { UserAccount, UserRole } from '../types'
import { UserAvatar } from './UserAvatar'

type ChangeRoleDialogProps = {
  user: UserAccount
  onClose: () => void
  onChanged: (user: UserAccount) => void
}

/**
 * "Change role" dialog (59:986). Only Fleet Administrators change roles; the user is emailed and the
 * change is recorded in the audit log. Mount it only while open so the choice resets each time.
 */
export function ChangeRoleDialog({ user, onClose, onChanged }: ChangeRoleDialogProps) {
  const [role, setRole] = useState<UserRole>(user.role)
  const [reason, setReason] = useState('')
  const { run, pending, error } = useAction(changeUserRole)
  const firstName = user.name.split(' ')[0]
  const changed = role !== user.role

  async function confirm() {
    const updated = await run(user.userId, role, reason)
    if (updated) onChanged(updated)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-[560px]">
        <div className="flex items-start justify-between gap-4 border-b px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">Change role</DialogTitle>
            <DialogDescription>Only Fleet Administrators can change a user’s role.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <X className="size-5" aria-hidden />
          </DialogClose>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <UserAvatar name={user.name} isCompany={user.isCompany} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>

          {/* Before → after summary; the new role is accent-coloured once it differs. */}
          <div className="flex items-center gap-4 rounded-[10px] bg-secondary px-4 py-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Current role</span>
              <span className="text-sm font-semibold">{roleInfo[user.role].label}</span>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">New role</span>
              <span className={changed ? 'text-sm font-semibold text-brand' : 'text-sm text-muted-foreground'}>
                {changed ? roleInfo[role].label : 'Pick a role below'}
              </span>
            </div>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-[13px] font-medium">New role</legend>
            {roleOrder.map((option) => (
              <OptionCard
                key={option}
                name="new-role"
                value={option}
                checked={role === option}
                onSelect={(value) => setRole(value as UserRole)}
                title={roleInfo[option].label}
                description={roleInfo[option].description}
                aside={option === user.role ? <StatusBadge tone="neutral">Current</StatusBadge> : undefined}
              />
            ))}
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-reason" className="text-[13px] font-medium">
              Reason for change
            </label>
            <Textarea
              id="role-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Promoted to coordinator from 1 November — recorded in the audit log"
              className="h-16"
            />
          </div>

          <InfoNote>
            {firstName} will be emailed about the change. The new permissions apply at the next sign-in, and the change is
            recorded in the audit log.
          </InfoNote>

          {error && <Banner tone="danger" title="Couldn’t change the role" message={error.message} />}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={!changed || pending}>
            {pending ? 'Changing…' : 'Change role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
