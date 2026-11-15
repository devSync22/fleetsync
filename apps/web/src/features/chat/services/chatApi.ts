import { ApiError } from '@/services/apiClient'
import { chatMessagesMock, chatPeopleMock, chatRoomsMock, type MockMessage, type MockRoom } from '../mocks/chatMock'
import { canMessage } from '../permissions'
import type { ChatEvent, ChatMessage, ChatPerson, ChatService, ChatViewer } from '../types'

/*
 * Mocked until the chat API and SignalR hub exist. Swapping means one new ChatService here:
 *   getRooms / getParticipants / getThread → apiClient.get under /chat/rooms
 *   sendMessage / markSeen                 → hub.invoke('SendMessage' | 'MarkSeen', …)
 *   onMessage                              → hub.on('MessageReceived' | 'MessageSeen', …)
 * In dev, add `mock=empty`, `mock=error` or `mock=send-error` to the URL query to preview those states.
 */

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function scenario() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
}

// One shared store, so a message sent as the coordinator shows up for the customer too.
const store: MockMessage[] = chatMessagesMock.map((m) => ({ ...m }))
const listeners = new Set<{ viewerId: string; fn: (event: ChatEvent) => void }>()
const autoReplied = new Set<string>()
let nextId = 1

const between = (m: MockMessage, a: string, b: string) => (m.senderId === a && m.toId === b) || (m.senderId === b && m.toId === a)
const toMessage = (m: MockMessage): ChatMessage => ({ id: m.id, senderId: m.senderId, text: m.text, sentAt: m.sentAt, status: m.status })

function emit(m: MockMessage) {
  for (const l of listeners) {
    if (l.viewerId === m.senderId) l.fn({ orderId: m.orderId, withId: m.toId, message: toMessage(m) })
    else if (l.viewerId === m.toId) l.fn({ orderId: m.orderId, withId: m.senderId, message: toMessage(m) })
  }
}

// shortcut: fakes the other person (seen after 2 s, one reply per thread) so live updates can be tried; goes with the mock.
function simulateOtherSide(sent: MockMessage) {
  setTimeout(() => {
    sent.status = 'seen'
    emit(sent)
  }, 2000)
  const key = `${sent.orderId}:${sent.senderId}:${sent.toId}`
  if (autoReplied.has(key)) return
  autoReplied.add(key)
  setTimeout(() => {
    const reply: MockMessage = {
      id: `mock-${nextId++}`,
      orderId: sent.orderId,
      senderId: sent.toId,
      toId: sent.senderId,
      text: 'Thanks, noted.',
      sentAt: new Date().toISOString(),
      status: 'sent',
    }
    store.push(reply)
    emit(reply)
  }, 4000)
}

// Tests only: puts the shared mock store back to the seed data so each test starts fresh.
export function resetChatMockForTests() {
  store.splice(0, store.length, ...chatMessagesMock.map((m) => ({ ...m })))
  listeners.clear()
  autoReplied.clear()
  nextId = 1
}

export function createMockChatService(viewer: ChatViewer): ChatService {
  const myRooms = () => chatRoomsMock.filter((room) => room.memberIds.includes(viewer.id))

  function findRoom(orderId: string) {
    const room = myRooms().find((r) => r.orderId === orderId)
    if (!room) throw new ApiError('This chat room doesn’t exist or you’re not in it.', 404)
    return room
  }

  // Driver and mechanic only count once a trip exists; canMessage decides the rest.
  function participants(room: MockRoom): ChatPerson[] {
    return room.memberIds
      .map((id) => chatPeopleMock[id])
      .filter((p) => p.id !== viewer.id && canMessage(viewer.role, p.role))
      .filter((p) => room.tripId !== null || (p.role !== 'driver' && p.role !== 'mechanic'))
  }

  function assertAllowed(room: MockRoom, personId: string) {
    if (!participants(room).some((p) => p.id === personId)) {
      throw new ApiError('You can’t message this person on this order.', 403)
    }
  }

  return {
    async getRooms() {
      await wait(400)
      if (scenario() === 'error') {
        throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
      }
      if (scenario() === 'empty') return []
      return myRooms()
        .map((room) => {
          const ids = participants(room).map((p) => p.id)
          const mine = store.filter((m) => m.orderId === room.orderId && ids.some((id) => between(m, viewer.id, id)))
          const last = mine.reduce<MockMessage | null>((a, b) => (!a || b.sentAt > a.sentAt ? b : a), null)
          return {
            orderId: room.orderId,
            tripId: room.tripId,
            customerName: room.customerName,
            route: room.route,
            status: room.status,
            statusNote: room.statusNote,
            unread: mine.filter((m) => m.toId === viewer.id && m.status !== 'seen').length,
            lastMessage: last && {
              withId: last.senderId === viewer.id ? last.toId : last.senderId,
              senderId: last.senderId,
              senderName: chatPeopleMock[last.senderId].name,
              text: last.text,
              sentAt: last.sentAt,
            },
          }
        })
        .sort((a, b) => (b.lastMessage?.sentAt ?? '').localeCompare(a.lastMessage?.sentAt ?? ''))
    },

    async getParticipants(orderId) {
      await wait(150)
      return participants(findRoom(orderId))
    },

    async getThread(orderId, personId) {
      await wait(250)
      assertAllowed(findRoom(orderId), personId)
      return store
        .filter((m) => m.orderId === orderId && between(m, viewer.id, personId))
        .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
        .map(toMessage)
    },

    async sendMessage(orderId, personId, text) {
      await wait(300)
      assertAllowed(findRoom(orderId), personId)
      if (!text.trim()) throw new ApiError('Write a message before sending.', 400)
      if (scenario() === 'send-error') throw new ApiError('Message not sent. Check your connection and try again.')
      const sent: MockMessage = {
        id: `mock-${nextId++}`,
        orderId,
        senderId: viewer.id,
        toId: personId,
        text: text.trim(),
        sentAt: new Date().toISOString(),
        status: 'sent',
      }
      store.push(sent)
      simulateOtherSide(sent)
      return toMessage(sent)
    },

    async markSeen(orderId, personId) {
      for (const m of store) {
        if (m.orderId === orderId && m.senderId === personId && m.toId === viewer.id && m.status !== 'seen') {
          m.status = 'seen'
          emit(m)
        }
      }
    },

    onMessage(fn) {
      const listener = { viewerId: viewer.id, fn }
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
