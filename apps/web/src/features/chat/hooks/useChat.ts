import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAsyncData, type AsyncState } from '@/hooks/useAsyncData'
import { createMockChatService } from '../services/chatApi'
import type { ChatMessage, ChatViewer } from '../types'

/** What the URL asks for: `/:orderId` (or the older `?order=` / `?trip=`) and `?with=<personId>`. */
export type ChatSelection = { orderId: string | null; tripId: string | null; withId: string | null }

type LiveMessage = ChatMessage & { thread: string }

const threadKey = (orderId: string, personId: string) => `${orderId}:${personId}`

/** A keyed load counts as loading while it still holds the previous key's data. */
function current<T>(state: AsyncState<{ key: string; data: T }>, key: string | null): AsyncState<T> {
  if (state.status !== 'success') return state
  return state.data.key === key ? { status: 'success', data: state.data.data } : { status: 'loading' }
}

/**
 * Order rooms, the people the viewer may message in the open room, and the open 1-to-1 thread.
 * Sending is optimistic (sending → sent → seen, or failed with retry); live events come from onMessage.
 */
export function useChat({ id: viewerId, role }: ChatViewer, selection: ChatSelection) {
  const service = useMemo(() => createMockChatService({ id: viewerId, role }), [viewerId, role])

  // Rooms: first load drives loading/error; later refreshes replace the list quietly.
  const loadRooms = useCallback(() => service.getRooms(), [service])
  const { state: roomsState, retry: retryRooms } = useAsyncData(loadRooms)
  const [refreshed, setRefreshed] = useState<Awaited<ReturnType<typeof loadRooms>> | null>(null)
  const refreshRooms = useCallback(() => {
    service.getRooms().then(setRefreshed).catch(() => {})
  }, [service])
  const rooms = refreshed ?? (roomsState.status === 'success' ? roomsState.data : null)

  const room =
    rooms?.find((r) => r.orderId === selection.orderId) ??
    rooms?.find((r) => selection.tripId !== null && r.tripId === selection.tripId) ??
    rooms?.[0] ??
    null
  const orderId = room?.orderId ?? null

  // People the viewer may message in this room.
  const loadPeople = useCallback(
    async () => ({ key: orderId ?? '', data: orderId ? await service.getParticipants(orderId) : [] }),
    [service, orderId],
  )
  const peopleAsync = useAsyncData(loadPeople)
  const people = current(peopleAsync.state, orderId ?? '')
  const list = people.status === 'success' ? people.data : []
  // Default to whoever the viewer last talked to, from the first load so a live message can't switch threads.
  const firstLoad = roomsState.status === 'success' ? roomsState.data.find((r) => r.orderId === orderId) : undefined
  const person =
    list.find((p) => p.id === selection.withId) ?? list.find((p) => p.id === firstLoad?.lastMessage?.withId) ?? list[0] ?? null
  const personId = person?.id ?? null
  const key = orderId && personId ? threadKey(orderId, personId) : null

  // The open thread, plus messages sent or received live in this session.
  const loadThread = useCallback(
    async () => ({ key: key ?? '', data: orderId && personId ? await service.getThread(orderId, personId) : [] }),
    [service, key, orderId, personId],
  )
  const threadAsync = useAsyncData(loadThread)
  const thread = current(threadAsync.state, key ?? '')
  const [live, setLive] = useState<Record<string, LiveMessage>>({})

  const messages = useMemo(() => {
    if (thread.status !== 'success') return []
    const byId = new Map<string, ChatMessage>(thread.data.map((m) => [m.id, m]))
    for (const m of Object.values(live)) if (m.thread === key) byId.set(m.id, m)
    return [...byId.values()].sort((a, b) => a.sentAt.localeCompare(b.sentAt))
  }, [thread, live, key])

  // Opening a thread marks the other person's messages as seen.
  const threadLoaded = thread.status === 'success'
  useEffect(() => {
    if (!threadLoaded || !orderId || !personId) return
    service.markSeen(orderId, personId).then(refreshRooms, () => {})
  }, [service, threadLoaded, orderId, personId, refreshRooms])

  // Live events: new messages and status changes; a message arriving in the open thread is seen at once.
  useEffect(
    () =>
      service.onMessage(({ orderId: eventOrder, withId, message }) => {
        setLive((previous) => ({ ...previous, [message.id]: { ...message, thread: threadKey(eventOrder, withId) } }))
        if (eventOrder === orderId && withId === personId && message.senderId === withId && message.status !== 'seen') {
          void service.markSeen(eventOrder, withId)
        }
        refreshRooms()
      }),
    [service, orderId, personId, refreshRooms],
  )

  const deliver = useCallback(
    (tempId: string, toOrder: string, toPerson: string, text: string) => {
      service
        .sendMessage(toOrder, toPerson, text)
        .then((sent) => {
          setLive((previous) => {
            const next = { ...previous }
            delete next[tempId]
            next[sent.id] = { ...sent, thread: threadKey(toOrder, toPerson) }
            return next
          })
          refreshRooms()
        })
        .catch(() => setLive((previous) => ({ ...previous, [tempId]: { ...previous[tempId], status: 'failed' } })))
    },
    [service, refreshRooms],
  )

  const send = useCallback(
    (text: string) => {
      if (!orderId || !personId || !text.trim()) return
      const tempId = `temp-${Date.now()}`
      const message: LiveMessage = {
        id: tempId,
        senderId: viewerId,
        text: text.trim(),
        sentAt: new Date().toISOString(),
        status: 'sending',
        thread: threadKey(orderId, personId),
      }
      setLive((previous) => ({ ...previous, [tempId]: message }))
      deliver(tempId, orderId, personId, message.text)
    },
    [orderId, personId, viewerId, deliver],
  )

  const retrySend = useCallback(
    (message: ChatMessage) => {
      if (!orderId || !personId) return
      setLive((previous) => ({ ...previous, [message.id]: { ...previous[message.id], status: 'sending' } }))
      deliver(message.id, orderId, personId, message.text)
    },
    [orderId, personId, deliver],
  )

  return {
    roomsState,
    retryRooms,
    rooms,
    room,
    people,
    retryPeople: peopleAsync.retry,
    person,
    thread: thread.status === 'success' ? ({ status: 'success', data: messages } as const) : thread,
    retryThread: threadAsync.retry,
    send,
    retrySend,
  }
}
