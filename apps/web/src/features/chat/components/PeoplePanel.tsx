import { InfoNote } from '@/components/shared/InfoNote'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { cn } from '@/lib/utils'
import type { ChatRole, ChatRoom } from '../types'

type PeoplePanelProps = {
  room: ChatRoom
  selectedRole: ChatRole
  onSelect: (role: ChatRole) => void
}

/** "People on this order": customer, and the driver and mechanic once a trip exists. */
export function PeoplePanel({ room, selectedRole, onSelect }: PeoplePanelProps) {
  return (
    <div className="hidden h-full w-[260px] shrink-0 flex-col border-r bg-background xl:flex">
      <div className="flex flex-col gap-1.5 border-b bg-card px-4 pt-4 pb-3.5">
        <p className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-medium">{room.orderId}</span>
          {room.tripId && <span className="font-mono text-xs text-muted-foreground">· {room.tripId}</span>}
        </p>
        <p className="text-[15px] font-semibold">{room.customerName}</p>
        <p className="text-xs text-muted-foreground">{room.route}</p>
      </div>
      <div className="flex flex-col gap-1.5 px-3 py-3.5">
        <p className="pb-0.5 pl-1 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">PEOPLE ON THIS ORDER</p>
        {room.people.map((person) => {
          const selected = person.role === selectedRole
          return (
            <button
              key={person.role}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(person.role)}
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
      <InfoNote className="px-4 pt-1">The driver and mechanic join the room when a trip is created for the order.</InfoNote>
    </div>
  )
}
