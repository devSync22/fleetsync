import { MessagesSquare } from 'lucide-react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Conversation } from '../components/Conversation'
import { PeoplePanel } from '../components/PeoplePanel'
import { RoomList } from '../components/RoomList'
import { useChat } from '../hooks/useChat'
import type { ChatViewer } from '../types'

type ChatPageRole = 'coordinator' | 'customer'

// TODO: read the signed-in user from AuthContext once sign-in exists
const viewers: Record<ChatPageRole, { user: ChatViewer; description: string }> = {
  coordinator: {
    user: { id: 'co-nimal', role: 'coordinator' },
    description: 'Every order has its own chat room. Pick an order, then the person you want to talk to.',
  },
  customer: {
    user: { id: 'cu-dilini', role: 'customer' },
    description: 'Each of your orders has its own chat room. Pick an order, then the person you want to talk to.',
  },
}

const boxClass = 'flex h-[calc(100vh-232px)] min-h-[560px] overflow-hidden rounded-xl border bg-card'

/**
 * "Coordinator — Chat" (145:5122) and "Customer — Chat" (164:7038).
 * URL: /<role>/chat/:orderId?with=<personId>. The older ?order= and ?trip= links still open the right room.
 * Customer route, once a customer layout exists: { path: 'chat/:orderId?', element: <ChatPage viewer="customer" /> }
 */
export function ChatPage({ viewer = 'coordinator' }: { viewer?: ChatPageRole }) {
  const { orderId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  // shortcut: dev-only `?as=customer` previews the customer view until /customer routes exist; remove then.
  const previewAs = import.meta.env.DEV && searchParams.get('as') === 'customer' ? 'customer' : null
  const { user, description } = viewers[previewAs ?? viewer]

  const chat = useChat(user, {
    orderId: orderId ?? searchParams.get('order'),
    tripId: searchParams.get('trip'),
    withId: searchParams.get('with'),
  })

  function open(nextOrderId: string, withId?: string) {
    const query = new URLSearchParams()
    if (withId) query.set('with', withId)
    if (previewAs) query.set('as', previewAs)
    const search = query.toString()
    navigate(`/${viewer}/chat/${nextOrderId}${search ? `?${search}` : ''}`)
  }

  const header = <PageHeader title="Chat" description={description} />

  if (chat.roomsState.status === 'loading') {
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

  if (chat.roomsState.status === 'error' || !chat.rooms) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Banner
          tone="danger"
          title="Couldn’t load chat"
          message={chat.roomsState.status === 'error' ? chat.roomsState.error.message : ''}
          action={
            <Button type="button" variant="outline" size="sm" onClick={chat.retryRooms}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  if (!chat.room) {
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

  const { room, person } = chat
  const people = chat.people.status === 'success' ? chat.people.data : []

  return (
    <div className="flex flex-col gap-6">
      {header}
      <div className={boxClass}>
        <RoomList rooms={chat.rooms} selectedId={room.orderId} onSelect={(id) => open(id)} viewer={user} />
        <PeoplePanel
          room={room}
          people={chat.people}
          onRetry={chat.retryPeople}
          selectedId={person?.id ?? null}
          onSelect={(id) => open(room.orderId, id)}
          viewerRole={user.role}
        />
        {person ? (
          <Conversation
            key={`${room.orderId}-${person.id}`}
            room={room}
            person={person}
            people={people}
            onSelectPerson={(id) => open(room.orderId, id)}
            viewer={user}
            thread={chat.thread}
            onRetryThread={chat.retryThread}
            onSend={chat.send}
            onRetrySend={chat.retrySend}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-[13px] text-muted-foreground">
            {chat.people.status === 'loading' && <Skeleton className="h-10 w-1/2 rounded-[14px]" />}
            {chat.people.status === 'success' && 'No one to message on this order yet.'}
            {chat.people.status === 'error' && (
              <span className="flex flex-col items-center gap-3">
                {chat.people.error.message}
                <Button type="button" variant="outline" size="sm" onClick={chat.retryPeople}>
                  Try again
                </Button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
