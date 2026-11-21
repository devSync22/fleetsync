import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import type { TripDetail } from '../types'

export function TripNotesCard({ note }: { note: TripDetail['note'] }) {
  return (
    <SectionCard
      title="Notes for this trip"
      action={
        // TODO: open the notes editor once the endpoint exists
        <Button type="button" variant="ghost" size="sm" className="text-brand hover:text-brand">
          {note ? 'Edit' : 'Add'}
        </Button>
      }
    >
      <div className="flex flex-col gap-2 px-5 py-[18px]">
        {note ? (
          <>
            <p className="text-[13px] leading-5">{note.text}</p>
            <p className="text-xs text-muted-foreground">{note.addedBy}</p>
          </>
        ) : (
          <p className="text-[13px] text-muted-foreground">No notes for the driver yet.</p>
        )}
      </div>
    </SectionCard>
  )
}
