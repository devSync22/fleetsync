import type { DomainStatus } from '@/components/shared/statusTones'

export type ChatRole = 'customer' | 'driver' | 'mechanic'

export interface ChatPerson {
  role: ChatRole
  name: string
  initials: string
  /** "Customer · Kandy Builders", "Driver · CP LF-2210", "Mechanic · MEC-009". */
  detail: string
  phone: string | null
}

export interface ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  day: string
  time: string
  /** Shown as "· Seen" under the coordinator's last message. */
  seen?: boolean
}

/** Every order has one room; the driver and mechanic join once a trip exists. */
export interface ChatRoom {
  orderId: string
  tripId: string | null
  customerName: string
  route: string
  status: DomainStatus
  lastActivity: string
  unread: number
  people: ChatPerson[]
  /** Conversation with each person in the room, oldest first. */
  messages: Partial<Record<ChatRole, ChatMessage[]>>
}
