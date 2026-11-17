import { createMockTrips } from './mocks/tripMocks';
import { groupTripHistory, monthSummary, tripRowDistance } from './tripHistory';
import type { Trip } from './types';

const now = new Date(2026, 10, 16, 18, 0); // Mon 16 Nov 2026, 18:00
const base = createMockTrips(now)[0];

function trip(id: string, scheduledStart: Date, changes: Partial<Trip> = {}): Trip {
  return { ...base, id, status: 'Completed', scheduledStart: scheduledStart.toISOString(), issueCount: 0, ...changes };
}

const today = trip('TRP-1', new Date(2026, 10, 16, 9, 0));
const twoDaysAgo = trip('TRP-2', new Date(2026, 10, 14, 9, 0));
const sevenDaysAgo = trip('TRP-3', new Date(2026, 10, 9, 18, 0));
const tenDaysAgo = trip('TRP-4', new Date(2026, 10, 6, 9, 0));
const lastMonth = trip('TRP-5', new Date(2026, 9, 28, 9, 0));

describe('groupTripHistory', () => {
  it('groups trips into Today, This week (last 7 days) and Earlier', () => {
    const groups = groupTripHistory([today, twoDaysAgo, sevenDaysAgo, tenDaysAgo, lastMonth], now);
    expect(groups.map((group) => [group.title, group.trips.map((t) => t.id)])).toEqual([
      ['Today', ['TRP-1']],
      ['This week', ['TRP-2', 'TRP-3']],
      ['Earlier', ['TRP-4', 'TRP-5']],
    ]);
  });

  it('leaves out empty groups', () => {
    expect(groupTripHistory([tenDaysAgo], now).map((group) => group.title)).toEqual(['Earlier']);
  });

  it('returns no groups for no trips', () => {
    expect(groupTripHistory([], now)).toEqual([]);
  });
});

describe('monthSummary', () => {
  it('counts completed trips this month and adds up their distance', () => {
    const trips = [
      trip('A', new Date(2026, 10, 3), { distanceKm: 100 }),
      trip('B', new Date(2026, 10, 10), { distanceKm: 50 }),
      trip('C', new Date(2026, 10, 12), { status: 'Cancelled', distanceKm: 70 }),
      trip('D', new Date(2026, 9, 30), { distanceKm: 999 }),
    ];
    expect(monthSummary(trips, now)).toMatchObject({ tripCount: 2, distanceKm: 150 });
  });

  it('counts issues on every trip this month, including cancelled ones, but not last month', () => {
    const trips = [
      trip('A', new Date(2026, 10, 3), { issueCount: 1 }),
      trip('C', new Date(2026, 10, 12), { status: 'Cancelled', issueCount: 2 }),
      trip('D', new Date(2026, 9, 30), { issueCount: 5 }),
    ];
    expect(monthSummary(trips, now).issueCount).toBe(3);
  });

  it('is all zeros with no trips', () => {
    expect(monthSummary([], now)).toEqual({ tripCount: 0, distanceKm: 0, issueCount: 0 });
  });
});

describe('tripRowDistance', () => {
  it('shows "—" for a cancelled trip', () => {
    expect(tripRowDistance(trip('X', now, { status: 'Cancelled' }))).toBe('—');
  });
});
