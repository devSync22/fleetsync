import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ComposeDialog, type ComposeDraft } from '../components/ComposeDialog'
import { FolderList } from '../components/FolderList'
import { MessageList } from '../components/MessageList'
import { ReadingPane } from '../components/ReadingPane'
import { folders, inFolder } from '../folders'
import { useMailbox } from '../hooks/useMailbox'
import { me } from '../mocks/mailMock'
import type { MailFolder, MailMessage, Recipient } from '../types'

const boxClass = 'flex h-[calc(100vh-232px)] min-h-[560px] overflow-hidden rounded-xl border bg-card'
const emptyDraft: ComposeDraft = { to: [], subject: '', body: '' }

function quote(message: MailMessage) {
  return `\n\n— On ${message.dateLabel}, ${message.from.name} wrote:\n${message.body}`
}

/** "Coordinator — Mail / Inbox" (229:10801). Folder and open message are in the URL (`?folder=&id=`). */
export function MailPage() {
  const mailbox = useMailbox()
  const [searchParams, setSearchParams] = useSearchParams()
  const [compose, setCompose] = useState<{ key: number; draft: ComposeDraft } | null>(null)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const folder = (folders.find((f) => f.id === searchParams.get('folder'))?.id ?? 'inbox') as MailFolder
  const messages = mailbox.messages ?? []
  const inThisFolder = inFolder(messages, folder)
  const selected = inThisFolder.find((m) => m.id === searchParams.get('id')) ?? inThisFolder[0] ?? null

  function recipientFor(name: string): Recipient {
    return (
      mailbox.recipients.find((r) => r.name === name) ?? {
        id: name,
        name,
        initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase(),
        detail: '',
        isGroup: false,
      }
    )
  }

  function openCompose(draft: ComposeDraft) {
    setCompose({ key: Date.now(), draft })
  }

  function reply(mode: 'reply' | 'reply-all' | 'forward') {
    if (!selected) return
    const subject = selected.subject.replace(/^(Re|Fwd): /, '')
    if (mode === 'forward') {
      openCompose({ to: [], subject: `Fwd: ${subject}`, body: quote(selected) })
      return
    }
    const names = mode === 'reply-all' ? [selected.from.name, ...selected.to] : [selected.from.name]
    const to = [...new Set(names)].filter((n) => n !== me.name).map(recipientFor)
    openCompose({ to, subject: `Re: ${subject}`, body: quote(selected) })
  }

  function select(id: string) {
    mailbox.markRead(id)
    setSearchParams({ folder, id })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mail"
        description="Email with the Fleet Administrator and other coordinators."
        actions={
          <Button type="button" onClick={() => openCompose(emptyDraft)} disabled={!mailbox.messages}>
            Compose
          </Button>
        }
      />

      {sentTo && (
        <Banner
          tone="success"
          title="Message sent"
          message={`Your email to ${sentTo} is in Sent.`}
          action={
            <Button type="button" variant="ghost" size="sm" onClick={() => setSentTo(null)}>
              Dismiss
            </Button>
          }
        />
      )}

      {mailbox.state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading mail" className={boxClass}>
          <div className="flex w-[340px] flex-col gap-3 border-r p-4">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex-1" />
        </div>
      )}

      {mailbox.state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load mail"
          message={mailbox.state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={mailbox.retry}>
              Try again
            </Button>
          }
        />
      )}

      {mailbox.messages && (
        <div className={boxClass}>
          <FolderList messages={messages} active={folder} onSelect={(f) => setSearchParams({ folder: f })} />
          <MessageList
            folder={folder}
            messages={inThisFolder}
            selectedId={selected?.id ?? null}
            onSelect={select}
            onFolderChange={(f) => setSearchParams({ folder: f })}
          />
          <ReadingPane
            message={selected}
            onReply={reply}
            onToggleStar={() => selected && mailbox.setStarred(selected.id, !selected.starred)}
            onDelete={() => {
              if (!selected) return
              mailbox.moveToTrash(selected.id)
              setSearchParams({ folder })
            }}
          />
        </div>
      )}

      {compose && (
        <ComposeDialog
          key={compose.key}
          open
          initial={compose.draft}
          recipients={mailbox.recipients}
          sending={mailbox.sending}
          error={mailbox.sendError}
          onClose={() => setCompose(null)}
          onSend={async (mail) => {
            const sent = await mailbox.sendMessage(mail)
            if (sent) setSentTo(sent.to.join(', '))
            return Boolean(sent)
          }}
          onSaveDraft={async (mail) => Boolean(await mailbox.saveMessageDraft(mail))}
        />
      )}
    </div>
  )
}
