import type { StaffRole } from '@/features/auth/types';
import type { TripStatus } from '@/features/trips';

/** Everyone who can be in an order's chat room. Coordinators and customers use the web app. */
export type ChatRole = 'driver' | 'mechanic' | 'coordinator' | 'customer';

/** Someone in a chat room the signed-in user can message. */
export type Participant = {
  id: string;
  name: string;
  role: ChatRole;
  /** "Coordinator", "Mechanic", "Driver". */
  subtitle: string;
};

export type MessageStatus = 'sending' | 'sent' | 'seen' | 'failed';

export type Message = {
  id: string;
  roomId: string;
  threadId: string;
  senderId: string;
  text: string;
  /** ISO date-time. */
  sentAt: string;
  /** For the sender: whether it reached the server / was read. For the reader: `seen` once read. */
  status: MessageStatus;
  /** A trip event shown as a centred notice ("Issue reported 10:15 · Tyres"), not a chat bubble. */
  kind?: 'event';
};

/** One room per order. Inside it, a separate 1-to-1 thread with each participant. */
export type ChatRoom = {
  /** The order ID — one room per order. */
  id: string;
  orderId: string;
  tripId: string;
  /** Customer company, shown in the room title ("TRP-2208 · Colombo Pharma"). Never a chat participant. */
  customerName: string;
  /** "Colombo 10 → Negombo". */
  route: string;
  tripStatus: TripStatus;
  /** People the signed-in user may message in this room (filtered with `canMessage`). */
  participants: Participant[];
  /** Unread messages across all of the user's threads in this room. */
  unreadCount: number;
  /** Unread messages per thread, by participant ID. */
  threadUnread: Record<string, number>;
  lastMessage: Message | null;
};

export type ChatUser = {
  id: string;
  role: StaffRole;
};

export type ChatThread = {
  threadId: string;
  messages: Message[];
};

/**
 * The real-time chat connection. Screens and hooks only use this interface, so the mock can be
 * swapped for SignalR by changing `services/chatService.ts`.
 */
export interface ChatService {
  connect(user: ChatUser): Promise<void>;
  disconnect(): void;
  getRooms(): Promise<ChatRoom[]>;
  getThread(roomId: string, participantId: string): Promise<ChatThread>;
  /** `clientId` is the optimistic message's ID; resending a failed message reuses it. */
  sendMessage(roomId: string, participantId: string, text: string, clientId: string): Promise<Message>;
  /** Marks the participant's messages in this thread as read. */
  markSeen(roomId: string, participantId: string): Promise<void>;
  /** New messages and status changes (e.g. sent → seen). Returns an unsubscribe function. */
  onMessage(listener: (message: Message) => void): () => void;
}
