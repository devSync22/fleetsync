import { useState } from 'react'
import { File, X } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useAction } from '@/hooks/useAction'
import { cn } from '@/lib/utils'
import { estimateExport, exportAuditLog, exportFileName } from '../services/auditLogApi'
import type { ExportFormat, ExportRequest } from '../types'

const formats: { id: ExportFormat; label: string }[] = [
  { id: 'pdf', label: 'PDF' },
  { id: 'excel', label: 'Excel' },
  { id: 'csv', label: 'CSV' },
]

/** yyyy-mm-dd in local time. */
const isoDay = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

type ExportAuditDialogProps = {
  /** Filters set on the page; the export uses the same ones. */
  filters: ExportRequest['filters']
  onClose: () => void
  onExported: (count: number) => void
}

/** "Audit log / Export" (106:2706): date range, format and what to include. */
export function ExportAuditDialog({ filters, onClose, onExported }: ExportAuditDialogProps) {
  const today = new Date()
  const [from, setFrom] = useState(() => isoDay(new Date(today.getFullYear(), today.getMonth(), 1)))
  const [to, setTo] = useState(() => isoDay(today))
  // The frame shows Excel; CSV is the default until the server can build PDF / Excel files.
  const [format, setFormat] = useState<ExportFormat>('csv')
  const [includeChanges, setIncludeChanges] = useState(true)
  const [includeDevice, setIncludeDevice] = useState(false)
  const { run, pending, error } = useAction(exportAuditLog)

  const request: ExportRequest = { from, to, format, includeChanges, includeDevice, filters }
  const estimate = from && to && from <= to ? estimateExport(request) : null
  const chips = [
    filters.user === 'all' ? 'All users' : filters.user,
    filters.module === 'all' ? 'All modules' : filters.module,
    filters.result === 'all' ? 'All results' : filters.result === 'success' ? 'Success only' : 'Failed only',
  ]

  async function submit() {
    const result = await run(request)
    if (result) onExported(result.count)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()}>
      <DialogContent className="max-w-[520px]">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">Export audit report</DialogTitle>
            <DialogDescription>Download the audit log for a date range.</DialogDescription>
          </div>
          <DialogClose aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <X className="size-5" aria-hidden />
          </DialogClose>
        </div>

        <div className="flex min-h-0 flex-col gap-5 overflow-y-auto px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="From" type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} />
            <TextField label="To" type="date" value={to} min={from} max={isoDay(today)} onChange={(e) => setTo(e.target.value)} />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-medium">Filters applied</p>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <span key={chip} className="rounded-md bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                  {chip}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Uses the filters currently set on the audit log.</p>
          </div>

          <div className="flex flex-col gap-2">
            <p id="export-format" className="text-[13px] font-medium">
              Format
            </p>
            {/* Segmented control: one radio group drawn as joined buttons. */}
            <div role="radiogroup" aria-labelledby="export-format" className="grid grid-cols-3 overflow-hidden rounded-lg border border-line">
              {formats.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  role="radio"
                  aria-checked={format === f.id}
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    'border-l border-line py-2.5 text-sm font-medium first:border-l-0',
                    format === f.id ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {format !== 'csv' && <p className="text-xs text-pending">PDF and Excel need the server export, which isn’t available yet.</p>}
          </div>

          <label className="flex items-start gap-2.5">
            <Checkbox className="mt-0.5" checked={includeChanges} onCheckedChange={(c) => setIncludeChanges(c === true)} />
            <span className="flex flex-col">
              <span className="text-[13px] font-medium">Include change details</span>
              <span className="text-xs text-muted-foreground">Before and after values for every update</span>
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <Checkbox className="mt-0.5" checked={includeDevice} onCheckedChange={(c) => setIncludeDevice(c === true)} />
            <span className="flex flex-col">
              <span className="text-[13px] font-medium">Include IP address and device</span>
              <span className="text-xs text-muted-foreground">Only if needed for an investigation</span>
            </span>
          </label>

          <div className="flex items-center gap-3 rounded-[10px] bg-secondary px-4 py-3">
            <File className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            <div className="flex min-w-0 flex-col">
              <span className="text-[13px] font-semibold">
                {estimate ? `${estimate.count.toLocaleString('en-LK')} events · about ${estimate.kilobytes} KB` : 'Pick a valid date range'}
              </span>
              <span className="truncate font-mono text-xs text-muted-foreground">{exportFileName(request)}</span>
            </div>
          </div>

          <InfoNote>Exporting is also recorded in the audit log.</InfoNote>
          {error && <Banner tone="danger" title="Couldn’t export" message={error.message} />}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={pending || !estimate}>
            {pending ? 'Exporting…' : 'Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
