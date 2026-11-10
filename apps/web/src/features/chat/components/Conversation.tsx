import { Fragment, useEffect, useRef, useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ApiError } from '@/services/apiClient'
import type { ChatRole, ChatRoom } from '../types'

type ConversationProps = {
  room: ChatRoom
  role: ChatRole
  onSelectRole: (role: ChatRole) => void
  onSend: (text: string) => Promise<boolean>
  sending: boolean
  sendError: ApiError | null
}

function subtitleOf(room: ChatRoom, role: ChatRole, phone: string | null) {
  const where =
    role === 'customer'
      ? `Customer · ${room.customerName}`
      : `${role === 'driver' ? 'Driver' : 'Mechanic'} on ${room.tripId}`
  return phone ? `${where} · ${phone}` : where
}

/** Right-hand column: one conversation between the coordinator and one person on the order. */
export function Conversation({ room, role, onSelectRole, onSend, sending, sendError }: ConversationProps) {
  const person = room.people.find((p) => p.role === role) ?? room.people[0]
  const messages = room.messages[person.role] ?? []
  const firstName = person.name.split(' ')[0]
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, person.role, room.orderId])

  async function submit(event: { preventDefault: () => void }) {
    event.preventDefault()
    if (!draft.trim()) return
    if (await onSend(draft)) setDraft('')
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b px-5 py-3.5">
        <InitialsAvatar initials={person.initials} size={40} tone="accent" />
        <div className="flex min-w-0 flex-1 flex-col gap-px">
          <p className="text-[15px] font-semibold">{person.name}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitleOf(room, person.role, person.phone)}</p>
        </div>
        {room.tripId && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/coordinator/trips/${room.tripId}`}>View trip</Link>
          </Button>
        )}
      </div>

      {/* Below xl the People panel is hidden, so switch people here. */}
      {room.people.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-b px-5 py-2 xl:hidden" role="group" aria-label="People on this order">
          {room.people.map((p) => (
            <button
              key={p.role}
              type="button"
              aria-pressed={p.role === person.role}
              onClick={() => onSelectRole(p.role)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap',
                p.role === person.role ? 'border-brand bg-brand-soft text-brand' : 'hover:bg-secondary',
              )}
            >
              {p.name.split(' ')[0]} · {p.role}
            </button>
          ))}
        </div>
      )}

      <div ref={scrollRef} className="flex flex-1 flex-col overflow-y-auto px-6 py-5" aria-live="polite">
        <div className="mt-auto flex flex-col gap-3">
          {messages.length === 0 && (
            <p className="py-10 text-center text-[13px] text-muted-foreground">No messages with {firstName} yet.</p>
          )}
          {messages.map((message, i) => {
            const mine = message.from === 'me'
            const newDay = i === 0 || messages[i - 1].day !== message.day
            return (
              <Fragment key={message.id}>
                {newDay && (
                  <div className="flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    {message.day}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className={cn('flex flex-col gap-1', mine ? 'items-end' : 'items-start')}>
                  <p
                    className={cn(
                      'max-w-[408px] rounded-[14px] px-3.5 py-2.5 text-sm leading-5',
                      mine ? 'rounded-br-[4px] bg-brand text-primary-foreground' : 'rounded-bl-[4px] bg-secondary',
                    )}
                  >
                    {message.text}
                  </p>
                  <span className="text-[11px] text-faint">
                    {message.time}
                    {mine && message.seen && ' · Seen'}
                  </span>
                </div>
              </Fragment>
            )
          })}
        </div>
      </div>

      {sendError && <Banner tone="danger" title="Message not sent" message={sendError.message} className="mx-5 mb-2" />}
      <form onSubmit={submit} className="flex items-center gap-2.5 border-t px-5 py-3.5">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-line px-3.5 py-[11px] focus-within:ring-3 focus-within:ring-ring/50">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Write a message to ${firstName}…`}
            aria-label={`Message ${person.name}`}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-faint"
          />
        </label>
        <Button type="submit" disabled={!draft.trim() || sending}>
          Send
        </Button>
      </form>
    </div>
  )
}
