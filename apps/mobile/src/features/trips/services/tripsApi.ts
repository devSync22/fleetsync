import { formatDistance } from '@/lib/format';
import { ApiError } from '@/services/apiClient';

import {
  MOCK_CANCEL_AFTER_MS,
  MOCK_SCENARIO,
  applyMockTripUpdates,
  createMockTrips,
  mockWeeklyStats,
  saveMockTripUpdate,
} from '../mocks/tripMocks';
import { canStartTrip, isActiveTrip, isHeadingToDestination, isSameDay } from '../tripStatus';
import type { Trip, TripCompletion, TripLogNote, TripPickup, TripStart, TripStatus, WeeklyStats } from '../types';
import { validateHandedOverBy, validateSealNumber, validateStartOdometer, validateTripNote } from '../validation';

/**
 * Trips service for the signed-in driver. Every function returns mock data behind the async
 * signature the real API will use, so switching to the backend only changes this file:
 * - GET  /driver/trips/today, /driver/trips/upcoming, /driver/trips/history, /driver/stats/week, /trips/{id}
 * - POST /trips/{id}/start        { startOdometerKm, startedAt }               → Started
 * - POST /trips/{id}/pickup       multipart: fields + loading photos           → Picked up
 * - POST /trips/{id}/notes        { text }
 * - POST /trips/{id}/complete     { endOdometerKm, completedAt }               → Completed
 * (Delivered is set by POST /trips/{id}/proof-of-delivery in the proof-of-delivery feature.)
 * Every status change is rejected with 409 once the coordinator has cancelled the trip.
 */

/** The trip ID doesn't exist or isn't assigned to this driver. */
export class TripNotFoundError extends ApiError {
  constructor() {
    super('This trip doesn’t exist or isn’t assigned to you.', 404);
    this.name = 'TripNotFoundError';
  }
}

/** The coordinator cancelled the trip; no further actions are allowed. */
export class TripCancelledError extends ApiError {
  constructor() {
    super('The coordinator cancelled this trip.', 409);
    this.name = 'TripCancelledError';
  }
}

const MOCK_LATENCY_MS = 600;

async function mockRequest() {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  if (MOCK_SCENARIO === 'error') {
    throw new ApiError('Check your connection and try again.');
  }
}

function driverTrips(now: Date): Trip[] {
  const trips = applyMockTripUpdates(createMockTrips(now));
  if (MOCK_SCENARIO === 'noTripToday') {
    return trips.filter((trip) => !isSameDay(trip.scheduledStart, now));
  }
  return trips;
}

function findTrip(tripId: string): Trip {
  const trip = driverTrips(new Date()).find((candidate) => candidate.id === tripId);
  if (!trip) throw new TripNotFoundError();
  return trip;
}

/** Server-side status check for a change: cancelled → 409 TripCancelledError, wrong step → 409. */
function requireStatus(trip: Trip, allowed: (trip: Trip) => boolean, message: string) {
  if (trip.status === 'Cancelled') throw new TripCancelledError();
  if (!allowed(trip)) throw new ApiError(message, 409);
}

function saveAndReturn(trip: Trip, update: Partial<Trip>): Trip {
  saveMockTripUpdate(trip.id, update);
  return { ...trip, ...update };
}

const isOpen = (trip: Trip) => trip.status === 'Assigned' || isActiveTrip(trip);
const byStart = (a: Trip, b: Trip) => a.scheduledStart.localeCompare(b.scheduledStart);
/** Open trips first, then by start time — so a trip completed earlier today doesn't hide the next one. */
const openFirst = (a: Trip, b: Trip) => Number(isOpen(b)) - Number(isOpen(a)) || byStart(a, b);

/**
 * Today's trip: the open one (Assigned or mid-trip) if there is one, otherwise the trip completed
 * today (shown with its Completed badge). Cancelled trips are left out. Null when there is none.
 */
export async function getTodayTrip(): Promise<Trip | null> {
  await mockRequest();
  const now = new Date();
  return (
    driverTrips(now)
      .filter((trip) => trip.status !== 'Cancelled' && isSameDay(trip.scheduledStart, now))
      .sort(openFirst)[0] ?? null
  );
}

/** Assigned trips on later days, soonest first. */
export async function getUpcomingTrips(): Promise<Trip[]> {
  await mockRequest();
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return driverTrips(now)
    .filter((trip) => trip.status === 'Assigned' && new Date(trip.scheduledStart) > endOfToday)
    .sort(byStart);
}

/** Trip history: Completed and Cancelled trips, newest first (trips finished in the trip flow included). */
export async function getTripHistory(): Promise<Trip[]> {
  await mockRequest();
  return driverTrips(new Date())
    .filter((trip) => trip.status === 'Completed' || trip.status === 'Cancelled')
    .sort((a, b) => byStart(b, a));
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
  await mockRequest();
  return mockWeeklyStats;
}

export async function getTrip(tripId: string): Promise<Trip> {
  await mockRequest();
  return findTrip(tripId);
}

/** Start trip: Assigned (today) → Started, with the starting odometer. */
export async function startTrip(tripId: string, start: TripStart): Promise<Trip> {
  await mockRequest();
  const trip = findTrip(tripId);
  requireStatus(trip, (t) => canStartTrip(t, new Date()), 'This trip can’t be started now.');
  const odometerError = validateStartOdometer(String(start.startOdometerKm), trip.vehicle.lastOdometerKm);
  if (odometerError) throw new ApiError(odometerError, 422);

  if (MOCK_SCENARIO === 'cancelMidTrip') {
    // Mock only: stands in for the coordinator cancelling from the web app.
    setTimeout(
      () => saveMockTripUpdate(tripId, { status: 'Cancelled', cancelledAt: new Date().toISOString() }),
      MOCK_CANCEL_AFTER_MS,
    );
  }
  return saveAndReturn(trip, { status: 'Started', ...start });
}

/** Cargo picked up: Started → Picked up. */
export async function confirmPickup(tripId: string, pickup: TripPickup): Promise<Trip> {
  await mockRequest();
  const trip = findTrip(tripId);
  requireStatus(trip, (t) => t.status === 'Started', 'The cargo has already been picked up.');
  const fieldError = validateHandedOverBy(pickup.handedOverBy) ?? validateSealNumber(pickup.sealNumber ?? '');
  if (fieldError) throw new ApiError(fieldError, 422);
  return saveAndReturn(trip, { status: 'Picked up', pickedUpAt: pickup.pickedUpAt });
}

/** Adds a trip note (seen by the coordinator) while the trip is active. */
export async function addTripNote(tripId: string, text: string): Promise<TripLogNote> {
  await mockRequest();
  const trip = findTrip(tripId);
  requireStatus(trip, isActiveTrip, 'Notes can only be added during the trip.');
  const error = validateTripNote(text);
  if (error) throw new ApiError(error, 422);
  const note: TripLogNote = { id: `note-${Date.now()}`, text: text.trim(), createdAt: new Date().toISOString() };
  saveMockTripUpdate(tripId, { notes: [...trip.notes, note] });
  return note;
}

/**
 * Mock only: marks the trip Delivered when the proof-of-delivery service accepts a submission. With the
 * real API the backend does this itself, so this function is removed and screens just reload the trip.
 */
export async function recordTripDelivered(tripId: string, deliveredAt: string): Promise<TripStatus> {
  const trip = findTrip(tripId);
  requireStatus(trip, isHeadingToDestination, 'Proof of delivery can only be sent after the cargo is picked up.');
  return saveAndReturn(trip, { status: 'Delivered', deliveredAt }).status;
}

/**
 * Mock only: counts a vehicle issue on the trip when the vehicle-issues service accepts a report
 * ("Issues" on Complete trip and Trip history). With the real API the backend counts it; remove this then.
 */
export async function recordTripIssue(tripId: string): Promise<Trip> {
  const trip = findTrip(tripId);
  requireStatus(trip, isActiveTrip, 'Issues can only be reported during the trip.');
  return saveAndReturn(trip, { issueCount: trip.issueCount + 1 });
}

/** Complete trip: Delivered → Completed, with an ending odometer above the starting one. */
export async function completeTrip(tripId: string, completion: TripCompletion): Promise<Trip> {
  await mockRequest();
  const trip = findTrip(tripId);
  requireStatus(trip, (t) => t.status === 'Delivered', 'Send the proof of delivery before completing the trip.');
  if (trip.startOdometerKm !== undefined && completion.endOdometerKm <= trip.startOdometerKm) {
    throw new ApiError(`The ending odometer must be more than ${formatDistance(trip.startOdometerKm)}.`, 422);
  }
  return saveAndReturn(trip, { status: 'Completed', ...completion });
}
