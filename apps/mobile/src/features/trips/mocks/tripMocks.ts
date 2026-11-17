import type { Trip, WeeklyStats } from '../types';

/**
 * Mock data copied from the Figma frames "Driver — Home" and "Driver — Trip details":
 * TRP-2208 (Colombo Pharma, ORD-1053, WP LB-7702) and TRP-2207 (Hayleys Freight, WP LB-4521).
 *
 * Dates are built relative to the current day so "today", "upcoming" and the late-start banner
 * work whenever the app is opened: TRP-2208 starts today at 09:30, TRP-2207 in three days at 07:00
 * (Monday 19 Oct → Wed 22 Oct in the frames).
 *
 * Not in the frames (filled in to match): contact phone numbers, and TRP-2207's order ID,
 * addresses, contacts and cargo.
 */

/**
 * Switch to see the other Home / Trip details states in Expo Go:
 * - 'default'      — the frames' data
 * - 'noTripToday'  — no trip today (empty state); upcoming trips and stats still load
 * - 'error'        — every request fails (error state with Retry)
 */
export type MockScenario = 'default' | 'noTripToday' | 'error';
export const MOCK_SCENARIO: MockScenario = 'default';

/** `daysFromToday` days from now at hh:mm local time, as an ISO string. */
function atDay(now: Date, daysFromToday: number, hours: number, minutes: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const coordinator = { id: 'usr-crd-003', name: 'Nimal Perera', role: 'Coordinator' } as const;
const mechanic = { id: 'usr-mec-012', name: 'Ishara Bandara', role: 'Mechanic', detail: 'MEC-012' } as const;

/** All trips assigned to the signed-in driver (Kasun, DRV-014). */
export function createMockTrips(now: Date): Trip[] {
  return [
    {
      id: 'TRP-2208',
      orderId: 'ORD-1053',
      customerName: 'Colombo Pharma',
      status: 'Assigned',
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
      vehicle: { id: 'veh-7702', plate: 'WP LB-7702', model: 'Isuzu Elf', capacityTonnes: 3.5 },
      cargo: {
        description: 'Medicines in 40 cool boxes',
        weightTonnes: 2.1,
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
      vehicle: { id: 'veh-4521', plate: 'WP LB-4521', model: 'Isuzu Forward', capacityTonnes: 7 },
      cargo: {
        description: 'Packaged goods in 60 cartons',
        weightTonnes: 4.8,
        handling: ['Keep dry'],
      },
      people: [
        { id: 'usr-cus-052', name: 'Chaminda Silva', role: 'Customer', detail: 'Hayleys Freight' },
        mechanic,
        coordinator,
      ],
    },
  ];
}

/** "This week: 3 trips · 412 km · 0 issues reported". */
export const mockWeeklyStats: WeeklyStats = {
  tripCount: 3,
  distanceKm: 412,
  issuesReported: 0,
};
