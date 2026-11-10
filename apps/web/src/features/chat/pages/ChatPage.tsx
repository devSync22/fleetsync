import { MessagesSquare } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { defaultRole } from '../chatRooms'
import { Conversation } from '../components/Conversation'
import { PeoplePanel } from '../components/PeoplePanel'
import { RoomList } from '../components/RoomList'
import { useChat } from '../hooks/useChat'
import type { ChatRole } from '../types'

const boxClass = 'flex h-[calc(100vh-232px)] min-h-[560px] overflow-hidden rounded-xl border bg-card'

/**
 * "Coordinator — Chat" (145:5122). The room comes from `?order=` (or `?trip=` from trip pages),
 * the person from `?with=customer|driver|mechanic`.
 */
export function ChatPage() {
  const { state, retry, rooms, markRead, send, sending, sendError } = useChat()
  const [searchParams, setSearchParams] = useSearchParams()

  const header = (
    <PageHeader
      title="Chat"
      description="Every order has its own chat room. Pick an order, then the person you want to talk to."
    />
  )

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div aria-busy="true" aria-label="Loading chat" className={boxClass}>
          <div className="flex w-80 flex-col gap-3 border-r p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
          <div className="flex-1" />
        </div>
      </div>
    )
  }

  if (state.status === 'error' || !rooms) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Banner
          tone="danger"
          title="Couldn’t load chat"
          message={state.status === 'error' ? state.error.message : ''}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          icon={MessagesSquare}
          title="No order rooms yet"
          description="A chat room opens for every order a customer submits."
        />
      </div>
    )
  }

  const orderParam = searchParams.get('order')
  const tripParam = searchParams.get('trip')
  const room =
    rooms.find((r) => r.orderId === orderParam) ?? rooms.find((r) => tripParam !== null && r.tripId === tripParam) ?? rooms[0]
  const withParam = searchParams.get('with') as ChatRole | null
  const role = room.people.some((p) => p.role === withParam) ? (withParam as ChatRole) : defaultRole(room)
  // The open room counts as read.
  const shownRooms = rooms.map((r) => (r.orderId === room.orderId ? { ...r, unread: 0 } : r))

  function selectRoom(orderId: string) {
    markRead(room.orderId)
    setSearchParams({ order: orderId })
  }

  function selectRole(next: ChatRole) {
    setSearchParams({ order: room.orderId, with: next })
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <div className={boxClass}>
        <RoomList rooms={shownRooms} selectedId={room.orderId} onSelect={selectRoom} />
        <PeoplePanel room={room} selectedRole={role} onSelect={selectRole} />
        <Conversation
          key={`${room.orderId}-${role}`}
          room={room}
          role={role}
          onSelectRole={selectRole}
          onSend={(text) => send(room.orderId, role, text)}
          sending={sending}
          sendError={sendError}
        />
      </div>
    </div>
  )
}
