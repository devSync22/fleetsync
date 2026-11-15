import { useCallback, useMemo, useState } from 'react'
import { useAction } from '@/hooks/useAction'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getChatRooms, sendChatMessage } from '../services/chatApi'
import type { ChatMessage, ChatRole, ChatRoom } from '../types'

const keyOf = (orderId: string, role: ChatRole) => `${orderId}:${role}`

/** Loads the order rooms and keeps messages sent and rooms read in this session on top of them. */
export function useChat() {
  const { state, retry } = useAsyncData(getChatRooms)
  const [sent, setSent] = useState<Record<string, ChatMessage[]>>({})
  const [readRooms, setReadRooms] = useState<ReadonlySet<string>>(new Set())
  const { run, pending, error } = useAction(sendChatMessage)

  const rooms = useMemo<ChatRoom[] | null>(() => {
    if (state.status !== 'success') return null
    return state.data.map((room) => {
      const messages = { ...room.messages }
      for (const person of room.people) {
        const extra = sent[keyOf(room.orderId, person.role)]
        if (extra) messages[person.role] = [...(messages[person.role] ?? []), ...extra]
      }
      return { ...room, messages, unread: readRooms.has(room.orderId) ? 0 : room.unread }
    })
  }, [state, sent, readRooms])

  const markRead = useCallback((orderId: string) => {
    setReadRooms((previous) => new Set(previous).add(orderId))
  }, [])

  const send = useCallback(
    async (orderId: string, role: ChatRole, text: string) => {
      const message = await run(orderId, role, text)
      if (!message) return false
      const key = keyOf(orderId, role)
      setSent((previous) => ({ ...previous, [key]: [...(previous[key] ?? []), message] }))
      return true
    },
    [run],
  )

  return { state, retry, rooms, markRead, send, sending: pending, sendError: error }
}
