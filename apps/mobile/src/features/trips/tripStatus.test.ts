import { createMockTrips } from './mocks/tripMocks';
import { canStartTrip, isActiveTrip, isHeadingToDestination, isLateToStart, tripBadgeLabel } from './tripStatus';
import type { Trip, TripStatus } from './types';

const now = new Date(2026, 10, 16, 8, 0); // Mon 16 Nov 2026, 08:00
const todayAt = (hours: number, minutes = 0) => new Date(2026, 10, 16, hours, minutes).toISOString();

/** TRP-2208 from the mocks, scheduled today at 09:30, with any field changed. */
function trip(changes: Partial<Trip> = {}): Trip {
  return { ...createMockTrips(now)[0], scheduledStart: todayAt(9, 30), ...changes };
}

const ALL_STATUSES: TripStatus[] = ['Assigned', 'Started', 'Picked up', 'In progress', 'Delivered', 'Completed', 'Cancelled'];

describe('canStartTrip', () => {
  it('allows an Assigned trip scheduled for today', () => {
    expect(canStartTrip(trip({ status: 'Assigned' }), now)).toBe(true);
  });

  it('blocks an Assigned trip scheduled for another day', () => {
    const tomorrow = new Date(2026, 10, 17, 9, 30).toISOString();
    expect(canStartTrip(trip({ status: 'Assigned', scheduledStart: tomorrow }), now)).toBe(false);
  });

  it.each(ALL_STATUSES.filter((status) => status !== 'Assigned'))('blocks a trip that is already %s', (status) => {
    expect(canStartTrip(trip({ status }), now)).toBe(false);
  });
});

describe('isActiveTrip', () => {
  it.each<[TripStatus, boolean]>([
    ['Assigned', false],
    ['Started', true],
    ['Picked up', true],
    ['In progress', true],
    ['Delivered', true],
    ['Completed', false],
    ['Cancelled', false],
  ])('%s → %s', (status, expected) => {
    expect(isActiveTrip(trip({ status }))).toBe(expected);
  });
});

describe('isHeadingToDestination (proof of delivery is next)', () => {
  it.each<[TripStatus, boolean]>([
    ['Started', false],
    ['Picked up', true],
    ['In progress', true],
    ['Delivered', false],
  ])('%s → %s', (status, expected) => {
    expect(isHeadingToDestination(trip({ status }))).toBe(expected);
  });
});

describe('isLateToStart', () => {
  it('is late when still Assigned after the start time', () => {
    expect(isLateToStart(trip({ status: 'Assigned', scheduledStart: todayAt(7, 30) }), now)).toBe(true);
  });

  it('is not late before the start time', () => {
    expect(isLateToStart(trip({ status: 'Assigned', scheduledStart: todayAt(9, 30) }), now)).toBe(false);
  });

  it('is not late once the trip has started', () => {
    expect(isLateToStart(trip({ status: 'Started', scheduledStart: todayAt(7, 30) }), now)).toBe(false);
  });
});

describe('tripBadgeLabel', () => {
  it('shows Started and Picked up as "In progress"', () => {
    expect(tripBadgeLabel('Started')).toBe('In progress');
    expect(tripBadgeLabel('Picked up')).toBe('In progress');
  });

  it('shows every other status as it is', () => {
    expect(tripBadgeLabel('Assigned')).toBe('Assigned');
    expect(tripBadgeLabel('Completed')).toBe('Completed');
  });
});
