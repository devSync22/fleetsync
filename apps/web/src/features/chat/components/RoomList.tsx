import { useState } from 'react'
import { Search } from 'lucide-react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { cn } from '@/lib/utils'
import { matchesRoom, previewOf } from '../chatRooms'
import type { ChatRoom } from '../types'

type RoomListProps = {
  rooms: ChatRoom[]
  selectedId: string
  onSelect: (orderId: string) => void
}

/** "Order rooms" column: one row per order, newest activity first. */
export function RoomList({ rooms, selectedId, onSelect }: RoomListProps) {
  const [query, setQuery] = useState('')
  const visible = rooms.filter((room) => matchesRoom(room, query))

  return (
    <div className="flex h-full w-[280px] shrink-0 flex-col border-r xl:w-80">
      <div className="flex flex-col gap-2.5 border-b px-4 pt-4 pb-3">
        <div className="flex items-baseline">
          <h2 className="flex-1 text-[15px] font-semibold">Order rooms</h2>
          <span className="text-xs text-muted-foreground">{rooms.length} open</span>
        </div>
        <label className="flex items-center gap-2 rounded-lg bg-background px-2.5 py-2">
          <Search className="size-3.5 shrink-0 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order, customer or trip"
            aria-label="Search order rooms"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
          />
        </label>
      </div>
      <ul className="flex-1 overflow-y-auto" aria-label="Order rooms">
        {visible.length === 0 && (
          <li className="px-4 py-6 text-center text-[13px] text-muted-foreground">No rooms match “{query.trim()}”.</li>
        )}
        {visible.map((room) => {
          const selected = room.orderId === selectedId
          return (
            <li key={room.orderId}>
              <button
                type="button"
                aria-current={selected ? 'true' : undefined}
                onClick={() => onSelect(room.orderId)}
                className={cn(
                  'flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors',
                  selected ? 'bg-brand-soft' : 'hover:bg-secondary/60',
                )}
              >
                <span className="flex w-full items-center gap-1.5">
                  <span className="font-mono text-[13px] font-medium">{room.orderId}</span>
                  <span className="text-[13px] text-faint">·</span>
                  {room.tripId ? (
                    <span className="font-mono text-xs text-muted-foreground">{room.tripId}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">No trip yet</span>
                  )}
                  <span className="ml-auto text-[11px] text-faint">{room.lastActivity}</span>
                </span>
                <span className="flex w-full items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{room.customerName}</span>
                  <StatusBadge status={room.status} />
                </span>
                <span className="flex w-full items-center gap-2">
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate text-xs',
                      room.unread > 0 ? 'font-medium text-foreground' : selected ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {previewOf(room)}
                  </span>
                  {room.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {room.unread}
                      <span className="sr-only"> unread</span>
                    </span>
                  )}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
