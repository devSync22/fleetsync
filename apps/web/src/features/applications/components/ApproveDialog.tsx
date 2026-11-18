import { useState } from 'react'
import { X } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { OptionCard } from '@/components/shared/OptionCard'
import { SelectField } from '@/components/shared/SelectField'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { requestedRoleLabels } from '../labels'
import { approveApplication } from '../services/applicationsApi'
import type { ApplicationDetail, ApprovalOptions, LicenceDetails, RequestedRole } from '../types'

/** Staff get a company address ("tharindu.w@fms.lk"); companies keep the email they applied with. */
function suggestedWorkEmail(application: ApplicationDetail) {
  if (application.type === 'company') return application.email
  const [first, ...rest] = application.name.toLowerCase().split(' ')
  const lastInitial = rest.at(-1)?.[0] ?? ''
  return `${first}${lastInitial ? `.${lastInitial}` : ''}@fms.lk`
}

/** "Driver ID", "Customer ID"… the label of the generated account number. */
const accountIdLabel = (role: RequestedRole) => (role === 'coordinator' ? 'Employee ID' : `${requestedRoleLabels[role]} ID`)

type ApproveDialogProps = {
  application: ApplicationDetail
  options: ApprovalOptions
  /** Licence details entered on the page (drivers only). */
  licence: LicenceDetails | null
  onClose: () => void
  onApproved: (application: ApplicationDetail) => void
}

/**
 * "Approve & create account" (90:1892). Warns about unchecked documents, then provisions the account
 * with the chosen role, depot and sign-in setup.
 */
export function ApproveDialog({ application, options, licence, onClose, onApproved }: ApproveDialogProps) {
  const isCompany = application.type === 'company'
  const [workEmail, setWorkEmail] = useState(() => suggestedWorkEmail(application))
  const [role, setRole] = useState<RequestedRole>(application.requestedRole)
  const [depot, setDepot] = useState(options.depots[0] ?? '')
  const [signIn, setSignIn] = useState<'setup-link' | 'temporary-password'>('setup-link')
  const [sendWelcome, setSendWelcome] = useState(true)
  const { run, pending, error } = useAction(approveApplication)

  const unchecked = application.documents.filter((d) => d.status === 'not-checked')
  const appLink = role === 'driver' || role === 'mechanic' ? `the ${requestedRoleLabels[role].toLowerCase()} app download link` : 'a link to sign in'
  const emailValid = /^\S+@\S+\.\S+$/.test(workEmail.trim())
  const roleOptions = (isCompany ? (['customer'] as RequestedRole[]) : (['driver', 'mechanic', 'coordinator'] as RequestedRole[])).map((r) => ({
    value: r,
    label: requestedRoleLabels[r],
  }))

  async function confirm() {
    const approved = await run(application.applicationId, {
      workEmail: workEmail.trim(),
      role,
      depot: isCompany ? null : depot,
      signIn,
      sendWelcomeEmail: sendWelcome,
      licence: role === 'driver' ? licence : null,
    })
    if (approved) onApproved(approved)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-[540px]">
        <div className="flex items-start justify-between gap-4 border-b px-6 pt-6 pb-4">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">Approve and create account</DialogTitle>
            <DialogDescription>
              {application.name} · <span className="font-mono">{application.applicationId}</span>
            </DialogDescription>
          </div>
          <DialogClose aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <X className="size-5" aria-hidden />
          </DialogClose>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-6 py-5">
          {unchecked.length > 0 && (
            <Banner
              tone="pending"
              title={unchecked.length === 1 ? 'One document not checked' : `${unchecked.length} documents not checked`}
              message={`${unchecked.map((d) => d.name.replace(/\.pdf$/i, '')).join(', ')} ${unchecked.length === 1 ? 'hasn’t' : 'haven’t'} been checked yet. You can still approve and verify later.`}
            />
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label={isCompany ? 'Sign-in email' : 'Work email'}
              type="email"
              value={workEmail}
              onChange={(e) => setWorkEmail(e.target.value)}
              invalid={!emailValid}
              helperText={emailValid ? 'Used to sign in' : 'Enter a valid email address'}
            />
            <TextField label={accountIdLabel(role)} monospace value={options.accountId} readOnly helperText="Generated automatically" />
          </div>

          <SelectField label="Role" options={roleOptions} value={role} onChange={(e) => setRole(e.target.value as RequestedRole)} />
          {!isCompany && (
            <SelectField label="Depot" options={options.depots.map((d) => ({ value: d, label: d }))} value={depot} onChange={(e) => setDepot(e.target.value)} />
          )}

          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-[13px] font-medium">How should they set up sign-in?</legend>
            <OptionCard
              name="approve-sign-in"
              value="setup-link"
              checked={signIn === 'setup-link'}
              onSelect={() => setSignIn('setup-link')}
              title="Email a setup link (recommended)"
              description="They choose their own password · link expires in 48 hours"
            />
            <OptionCard
              name="approve-sign-in"
              value="temporary-password"
              checked={signIn === 'temporary-password'}
              onSelect={() => setSignIn('temporary-password')}
              title="Create a temporary password"
              description="Share it in person · they must change it at first sign-in"
            />
          </fieldset>

          <label className="flex items-center gap-2.5 text-[13px]">
            <Checkbox checked={sendWelcome} onCheckedChange={(checked) => setSendWelcome(checked === true)} />
            Send a welcome email with {appLink}
          </label>

          {error && <Banner tone="danger" title="Couldn’t approve the application" message={error.message} />}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={confirm} disabled={pending || !emailValid}>
            {pending ? 'Creating account…' : 'Approve & create account'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
