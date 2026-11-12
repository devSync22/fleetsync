import type { StaffRole } from '@/features/auth/types';

/**
 * Mock event source until the backend pushes (KAN-349). Values match the Figma frame 298:7543 (TRP-2208
 * assigned to Kasun). Chat notifications come from the chat mock's replies, not from here.
 */

/**
 * Switch to see each trip notification in Expo Go (after a driver signs in):
 * - 'default'        — "New trip assigned · TRP-2208" after 10 s
 * - 'tripCancelled'  — the same, then "Trip cancelled · TRP-2208" after 20 s
 */
export type NotificationMockScenario = 'default' | 'tripCancelled';
export const NOTIFICATION_MOCK_SCENARIO: NotificationMockScenario = 'default';

const NEW_TRIP_AFTER_MS = 10_000;
const CANCEL_AFTER_MS = 20_000;

export type MockEvent = { type: 'trip_assigned' | 'trip_cancelled' | 'trip_updated'; tripId: string };

/** Starts the mock events for the signed-in user. Returns a stop function (sign-out). */
export function startMockEvents(role: StaffRole, listener: (event: MockEvent) => void): () => void {
  if (role !== 'driver') return () => undefined;
  const timers = [setTimeout(() => listener({ type: 'trip_assigned', tripId: 'TRP-2208' }), NEW_TRIP_AFTER_MS)];
  if (NOTIFICATION_MOCK_SCENARIO === 'tripCancelled') {
    timers.push(setTimeout(() => listener({ type: 'trip_cancelled', tripId: 'TRP-2208' }), CANCEL_AFTER_MS));
  }
  return () => timers.forEach(clearTimeout);
}
