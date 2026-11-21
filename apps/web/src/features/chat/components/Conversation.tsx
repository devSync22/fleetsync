import { Fragment, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AsyncState } from '@/hooks/useAsyncData'
import { cn } from '@/lib/utils'
import { dayLabel, timeLabel } from '../chatRooms'
import type { ChatMessage, ChatPerson, ChatRoom, ChatViewer } from '../types'

type ConversationProps = {
  room: ChatRoom
  person: ChatPerson
  /** Everyone the viewer may message, for the narrow-screen switcher. */
  people: ChatPerson[]
  onSelectPerson: (personId: string) => void
  viewer: ChatViewer
  thread: AsyncState<ChatMessage[]>
  onRetryThread: () => void
  onSend: (text: string) => void
  onRetrySend: (message: ChatMessage) => void
}

function subtitleOf(room: ChatRoom, person: ChatPerson) {
  const where =
    person.role === 'coordinator'
      ? `Operational Coordinator · ${room.orderId}`
      : person.role === 'customer'
        ? `Customer · ${room.customerName}`
        : `${person.role === 'driver' ? 'Driver' : 'Mechanic'} on ${room.tripId}`
  return person.phone ? `${where} · ${person.phone}` : where
}

/** Right-hand column: the 1-to-1 conversation between the signed-in user and one person on the order. */
export function Conversation(props: ConversationProps) {
  const { room, person, people, onSelectPerson, viewer, thread, onRetryThread, onSend, onRetrySend } = props
  const messages = thread.status === 'success' ? thread.data : []
  const firstName = person.name.split(' ')[0]
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastSeenMine = messages.findLast((m) => m.senderId === viewer.id && m.status === 'seen')?.id
  const viewLink =
    viewer.role === 'coordinator' && room.tripId
      ? { to: `/coordinator/trips/${room.tripId}`, label: 'View trip' }
      : { to: `/${viewer.role}/orders/${room.orderId}`, label: 'View order' }

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  function submit(event: { preventDefault: () => void }) {
    event.preventDefault()
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b px-5 py-3.5">
        <InitialsAvatar initials={person.initials} size={40} tone="accent" />
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="text-[15px] font-semibold">{person.name}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitleOf(room, person)}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to={viewLink.to}>{viewLink.label}</Link>
        </Button>
      </div>

      {/* Below xl the People panel is hidden, so switch people here. */}
      {people.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b px-5 py-2 xl:hidden" role="group" aria-label="People on this order">
          {people.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === person.id}
              onClick={() => onSelectPerson(p.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap',
                p.id === person.id ? 'border-brand bg-brand-soft text-brand' : 'hover:bg-secondary',
              )}
            >
              {p.name.split(' ')[0]} · {p.role}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-6 py-5" aria-live="polite">
        <div className="mt-auto flex flex-col gap-3">
          {thread.status === 'loading' && (
            <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading messages">
              <Skeleton className="h-10 w-2/3 rounded-[14px]" />
              <Skeleton className="h-10 w-1/2 self-end rounded-[14px]" />
              <Skeleton className="h-10 w-3/5 rounded-[14px]" />
            </div>
          )}
          {thread.status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-[13px] text-muted-foreground">{thread.error.message}</p>
              <Button type="button" variant="outline" size="sm" onClick={onRetryThread}>
                Try again
              </Button>
            </div>
          )}
          {thread.status === 'success' && messages.length === 0 && (
            <p className="py-10 text-center text-[13px] text-muted-foreground">No messages with {firstName} yet.</p>
          )}
          {messages.map((message, i) => {
            const mine = message.senderId === viewer.id
            const day = dayLabel(message.sentAt)
            const newDay = i === 0 || dayLabel(messages[i - 1].sentAt) !== day
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    {day}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
                  <p
                    className={cn(
                      'max-w-[408px] rounded-[14px] px-3.5 py-2.5 text-sm leading-5 whitespace-pre-wrap',
                      mine ? 'rounded-br-[4px] bg-brand text-primary-foreground' : 'rounded-bl-[4px] bg-secondary',
                      message.status === 'sending' && 'opacity-70',
                    )}
                  >
                    {message.text}
                  </p>
                  {message.status === 'failed' ? (
                    <span className="text-[11px] text-danger">
                      Not sent ·{' '}
                      <button type="button" onClick={() => onRetrySend(message)} className="font-semibold hover:underline">
                        Retry
                      </button>
                    </span>
                  ) : (
                    <span className="text-[11px] text-faint">
                      {message.status === 'sending' ? 'Sending…' : timeLabel(message.sentAt)}
                      {message.id === lastSeenMine && ' · Seen'}
                    </span>
                  )}
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* File sending isn't part of KAN-340, so the frame's paperclip is left out. */}
      <form onSubmit={submit} className="flex items-center gap-2.5 border-t px-5 py-3.5">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-line px-3.5 py-[11px] focus-within:ring-3 focus-within:ring-ring/50">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Write a message to ${firstName}…`}
            aria-label={`Message ${person.name}`}
            disabled={thread.status !== 'success'}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint disabled:cursor-not-allowed"
          />
        </label>
        <Button type="submit" disabled={!draft.trim() || thread.status !== 'success'}>
          Send
        </Button>
      </form>
    </div>
  )
}
