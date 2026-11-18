import { useState, type FormEvent } from 'react'
import { Banner } from '@/components/shared/Banner'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { saveLookupItem } from '../services/referenceDataApi'
import type { LookupItem, LookupListId } from '../types'

type LookupItemDialogProps = {
  list: LookupListId
  /** "cargo type", "depot"… */
  singular: string
  nameLabel: string
  detailLabel: string
  item?: LookupItem
  onClose: () => void
  onSaved: (item: LookupItem) => void
}

/** Add or edit one entry of a simple reference list. */
export function LookupItemDialog({ list, singular, nameLabel, detailLabel, item, onClose, onSaved }: LookupItemDialogProps) {
  const [name, setName] = useState(item?.name ?? '')
  const [detail, setDetail] = useState(item?.detail ?? '')
  const [submitted, setSubmitted] = useState(false)
  const { run, pending, error } = useAction(saveLookupItem)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!name.trim()) return
    const saved = await run(list, { name, detail }, item?.id)
    if (saved) onSaved(saved)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent>
        <form onSubmit={submit} noValidate className="flex flex-col">
          <div className="flex flex-col gap-1 px-6 pt-6">
            <DialogTitle>{item ? `Edit ${item.name}` : `Add ${singular}`}</DialogTitle>
            <DialogDescription>Every change is recorded in the audit log.</DialogDescription>
          </div>
          <div className="flex flex-col gap-4 px-6 py-5">
            <TextField
              label={nameLabel}
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={submitted && !name.trim()}
              helperText={submitted && !name.trim() ? 'Enter a name' : undefined}
              autoFocus
            />
            <TextField label={detailLabel} value={detail} onChange={(e) => setDetail(e.target.value)} />
            {error && <Banner tone="danger" title={`Couldn’t save the ${singular}`} message={error.message} />}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : item ? 'Save changes' : `Add ${singular}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
