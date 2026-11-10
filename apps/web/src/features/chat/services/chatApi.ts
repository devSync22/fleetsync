import { ApiError } from '@/services/apiClient'
import { chatRoomsMock } from '../mocks/chatMock'
import type { ChatMessage, ChatRole, ChatRoom } from '../types'

/*
 * Mocked until the chat endpoints exist:
 *   getChatRooms    → apiClient.get<ChatRoom[]>('/coordinator/chat/rooms')
 *   sendChatMessage → apiClient.post<ChatMessage>(`/coordinator/chat/rooms/${orderId}/${role}/messages`, { text })
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */

function scenario() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  if (scenario() === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return scenario() === 'empty' ? [] : chatRoomsMock
}

let nextId = 1

export async function sendChatMessage(orderId: string, role: ChatRole, text: string): Promise<ChatMessage> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  if (!text.trim()) throw new ApiError('Write a message before sending.', 400)
  return {
    id: `sent-${orderId}-${role}-${nextId++}`,
    from: 'me',
    text: text.trim(),
    day: 'Today',
    time: new Date().toTimeString().slice(0, 5),
  }
}
