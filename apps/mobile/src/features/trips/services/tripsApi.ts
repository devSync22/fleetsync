import { ApiError } from '@/services/apiClient';

import { MOCK_SCENARIO, createMockTrips, mockWeeklyStats } from '../mocks/tripMocks';
import { isSameDay } from '../tripTime';
import type { Trip, WeeklyStats } from '../types';

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
  const trips = createMockTrips(now);
  if (MOCK_SCENARIO === 'noTripToday') {
    return trips.filter((trip) => !isSameDay(trip.scheduledStart, now));
  }
  return trips;
}

const isOpen = (trip: Trip) => trip.status === 'Assigned' || trip.status === 'In progress';
const byStart = (a: Trip, b: Trip) => a.scheduledStart.localeCompare(b.scheduledStart);

/** Today's open trip (Assigned or In progress), or null when there is none. */
export async function getTodayTrip(): Promise<Trip | null> {
  await mockRequest();
  const now = new Date();
  return driverTrips(now).filter((trip) => isOpen(trip) && isSameDay(trip.scheduledStart, now)).sort(byStart)[0] ?? null;
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
