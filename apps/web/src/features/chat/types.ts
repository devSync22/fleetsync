import type { DomainStatus } from '@/components/shared/statusTones'

export type ChatRole = 'coordinator' | 'customer' | 'driver' | 'mechanic'

export interface ChatPerson {
  id: string
  role: ChatRole
  name: string
  initials: string
  /** "Customer · Kandy Builders", "Driver · CP LF-2210", "Coordinator". */
  detail: string
  phone: string | null
}

export type MessageStatus = 'sending' | 'sent' | 'seen' | 'failed'

export interface ChatMessage {
  id: string
  senderId: string
  text: string
  /** ISO date-time. */
  sentAt: string
  status: MessageStatus
}

/** Every order has one room; the driver and mechanic join once a trip exists. */
export interface ChatRoom {
  orderId: string
  tripId: string | null
  customerName: string
  route: string
  status: DomainStatus
  /** "Trip in progress · started 08:15" — shown to the customer under the route. */
  statusNote?: string
  /** Unseen messages to the signed-in user, across their threads in this room. */
  unread: number
  /** Latest message in any of the signed-in user's threads in this room. */
  lastMessage: { withId: string; senderId: string; senderName: string; text: string; sentAt: string } | null
}

/** The signed-in user. */
export interface ChatViewer {
  id: string
  role: ChatRole
}

/** A new or updated message in one of the viewer's threads (`withId` is the other person). */
export interface ChatEvent {
  orderId: string
  withId: string
  message: ChatMessage
}

/** What the chat page needs from the backend. Mocked today; a SignalR client implements it later. */
export interface ChatService {
  getRooms(): Promise<ChatRoom[]>
  /** People in the room the viewer may message (see canMessage). */
  getParticipants(orderId: string): Promise<ChatPerson[]>
  /** The 1-to-1 thread between the viewer and one person, oldest first. */
  getThread(orderId: string, personId: string): Promise<ChatMessage[]>
  sendMessage(orderId: string, personId: string, text: string): Promise<ChatMessage>
  /** Marks that person's messages to the viewer as seen. */
  markSeen(orderId: string, personId: string): Promise<void>
  /** Live new messages and status changes. Returns an unsubscribe function. */
  onMessage(listener: (event: ChatEvent) => void): () => void
}
