import { useRef, useState } from 'react'
import { Lock, Paperclip, Trash2, Users, X } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { ApiError } from '@/services/apiClient'
import { cn } from '@/lib/utils'
import { me } from '../mocks/mailMock'
import type { MailAttachment, OutgoingMail, Recipient } from '../types'

export type ComposeDraft = { to: Recipient[]; subject: string; body: string }

type ComposeDialogProps = {
  open: boolean
  initial: ComposeDraft
  recipients: Recipient[]
  sending: boolean
  error: ApiError | null
  onClose: () => void
  onSend: (mail: OutgoingMail) => Promise<boolean>
  onSaveDraft: (mail: OutgoingMail) => Promise<boolean>
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn('relative h-5 w-[30px] rounded-full transition-colors', checked ? 'bg-brand' : 'bg-line')}
      >
        <span className={cn('absolute top-0.5 size-4 rounded-full bg-card transition-all', checked ? 'left-3' : 'left-0.5')} />
      </button>
      {label}
    </label>
  )
}

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** "New message" (from Admin — Mail / Compose, 229:7069): recipients, subject, body, attachments. */
export function ComposeDialog({ open, initial, recipients, sending, error, onClose, onSend, onSaveDraft }: ComposeDialogProps) {
  const [to, setTo] = useState<Recipient[]>(initial.to)
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState(initial.subject)
  const [body, setBody] = useState(initial.body)
  const [attachments, setAttachments] = useState<MailAttachment[]>([])
  const [separateEmails, setSeparateEmails] = useState(true)
  const [important, setImportant] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const needle = query.trim().toLowerCase()
  const suggestions = needle
    ? recipients.filter((r) => r.name.toLowerCase().includes(needle) && !to.some((t) => t.id === r.id))
    : []
  const mail: OutgoingMail = { to, subject, body, attachments, separateEmails, important }

  function addRecipient(recipient: Recipient) {
    setTo((current) => [...current, recipient])
    setQuery('')
  }

  function addFiles(files: FileList | null) {
    if (!files) return
    // Files stay in the browser until the mail upload endpoint exists.
    const added = Array.from(files).map((file): MailAttachment => {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
      return { name: file.name, size: formatSize(file.size), kind: ext === 'pdf' ? 'pdf' : ext.startsWith('xls') ? 'xls' : 'doc' }
    })
    setAttachments((current) => [...current, ...added])
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !sending && onClose()}>
      <DialogContent className="max-w-[780px]" onOpenAutoFocus={(event) => event.preventDefault()}>
        <div className="flex items-center gap-3 bg-foreground px-5 py-3 text-primary-foreground">
          <DialogTitle className="flex-1 text-[15px] leading-6">New message</DialogTitle>
          <DialogClose className="rounded p-1 hover:bg-primary-foreground/10" aria-label="Close">
            <X className="size-4" />
          </DialogClose>
        </div>

        <div className="flex items-center gap-4 border-b px-5 py-3 text-[13px]">
          <span className="w-14 shrink-0 text-muted-foreground">From</span>
          <span className="flex-1">
            <span className="text-sm">{me.name}</span>{' '}
            <span className="text-muted-foreground">
              &lt;{me.email}&gt; · {me.role}
            </span>
          </span>
          <Lock className="size-3.5 text-faint" aria-label="You can only send as yourself" />
        </div>

        <div className="relative flex items-center gap-4 border-b px-5 py-2.5 text-[13px]">
          <span className="w-14 shrink-0 text-muted-foreground">To</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {to.map((r) => (
              <span key={r.id} className="flex items-center gap-1.5 rounded-full border py-0.5 pr-1.5 pl-0.5">
                {r.isGroup ? (
                  <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-brand">
                    <Users className="size-3" aria-hidden />
                  </span>
                ) : (
                  <InitialsAvatar initials={r.initials} size={32} className="size-6 text-[9px]" />
                )}
                <span className="text-sm">{r.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${r.name}`}
                  onClick={() => setTo((current) => current.filter((t) => t.id !== r.id))}
                  className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary"
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && suggestions[0]) {
                  event.preventDefault()
                  addRecipient(suggestions[0])
                }
                if (event.key === 'Backspace' && !query && to.length) setTo((current) => current.slice(0, -1))
              }}
              placeholder={to.length ? '' : 'Name or group'}
              aria-label="Add recipient"
              autoFocus
              className="min-w-[120px] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-faint"
            />
          </div>
          {suggestions.length > 0 && (
            <ul role="listbox" className="absolute top-full left-[92px] z-10 w-[340px] overflow-hidden rounded-[10px] border bg-card shadow-lg">
              {suggestions.map((r, i) => (
                <li key={r.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === 0}
                    onClick={() => addRecipient(r)}
                    className={cn('flex w-full items-center gap-2.5 px-3 py-2 text-left', i === 0 ? 'bg-brand-soft' : 'hover:bg-secondary')}
                  >
                    {r.isGroup ? (
                      <span className="flex size-7 items-center justify-center rounded-full bg-brand-soft text-brand">
                        <Users className="size-3.5" aria-hidden />
                      </span>
                    ) : (
                      <InitialsAvatar initials={r.initials} size={32} className="size-7 text-[10px]" />
                    )}
                    <span className="flex flex-col">
                      <span className="text-[13px] font-medium">{r.name}</span>
                      <span className="text-[11px] text-muted-foreground">{r.detail}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <label className="flex items-center gap-4 border-b px-5 py-2.5 text-[13px]">
          <span className="w-14 shrink-0 text-muted-foreground">Subject</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none"
          />
        </label>

        <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4">
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            aria-label="Message"
            placeholder="Write your message…"
            className="min-h-[220px] w-full resize-none bg-transparent text-sm leading-[22px] outline-none placeholder:text-faint"
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {attachments.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground">Attachments · {attachments.length}</p>
              )}
              <Button type="button" variant="ghost" size="sm" className="text-brand hover:text-brand" onClick={() => fileInput.current?.click()}>
                <Paperclip aria-hidden />
                Attach file
              </Button>
              <input ref={fileInput} type="file" multiple hidden onChange={(event) => addFiles(event.target.files)} />
            </div>
            {attachments.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5">
                    <span className="flex size-7 items-center justify-center rounded-md bg-secondary text-[9px] font-bold uppercase">{file.kind}</span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-[13px] font-medium">{file.name}</span>
                      <span className="text-[11px] text-muted-foreground">{file.size}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setAttachments((current) => current.filter((_, j) => j !== i))}
                      className="rounded p-0.5 text-muted-foreground hover:bg-secondary"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {error && <Banner tone="danger" title="Couldn’t send" message={error.message} />}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t bg-background px-5 py-3.5">
          <Button type="button" onClick={async () => (await onSend(mail)) && onClose()} disabled={sending || to.length === 0}>
            {sending ? 'Sending…' : 'Send'}
          </Button>
          <Button type="button" variant="outline" onClick={async () => (await onSaveDraft(mail)) && onClose()} disabled={sending}>
            Save draft
          </Button>
          <Toggle checked={separateEmails} onChange={setSeparateEmails} label="Send as separate emails" />
          <Toggle checked={important} onChange={setImportant} label="Mark as important" />
          <span className="flex-1" />
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Discard" onClick={onClose} disabled={sending}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
