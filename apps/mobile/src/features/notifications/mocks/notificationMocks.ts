import type { StaffRole } from '@/features/auth/types';
import type { Message } from '@/features/chat';

/**
 * Mock event source until the backend pushes (KAN-349). Values match the Figma frame 298:7543:
 * TRP-2208 assigned to Kasun, and Nimal Perera's message. Real chat replies come from the chat mock.
 */

export type MockEvent =
  | { kind: 'trip'; type: 'trip_assigned' | 'trip_cancelled' | 'trip_updated'; tripId: string }
  | { kind: 'chat'; message: Message };

/** How long after a driver signs in the "New trip assigned · TRP-2208" notification arrives. */
export const NEW_TRIP_AFTER_MS = 10_000;

const listeners = new Set<(event: MockEvent) => void>();
const timers = new Set<ReturnType<typeof setTimeout>>();

export function onMockEvent(listener: (event: MockEvent) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitMockEvent(event: MockEvent, afterMs = 0) {
  const timer = setTimeout(() => {
    timers.delete(timer);
    listeners.forEach((listener) => listener(event));
  }, afterMs);
  timers.add(timer);
}

/** Starts the automatic mock events for the signed-in user. Returns a stop function (sign-out). */
export function startMockEvents(role: StaffRole): () => void {
  if (role === 'driver') emitMockEvent({ kind: 'trip', type: 'trip_assigned', tripId: 'TRP-2208' }, NEW_TRIP_AFTER_MS);
  return () => {
    timers.forEach(clearTimeout);
    timers.clear();
  };
}

/** Nimal Perera (coordinator) in the ORD-1053 room — the message from the frame. */
export function mockCoordinatorMessage(userId: string): Message {
  const senderId = 'usr-crd-003';
  return {
    id: `mock-msg-${Date.now()}`,
    roomId: 'ORD-1053',
    // Same format as the chat mock's thread IDs; only carried in the payload.
    threadId: `ORD-1053:${[userId, senderId].sort().join('+')}`,
    senderId,
    text: 'Please call Ruwini at the warehouse gate when you reach.',
    sentAt: new Date().toISOString(),
    status: 'sent',
  };
}
