import { useState } from 'react'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useAction } from '@/hooks/useAction'
import { saveInternalNote } from '../services/applicationsApi'
import type { ApplicationDetail } from '../types'

/** "Internal note": free text other administrators see; the applicant never does. */
export function InternalNoteCard({ application, onUpdated }: { application: ApplicationDetail; onUpdated: (a: ApplicationDetail) => void }) {
  const [note, setNote] = useState(application.internalNote)
  const { run, pending, error } = useAction(saveInternalNote)
  const dirty = note !== application.internalNote

  async function save() {
    const updated = await run(application.applicationId, note)
    if (updated) onUpdated(updated)
  }

  return (
    <SectionCard title="Internal note" subtitle="Only admins can see this">
      <div className="flex flex-col gap-2 px-5 py-4">
        <Textarea
          aria-label="Internal note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note for other admins…"
          className="h-20"
        />
        {error && <p className="text-xs text-danger">{error.message}</p>}
        {dirty && (
          <div className="flex justify-end">
            <Button type="button" size="sm" onClick={save} disabled={pending}>
              {pending ? 'Saving…' : 'Save note'}
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
