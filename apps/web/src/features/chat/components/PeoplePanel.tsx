import { InfoNote } from '@/components/shared/InfoNote'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { statusMeta } from '@/components/shared/statusTones'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { AsyncState } from '@/hooks/useAsyncData'
import { cn } from '@/lib/utils'
import type { ChatPerson, ChatRole, ChatRoom } from '../types'

type PeoplePanelProps = {
  room: ChatRoom
  /** Only people the viewer may message (canMessage) — the customer sees just the coordinator. */
  people: AsyncState<ChatPerson[]>
  onRetry: () => void
  selectedId: string | null
  onSelect: (personId: string) => void
  viewerRole: ChatRole
}

/** "People on this order": who the signed-in user can talk to in this room. */
export function PeoplePanel({ room, people, onRetry, selectedId, onSelect, viewerRole }: PeoplePanelProps) {
  const isCustomer = viewerRole === 'customer'
  return (
    <div className="hidden h-full w-[260px] shrink-0 flex-col border-r bg-background xl:flex">
      <div className="flex flex-col gap-1.5 border-b bg-card px-4 pt-4 pb-3.5">
        <p className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-medium">{room.orderId}</span>
          {room.tripId && <span className="font-mono text-xs text-muted-foreground">· {room.tripId}</span>}
        </p>
        <p className="text-[15px] font-semibold">{isCustomer ? room.route : room.customerName}</p>
        <p className="text-xs text-muted-foreground">
          {isCustomer ? (room.statusNote ?? statusMeta[room.status].label) : room.route}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-3.5">
        <p className="pb-0.5 pl-1 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">PEOPLE ON THIS ORDER</p>
        {people.status === 'loading' &&
          [0, 1].map((i) => <Skeleton key={i} className="h-[58px] w-full rounded-[10px]" aria-label="Loading people" />)}
        {people.status === 'error' && (
          <div className="flex flex-col items-start gap-2 px-1 py-2">
            <p className="text-[13px] text-muted-foreground">{people.error.message}</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )}
        {people.status === 'success' && people.data.length === 0 && (
          <p className="px-1 py-2 text-[13px] text-muted-foreground">No one to message on this order yet.</p>
        )}
        {people.status === 'success' &&
          people.data.map((person) => {
            const selected = person.id === selectedId
            return (
              <button
                key={person.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(person.id)}
                className={cn(
                  'flex items-center gap-2.5 rounded-[10px] border-[1.5px] p-2.5 text-left transition-colors',
                  selected ? 'border-brand bg-card' : 'border-transparent hover:bg-card',
                )}
              >
                <InitialsAvatar initials={person.initials} tone={selected ? 'accent' : 'surface'} className="text-[13px]" />
                <span className="flex min-w-0 flex-col gap-px">
                  <span className={cn('truncate text-sm', selected ? 'font-semibold' : 'font-medium')}>{person.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{person.detail}</span>
                </span>
              </button>
            )
          })}
      </div>
      {/* The customer frame's "driver appears here" note is left out: customers only chat with the coordinator. */}
      {!isCustomer && (
        <InfoNote className="px-4 pt-1">The driver and mechanic join the room when a trip is created for the order.</InfoNote>
      )}
    </div>
  )
}
