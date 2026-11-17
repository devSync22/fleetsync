import type { TripStatus } from '@/features/trips';

import type { ChatRole, ChatRoom, Message, Participant } from '../types';

/**
 * Mock chat data copied from the Figma frames "Driver — Chat" (174:6708) and "Mechanic — Chat" (180:7023):
 * room TRP-2208 · Colombo Pharma, Kasun ↔ Ishara thread 10:15–10:19. Rooms, trips and people match the
 * trips mocks (ORD-1053 / TRP-2208, ORD-1050 / TRP-2207, Nimal Perera, Ishara Bandara, Kasun Jayasinghe).
 * Not in the frames (filled in to match): the Nimal threads and the ORD-1050 messages.
 * Only allowed threads exist: driver ↔ coordinator, driver ↔ mechanic, mechanic ↔ coordinator.
 */

/**
 * Switch to see each state in Expo Go:
 * - 'default'        — two rooms with messages
 * - 'tripCompleted'  — TRP-2208 shows as Completed, so its room is read-only
 * - 'empty'          — no rooms ("Chats appear when a trip is assigned to you")
 * - 'error'          — every request fails (error state with Retry)
 * Any message containing MOCK_FAIL_TAG fails on the first try; "Tap to retry" then sends it.
 */
export type ChatMockScenario = 'default' | 'tripCompleted' | 'empty' | 'error';
export const CHAT_MOCK_SCENARIO: ChatMockScenario = 'default';
export const MOCK_FAIL_TAG = '#fail';

export const mockPeople = {
  nimal: { id: 'usr-crd-003', name: 'Nimal Perera', role: 'coordinator', subtitle: 'Coordinator' },
  ishara: { id: 'usr-mec-012', name: 'Ishara Bandara', role: 'mechanic', subtitle: 'Mechanic' },
  kasun: { id: 'usr-drv-014', name: 'Kasun Jayasinghe', role: 'driver', subtitle: 'Driver' },
} as const satisfies Record<string, Participant>;

/** Room fields the server stores; status, unread counts and last message are worked out per request. */
export type MockRoom = Pick<ChatRoom, 'id' | 'orderId' | 'tripId' | 'customerName' | 'route'> & {
  /** Everyone in the room. The customer is in the order's room on the web, but never in mobile threads. */
  members: Participant[];
  /** Used when the trips mock can't return the trip (e.g. its 'noTripToday' scenario). */
  fallbackStatus: TripStatus;
};

const { nimal, ishara, kasun } = mockPeople;

export const mockRooms: MockRoom[] = [
  {
    id: 'ORD-1053',
    orderId: 'ORD-1053',
    tripId: 'TRP-2208',
    customerName: 'Colombo Pharma',
    route: 'Colombo 10 → Negombo',
    members: [nimal, ishara, kasun],
    fallbackStatus: 'Assigned',
  },
  {
    id: 'ORD-1050',
    orderId: 'ORD-1050',
    tripId: 'TRP-2207',
    customerName: 'Hayleys Freight',
    route: 'Kurunegala → Colombo 10',
    members: [nimal, ishara, kasun],
    fallbackStatus: 'Assigned',
  },
];

/** One thread per pair of people in a room; the same ID whoever opens it. */
export function threadIdFor(roomId: string, a: string, b: string): string {
  return `${roomId}:${[a, b].sort().join('+')}`;
}

/** Simulated answer from the other person after you send. */
export const mockReplies: Record<ChatRole, string> = {
  coordinator: 'Noted, thanks. I will update the order.',
  mechanic: 'OK, noted. I will check it when the truck is back.',
  driver: 'OK, will do.',
  customer: '',
};

/** `daysFromToday` days from now at hh:mm local time, as an ISO string. */
function atDay(now: Date, daysFromToday: number, hours: number, minutes: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

export function createMockMessages(now: Date): Message[] {
  const kasunIshara = threadIdFor('ORD-1053', kasun.id, ishara.id);
  const kasunNimal = threadIdFor('ORD-1053', kasun.id, nimal.id);
  const isharaNimal = threadIdFor('ORD-1053', ishara.id, nimal.id);
  const hayleysKasunNimal = threadIdFor('ORD-1050', kasun.id, nimal.id);

  const message = (
    id: string,
    roomId: string,
    threadId: string,
    senderId: string,
    sentAt: string,
    text: string,
    status: Message['status'] = 'seen',
  ): Message => ({ id, roomId, threadId, senderId, text, sentAt, status });

  return [
    // Driver — Chat / Mechanic — Chat frames.
    {
      ...message('msg-1', 'ORD-1053', kasunIshara, 'system', atDay(now, 0, 10, 15), 'Issue reported 10:15 · Tyres · can continue carefully'),
      kind: 'event',
    },
    message('msg-2', 'ORD-1053', kasunIshara, ishara.id, atDay(now, 0, 10, 16), 'Saw your report. Is the tyre flat or just low?'),
    message('msg-3', 'ORD-1053', kasunIshara, kasun.id, atDay(now, 0, 10, 17), 'Just low. Warning light is on, still holding.'),
    message(
      'msg-4',
      'ORD-1053',
      kasunIshara,
      ishara.id,
      atDay(now, 0, 10, 18),
      'OK. Keep under 50 km/h. There is a tyre shop at Ja-Ela on your route if it gets worse. I will check it when you are back.',
    ),
    message('msg-5', 'ORD-1053', kasunIshara, kasun.id, atDay(now, 0, 10, 19), 'Thanks, will do.'),

    message('msg-6', 'ORD-1053', kasunNimal, nimal.id, atDay(now, 0, 8, 50), 'Morning Kasun. Unload at the side gate. Hospital store closes for lunch 12:00–13:00.'),
    message('msg-7', 'ORD-1053', kasunNimal, kasun.id, atDay(now, 0, 8, 52), 'OK sir, noted.'),

    message('msg-8', 'ORD-1053', isharaNimal, nimal.id, atDay(now, 0, 10, 20), 'Ishara, please check the tyres on WP LB-7702 when Kasun is back.', 'sent'),

    message(
      'msg-9',
      'ORD-1050',
      hayleysKasunNimal,
      nimal.id,
      atDay(now, -1, 16, 30),
      'Hayleys trip: pickup at the Kurunegala yard at 07:00. Bring the rain covers, the cartons must stay dry.',
      'sent',
    ),
  ];
}
