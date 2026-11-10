import { useState } from 'react'
import { Banner } from '@/components/shared/Banner'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { ApiError } from '@/services/apiClient'
import { cn } from '@/lib/utils'
import { fieldLabels } from '../profileFields'
import type { ProfileDetails, ProfileField } from '../types'
import { FormField } from './FormField'

type PersonalDetailsCardProps = {
  saved: ProfileDetails
  submitting: boolean
  error: ApiError | null
  onSubmit: (changes: Partial<ProfileDetails>, reason: string) => Promise<boolean>
}

const layout: { field: ProfileField; mono?: boolean; wide?: boolean; type?: string }[] = [
  { field: 'fullName' },
  { field: 'workEmail', type: 'email' },
  { field: 'mobile', mono: true, type: 'tel' },
  { field: 'officePhone', mono: true, type: 'tel' },
  { field: 'address', wide: true },
]

/** "Personal details": edits are sent to a Fleet Administrator as change requests, not saved directly. */
export function PersonalDetailsCard({ saved, submitting, error, onSubmit }: PersonalDetailsCardProps) {
  const [draft, setDraft] = useState<ProfileDetails>(saved)
  const [reason, setReason] = useState('')
  const [sent, setSent] = useState(false)

  const changes = Object.fromEntries(
    layout.filter(({ field }) => draft[field].trim() !== saved[field]).map(({ field }) => [field, draft[field].trim()]),
  ) as Partial<ProfileDetails>
  const changedCount = Object.keys(changes).length

  const discard = () => {
    setDraft(saved)
    setReason('')
  }

  const submit = async () => {
    if (await onSubmit(changes, reason)) {
      discard()
      setSent(true)
    }
  }

  return (
    <SectionCard title="Personal details" subtitle="Changes to these details are sent to a Fleet Administrator for approval">
      <form
        className="flex flex-col gap-4 px-6 py-5"
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        {sent && changedCount === 0 && (
          <Banner
            tone="success"
            title="Sent for approval"
            message="A Fleet Administrator will review your change. Your details update once it is approved."
          />
        )}
        {error && <Banner tone="danger" title="Couldn’t send your change" message={error.message} />}

        <div className="grid gap-4 sm:grid-cols-2">
          {layout.map(({ field, mono, wide, type }) => {
            const changed = field in changes
            const id = `profile-${field}`
            return (
              <FormField
                key={field}
                id={id}
                label={fieldLabels[field]}
                helper={changed ? 'Changed — will be sent for approval' : undefined}
                className={cn(wide && 'sm:col-span-2')}
              >
                <Input
                  id={id}
                  type={type}
                  value={draft[field]}
                  aria-describedby={changed ? `${id}-helper` : undefined}
                  onChange={(event) => {
                    setSent(false)
                    setDraft((d) => ({ ...d, [field]: event.target.value }))
                  }}
                  className={cn(mono && 'font-mono', changed && 'border-2 border-brand')}
                />
              </FormField>
            )
          })}
        </div>

        <FormField id="profile-reason" label="Reason for change">
          <Input
            id="profile-reason"
            value={reason}
            placeholder={changedCount ? 'Tell the Fleet Administrator why this changed' : 'Change a detail above first'}
            disabled={changedCount === 0}
            onChange={(event) => setReason(event.target.value)}
            className="border-line"
          />
        </FormField>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={discard} disabled={changedCount === 0 || submitting}>
            Discard
          </Button>
          <Button type="submit" disabled={changedCount === 0 || !reason.trim() || submitting}>
            {submitting ? 'Sending…' : 'Submit for approval'}
          </Button>
        </div>
      </form>
    </SectionCard>
  )
}
