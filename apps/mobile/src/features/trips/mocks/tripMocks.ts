import type { Trip, WeeklyStats } from '../types';

/**
 * Mock data copied from the Figma frames "Driver — Home", "Trip details", "Start trip", "Active trip",
 * "Cargo picked up" and "Complete trip": TRP-2208 (Colombo Pharma, ORD-1053, WP LB-7702, last reading
 * 84,210 km) and TRP-2207 (Hayleys Freight, WP LB-4521).
 *
 * Dates are built relative to the current day so "today", "upcoming" and the late-start banner
 * work whenever the app is opened: TRP-2208 starts today at 09:30, TRP-2207 in three days at 07:00
 * (Monday 19 Oct → Wed 22 Oct in the frames).
 *
 * Not in the frames (filled in to match): contact phone numbers, and TRP-2207's order ID,
 * addresses, contacts and cargo.
 */

/**
 * Switch to see each trip state in Expo Go (e.g. to test resuming mid-trip):
 * - 'default'        — TRP-2208 is Assigned: the full journey from Start trip
 * - 'started'        — started 09:41 at 84,236 km, heading to the pickup
 * - 'inProgress'     — cargo picked up 09:56, heading to the destination
 * - 'delivered'      — proof of delivery sent; only the ending odometer is left
 * - 'cancelMidTrip'  — like 'default', but the coordinator cancels the trip 20 s after it is started
 * - 'noTripToday'    — no trip today (empty state); upcoming trips and stats still load
 * - 'error'          — every request fails (error state with Retry)
 */
export type MockScenario = 'default' | 'started' | 'inProgress' | 'delivered' | 'cancelMidTrip' | 'noTripToday' | 'error';
export const MOCK_SCENARIO: MockScenario = 'default';

/** 'cancelMidTrip': how long after Start trip the coordinator cancels. */
export const MOCK_CANCEL_AFTER_MS = 20_000;

/** `daysFromToday` days from now at hh:mm local time, as an ISO string. */
function atDay(now: Date, daysFromToday: number, hours: number, minutes: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const coordinator = { id: 'usr-crd-003', name: 'Nimal Perera', role: 'Coordinator' } as const;
const mechanic = { id: 'usr-mec-012', name: 'Ishara Bandara', role: 'Mechanic', detail: 'MEC-012' } as const;

/**
 * Changes made while the app is running (trip started, cargo picked up, notes, completed…), applied on
 * top of the generated trips. In memory only: reloading the app resets the mocks.
 */
const tripUpdates = new Map<string, Partial<Trip>>();

export function saveMockTripUpdate(tripId: string, update: Partial<Trip>) {
  tripUpdates.set(tripId, { ...tripUpdates.get(tripId), ...update });
}

export function applyMockTripUpdates(trips: Trip[]): Trip[] {
  return trips.map((trip) => ({ ...trip, ...tripUpdates.get(trip.id) }));
}

type TodayProgress = Pick<Trip, 'status' | 'startedAt' | 'startOdometerKm' | 'pickedUpAt' | 'deliveredAt' | 'notes'>;

/** TRP-2208's progress for the chosen scenario, with the times and notes from the frames. */
function todayTripProgress(now: Date): TodayProgress {
  const started = { startedAt: atDay(now, 0, 9, 41), startOdometerKm: 84_236 };
  const gateNote = { id: 'note-1', text: 'At the warehouse gate. Waiting for the loading bay.', createdAt: atDay(now, 0, 9, 42) };
  const pickedUpNotes = [
    gateNote,
    { id: 'note-2', text: 'Loaded all 40 cool boxes. Seal number 22871.', createdAt: atDay(now, 0, 9, 55) },
    { id: 'note-3', text: 'Heavy traffic at Peliyagoda bridge. Moving slowly.', createdAt: atDay(now, 0, 10, 6) },
  ];
  switch (MOCK_SCENARIO) {
    case 'started':
      return { status: 'Started', ...started, notes: [gateNote] };
    case 'inProgress':
      return { status: 'In progress', ...started, pickedUpAt: atDay(now, 0, 9, 56), notes: pickedUpNotes };
    case 'delivered':
      return {
        status: 'Delivered',
        ...started,
        pickedUpAt: atDay(now, 0, 9, 56),
        deliveredAt: atDay(now, 0, 11, 16),
        notes: pickedUpNotes,
      };
    default:
      return { status: 'Assigned', notes: [] };
  }
}

/** All trips assigned to the signed-in driver (Kasun, DRV-014). */
export function createMockTrips(now: Date): Trip[] {
  return [
    {
      id: 'TRP-2208',
      orderId: 'ORD-1053',
      customerName: 'Colombo Pharma',
      ...todayTripProgress(now),
      scheduledStart: atDay(now, 0, 9, 30),
      deliverBy: atDay(now, 0, 12, 0),
      distanceKm: 38,
      pickup: {
        name: 'Colombo Pharma warehouse',
        shortName: 'Colombo Pharma',
        area: 'Colombo 10',
        address: 'No. 140, Sri Sangaraja Mawatha, Colombo 10',
        contactRole: 'Contact',
        contactName: 'Ruwini Fonseka',
        contactPhone: '+94771234567',
      },
      destination: {
        name: 'City Hospital store',
        shortName: 'City Hospital store',
        area: 'Negombo',
        address: 'Main Street, Negombo',
        contactRole: 'Receiver',
        contactName: 'Pradeep Kumara',
        contactPhone: '+94712345678',
      },
      vehicle: { id: 'veh-7702', plate: 'WP LB-7702', model: 'Isuzu Elf', capacityTonnes: 3.5, lastOdometerKm: 84_210 },
      cargo: {
        description: 'Medicines in 40 cool boxes',
        weightTonnes: 2.1,
        packageCount: 40,
        packageLabel: 'cool boxes',
        handling: ['Keep cool', 'Keep upright', 'Fragile'],
      },
      coordinatorNote: {
        authorName: 'Nimal',
        authorRole: 'coordinator',
        text: 'Unload at the side gate. Hospital store closes for lunch 12:00–13:00.',
      },
      people: [
        { id: 'usr-cus-041', name: 'Ruwini Fonseka', role: 'Customer', detail: 'Colombo Pharma' },
        mechanic,
        coordinator,
      ],
      issueCount: 1,
    },
    {
      id: 'TRP-2207',
      orderId: 'ORD-1050',
      customerName: 'Hayleys Freight',
      status: 'Assigned',
      scheduledStart: atDay(now, 3, 7, 0),
      deliverBy: atDay(now, 3, 10, 30),
      distanceKm: 94,
      pickup: {
        name: 'Hayleys Freight yard',
        shortName: 'Hayleys Freight',
        area: 'Kurunegala',
        address: 'No. 52, Puttalam Road, Kurunegala',
        contactRole: 'Contact',
        contactName: 'Chaminda Silva',
        contactPhone: '+94763456789',
      },
      destination: {
        name: 'Maradana distribution centre',
        shortName: 'Maradana distribution centre',
        area: 'Colombo 10',
        address: 'No. 310, Maradana Road, Colombo 10',
        contactRole: 'Receiver',
        contactName: 'Dilani Perera',
        contactPhone: '+94784567890',
      },
      vehicle: { id: 'veh-4521', plate: 'WP LB-4521', model: 'Isuzu Forward', capacityTonnes: 7, lastOdometerKm: 126_540 },
      cargo: {
        description: 'Packaged goods in 60 cartons',
        weightTonnes: 4.8,
        packageCount: 60,
        packageLabel: 'cartons',
        handling: ['Keep dry'],
      },
      people: [
        { id: 'usr-cus-052', name: 'Chaminda Silva', role: 'Customer', detail: 'Hayleys Freight' },
        mechanic,
        coordinator,
      ],
      notes: [],
      issueCount: 0,
    },
  ];
}

/** "This week: 3 trips · 412 km · 0 issues reported". */
export const mockWeeklyStats: WeeklyStats = {
  tripCount: 3,
  distanceKm: 412,
  issuesReported: 0,
};
