import { Download, Forward, Mail, Reply, ReplyAll, Star, Trash2 } from 'lucide-react'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { MailAttachment, MailMessage } from '../types'

const kindStyle: Record<MailAttachment['kind'], string> = {
  pdf: 'bg-danger-soft text-danger',
  xls: 'bg-success-soft text-success',
  doc: 'bg-info-soft text-info',
}

type ReadingPaneProps = {
  message: MailMessage | null
  onReply: (mode: 'reply' | 'reply-all' | 'forward') => void
  onToggleStar: () => void
  onDelete: () => void
}

/** Right column: the open message with Reply / Reply all / Forward, star and delete. */
export function ReadingPane({ message, onReply, onToggleStar, onDelete }: ReadingPaneProps) {
  if (!message) {
    return (
      <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
        <Mail className="size-6" aria-hidden />
        <p className="text-[13px]">Choose a message to read it.</p>
      </div>
    )
  }

  return (
    <article className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-1.5 border-b px-5 py-2.5">
        <Button type="button" variant="outline" size="sm" className="font-medium" onClick={() => onReply('reply')}>
          <Reply aria-hidden />
          Reply
        </Button>
        <Button type="button" variant="outline" size="sm" className="font-medium" onClick={() => onReply('reply-all')}>
          <ReplyAll aria-hidden />
          Reply all
        </Button>
        <Button type="button" variant="outline" size="sm" className="font-medium" onClick={() => onReply('forward')}>
          <Forward aria-hidden />
          Forward
        </Button>
        <span className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-pressed={message.starred}
          aria-label={message.starred ? 'Remove star' : 'Star'}
          onClick={onToggleStar}
        >
          <Star className={cn('size-4', message.starred && 'fill-pending text-pending')} aria-hidden />
        </Button>
        {message.folder !== 'trash' && (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Move to trash" onClick={onDelete}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-7 py-[22px]">
        <h2 className="text-xl leading-7 font-semibold">{message.subject}</h2>
        <div className="flex items-start gap-3">
          <InitialsAvatar initials={message.from.initials} size={40} tone="accent" />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="text-sm font-semibold">{message.from.name}</span>
              <span className="text-[13px] text-muted-foreground">
                &lt;{message.from.email}&gt; · {message.from.role}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">To: {message.to.join(', ')}</p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">{message.dateLabel}</span>
        </div>
        {message.note && (
          <p className="w-fit rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">{message.note}</p>
        )}
        <div className="text-sm leading-[22px] whitespace-pre-line">{message.body}</div>

        {message.attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground">
              {message.attachments.length} {message.attachments.length === 1 ? 'attachment' : 'attachments'}
            </p>
            {message.attachments.map((file) => (
              <div key={file.name} className="flex w-fit items-center gap-2.5 rounded-[10px] border px-3 py-2.5">
                <span className={cn('flex size-8 items-center justify-center rounded-md text-[9px] font-bold uppercase', kindStyle[file.kind])}>
                  {file.kind}
                </span>
                <span className="flex flex-col gap-px">
                  <span className="text-[13px] font-medium">{file.name}</span>
                  <span className="text-[11px] text-muted-foreground">{file.size}</span>
                </span>
                {/* TODO: download from the mail attachments endpoint once it exists */}
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Download ${file.name}`} className="text-brand">
                  <Download className="size-4" aria-hidden />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
