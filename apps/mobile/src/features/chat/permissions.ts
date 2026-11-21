import type { TripStatus } from '@/features/trips';

import type { ChatRole } from './types';

/**
 * Who may message whom — the one place for chat permissions (from the use case diagram):
 * - Driver: only the Operational Coordinator and the Mechanic on the same trip.
 * - Mechanic: only the Operational Coordinator and the Driver on the same trip.
 * - Drivers and mechanics never chat with the Customer.
 * "Same trip" holds because a room only contains the people assigned to that order's trip.
 * Coordinator and customer chat happens in the web app, so they have no mobile rules here.
 */
const ALLOWED: Record<ChatRole, readonly ChatRole[]> = {
  driver: ['coordinator', 'mechanic'],
  mechanic: ['coordinator', 'driver'],
  coordinator: [],
  customer: [],
};

export function canMessage(currentUserRole: ChatRole, participantRole: ChatRole): boolean {
  return ALLOWED[currentUserRole].includes(participantRole);
}

/** A room for a Completed or Cancelled trip is read-only: history stays, sending is blocked. */
export function isRoomReadOnly(tripStatus: TripStatus): boolean {
  return tripStatus === 'Completed' || tripStatus === 'Cancelled';
}
