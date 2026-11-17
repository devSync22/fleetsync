import { ApiError } from '@/services/apiClient';
import { formatDistance } from '@/lib/format';

import { MOCK_SCENARIO, applyMockTripUpdates, createMockTrips, mockWeeklyStats, saveMockTripUpdate } from '../mocks/tripMocks';
import { isSameDay } from '../tripTime';
import type { Trip, TripCompletion, WeeklyStats } from '../types';

/**
 * Trips service for the signed-in driver. Every function returns mock data behind the async
 * signature the real API will use (GET /driver/trips/today, /driver/trips/upcoming,
 * /driver/stats/week, /trips/{id}), so switching to the backend only changes this file.
 */

/** The trip ID doesn't exist or isn't assigned to this driver. */
export class TripNotFoundError extends ApiError {
  constructor() {
    super('This trip doesn’t exist or isn’t assigned to you.', 404);
    this.name = 'TripNotFoundError';
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

const isOpen = (trip: Trip) => trip.status === 'Assigned' || trip.status === 'In progress';
const byStart = (a: Trip, b: Trip) => a.scheduledStart.localeCompare(b.scheduledStart);
/** Open trips first, then by start time — so a trip completed earlier today doesn't hide the next one. */
const openFirst = (a: Trip, b: Trip) => Number(isOpen(b)) - Number(isOpen(a)) || byStart(a, b);

/**
 * Today's trip: the open one (Assigned or In progress) if there is one, otherwise the trip completed
 * today (shown with its Completed badge). Null when there is none.
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

export async function getWeeklyStats(): Promise<WeeklyStats> {
  await mockRequest();
  return mockWeeklyStats;
}

export async function getTrip(tripId: string): Promise<Trip> {
  await mockRequest();
  const trip = driverTrips(new Date()).find((candidate) => candidate.id === tripId);
  if (!trip) {
    throw new TripNotFoundError();
  }
  return trip;
}

/**
 * Marks an In-progress trip Completed. Mock only: the proof-of-delivery service calls it after a
 * successful submission. With the real API (KAN-315 / KAN-317) the backend completes the trip when it
 * accepts the proof of delivery, so this function is removed and screens simply reload the trip.
 * Runs the same checks the server will: the trip is In progress and the ending odometer is higher
 * than the starting one.
 */
export async function recordTripCompleted(tripId: string, completion: TripCompletion): Promise<Trip> {
  const trip = driverTrips(new Date()).find((candidate) => candidate.id === tripId);
  if (!trip) {
    throw new TripNotFoundError();
  }
  if (trip.status !== 'In progress') {
    throw new ApiError('This trip isn’t in progress any more, so it can’t be completed.', 409);
  }
  if (trip.startOdometerKm !== undefined && completion.endOdometerKm <= trip.startOdometerKm) {
    throw new ApiError(`The ending odometer must be more than ${formatDistance(trip.startOdometerKm)}.`, 422);
  }
  saveMockTripUpdate(tripId, { status: 'Completed', ...completion });
  return { ...trip, status: 'Completed', ...completion };
}
