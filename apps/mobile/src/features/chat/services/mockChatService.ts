import { getTrip, type TripStatus } from '@/features/trips';
import { ApiError } from '@/services/apiClient';

import {
  CHAT_MOCK_SCENARIO,
  MOCK_FAIL_TAG,
  createMockMessages,
  mockReplies,
  mockRooms,
  threadIdFor,
  type MockRoom,
} from '../mocks/chatMocks';
import { canMessage, isRoomReadOnly } from '../permissions';
import type { ChatRoom, ChatService, ChatUser, Message, Participant } from '../types';
import { validateMessage } from '../validation';

/**
 * In-memory stand-in for the chat hub. Behaves like the server: only returns rooms the user is in,
 * only allowed threads, rejects sends that break `canMessage` or go to a read-only room.
 * Reloading the app resets it.
 */

const LATENCY_MS = 400;
/** After you send: the other person reads it, then replies. */
const SEEN_AFTER_MS = 1200;
const REPLY_AFTER_MS = 2500;

let currentUser: ChatUser | null = null;
let messages: Message[] | null = null;
const listeners = new Set<(message: Message) => void>();
const timers = new Set<ReturnType<typeof setTimeout>>();
/** Messages tagged MOCK_FAIL_TAG that already failed once (the retry succeeds). */
const failedOnce = new Set<string>();

function store(): Message[] {
  messages ??= createMockMessages(new Date());
  return messages;
}

function save(message: Message) {
  const all = store();
  const index = all.findIndex((existing) => existing.id === message.id);
  if (index === -1) all.push(message);
  else all[index] = message;
  listeners.forEach((listener) => listener(message));
}

async function request(): Promise<ChatUser> {
  await new Promise<void>((resolve) => setTimeout(resolve, LATENCY_MS));
  if (CHAT_MOCK_SCENARIO === 'error') throw new ApiError('Check your connection and try again.');
  if (!currentUser) throw new ApiError('Chat is not connected.');
  return currentUser;
}

function later(ms: number, run: () => void) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    run();
  }, ms);
  timers.add(timer);
}

function roomsFor(user: ChatUser): MockRoom[] {
  if (CHAT_MOCK_SCENARIO === 'empty') return [];
  return mockRooms
    .map((room) =>
      // Mock only: the trips mock assigns every trip to whichever driver is signed in, so the room's
      // driver is the signed-in driver too (e.g. a newly approved account), not always Kasun.
      user.role === 'driver'
        ? { ...room, members: room.members.map((member) => (member.role === 'driver' ? { ...member, id: user.id } : member)) }
        : room,
    )
    .filter((room) => room.members.some((member) => member.id === user.id));
}

function findRoom(user: ChatUser, roomId: string): MockRoom {
  const room = roomsFor(user).find((candidate) => candidate.id === roomId);
  if (!room) throw new ApiError('This chat room doesn’t exist or you are not on its trip.', 404);
  return room;
}

function allowedParticipants(user: ChatUser, room: MockRoom): Participant[] {
  return room.members.filter((member) => member.id !== user.id && canMessage(user.role, member.role));
}

function findParticipant(user: ChatUser, room: MockRoom, participantId: string): Participant {
  const participant = allowedParticipants(user, room).find((member) => member.id === participantId);
  if (!participant) throw new ApiError('You can’t message this person.', 403);
  return participant;
}

// Mock only: the room's trip status comes from the trips mock, so it follows the driver's progress.
async function tripStatusOf(room: MockRoom): Promise<TripStatus> {
  if (CHAT_MOCK_SCENARIO === 'tripCompleted' && room.tripId === 'TRP-2208') return 'Completed';
  try {
    return (await getTrip(room.tripId)).status;
  } catch {
    return room.fallbackStatus;
  }
}

function threadMessages(threadId: string): Message[] {
  return store()
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt));
}

const isUnreadFor = (message: Message, userId: string) =>
  message.kind !== 'event' && message.senderId !== userId && message.status !== 'seen';

async function toChatRoom(user: ChatUser, room: MockRoom): Promise<ChatRoom> {
  const participants = allowedParticipants(user, room);
  const threadUnread: Record<string, number> = {};
  let lastMessage: Message | null = null;
  for (const participant of participants) {
    const thread = threadMessages(threadIdFor(room.id, user.id, participant.id));
    threadUnread[participant.id] = thread.filter((message) => isUnreadFor(message, user.id)).length;
    const last = thread[thread.length - 1];
    if (last && (!lastMessage || last.sentAt > lastMessage.sentAt)) lastMessage = last;
  }
  return {
    id: room.id,
    orderId: room.orderId,
    tripId: room.tripId,
    customerName: room.customerName,
    route: room.route,
    tripStatus: await tripStatusOf(room),
    participants,
    unreadCount: Object.values(threadUnread).reduce((sum, count) => sum + count, 0),
    threadUnread,
    lastMessage,
  };
}

function simulateReply(room: MockRoom, participant: Participant, sent: Message) {
  later(SEEN_AFTER_MS, () => {
    const current = store().find((message) => message.id === sent.id);
    if (current) save({ ...current, status: 'seen' });
  });
  later(REPLY_AFTER_MS, () =>
    save({
      id: `msg-${Date.now()}`,
      roomId: room.id,
      threadId: sent.threadId,
      senderId: participant.id,
      text: mockReplies[participant.role],
      sentAt: new Date().toISOString(),
      status: 'sent',
    }),
  );
}

export const mockChatService: ChatService = {
  async connect(user) {
    currentUser = user;
  },

  disconnect() {
    currentUser = null;
    timers.forEach(clearTimeout);
    timers.clear();
  },

  async getRooms() {
    const user = await request();
    const rooms = await Promise.all(roomsFor(user).map((room) => toChatRoom(user, room)));
    // Latest conversation first.
    return rooms.sort((a, b) => (b.lastMessage?.sentAt ?? '').localeCompare(a.lastMessage?.sentAt ?? ''));
  },

  async getThread(roomId, participantId) {
    const user = await request();
    const room = findRoom(user, roomId);
    findParticipant(user, room, participantId);
    const threadId = threadIdFor(room.id, user.id, participantId);
    return { threadId, messages: threadMessages(threadId) };
  },

  async sendMessage(roomId, participantId, text, clientId) {
    const user = await request();
    const room = findRoom(user, roomId);
    const participant = findParticipant(user, room, participantId);
    if (isRoomReadOnly(await tripStatusOf(room))) {
      throw new ApiError('This trip is closed. Chat is read-only.', 409);
    }
    const error = validateMessage(text);
    if (error) throw new ApiError(error, 422);
    if (text.includes(MOCK_FAIL_TAG) && !failedOnce.has(clientId)) {
      failedOnce.add(clientId);
      throw new ApiError('Message not sent. Check your connection.');
    }

    const message: Message = {
      id: clientId,
      roomId: room.id,
      threadId: threadIdFor(room.id, user.id, participant.id),
      senderId: user.id,
      text: text.trim(),
      sentAt: new Date().toISOString(),
      status: 'sent',
    };
    save(message);
    simulateReply(room, participant, message);
    return message;
  },

  async markSeen(roomId, participantId) {
    const user = await request();
    const room = findRoom(user, roomId);
    findParticipant(user, room, participantId);
    threadMessages(threadIdFor(room.id, user.id, participantId))
      .filter((message) => message.senderId === participantId && message.status !== 'seen')
      .forEach((message) => save({ ...message, status: 'seen' }));
  },

  onMessage(listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
