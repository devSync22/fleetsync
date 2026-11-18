import { useState } from 'react'
import { File } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { verifyDocument } from '../services/applicationsApi'
import type { ApplicationDetail, ApplicationDocument } from '../types'

type DocumentsCardProps = {
  application: ApplicationDetail
  onUpdated: (application: ApplicationDetail) => void
}

/**
 * "Documents": every uploaded file with its check status. "View" opens the file; documents that
 * still need a manual check can be marked as checked from there.
 */
export function DocumentsCard({ application, onUpdated }: DocumentsCardProps) {
  const [open, setOpen] = useState<ApplicationDocument | null>(null)
  const verify = useAction(verifyDocument)
  const decided = application.status !== 'pending-review'
  const photosNote = application.licencePhotos.length > 0 ? ' · licence photos are shown above' : ''

  async function markChecked(doc: ApplicationDocument) {
    const updated = await verify.run(application.applicationId, doc.name)
    if (updated) {
      onUpdated(updated)
      setOpen(null)
    }
  }

  return (
    <SectionCard
      title="Documents"
      subtitle={`${application.documentsUploaded} of ${application.documentsRequired} uploaded${photosNote}`}
    >
      <ul className="flex flex-col gap-2.5 px-5 py-4">
        {application.documents.map((doc) => (
          <li key={doc.name} className="flex items-center gap-3 rounded-[10px] border px-3 py-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <File className="size-4" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-medium">{doc.name}</span>
              <span className="text-xs text-muted-foreground">{doc.meta}</span>
            </div>
            {doc.status === 'verified' ? <StatusBadge tone="success">Verified</StatusBadge> : <StatusBadge tone="pending">Not checked</StatusBadge>}
            <Button type="button" variant="outline" size="sm" onClick={() => setOpen(doc)}>
              View
            </Button>
          </li>
        ))}
        {application.documentsUploaded < application.documentsRequired && (
          <li>
            <Banner
              tone="pending"
              title="Documents missing"
              message={`${application.documentsRequired - application.documentsUploaded} required document(s) have not been uploaded yet.`}
            />
          </li>
        )}
      </ul>

      <Dialog open={!!open} onOpenChange={(next) => !next && setOpen(null)}>
        {open && (
          <DialogContent>
            <div className="flex flex-col gap-1 px-6 pt-6">
              <DialogTitle>{open.name}</DialogTitle>
              <DialogDescription>
                {open.meta} · uploaded by {application.name}
              </DialogDescription>
            </div>
            {/* TODO: show the file from document storage once uploads are stored; mock data has no file. */}
            <div className="mx-6 my-5 flex h-48 items-center justify-center rounded-[10px] bg-secondary text-[13px] text-muted-foreground">
              File preview is not available yet
            </div>
            {verify.error && <Banner tone="danger" title="Couldn’t update the document" message={verify.error.message} className="mx-6 mb-4" />}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(null)}>
                Close
              </Button>
              {open.status === 'not-checked' && !decided && (
                <Button type="button" onClick={() => markChecked(open)} disabled={verify.pending}>
                  {verify.pending ? 'Saving…' : 'Mark as checked'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </SectionCard>
  )
}
