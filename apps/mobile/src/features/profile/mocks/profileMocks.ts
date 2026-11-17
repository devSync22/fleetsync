import { toIsoDate } from '../licence';
import type { DriverProfile } from '../types';

/**
 * Mock profiles keyed by user ID (users in `features/auth/mocks/authMocks.ts`).
 * - Kasun (DRV-014): copied from "Driver — Profile".
 * - Ruwan (DRV-021): licence expires 24 days from today, so "Driver — Profile (Licence expiring)" always shows.
 */

function todayAt(hours: number, minutes: number) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

function inDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function createMockProfiles(): DriverProfile[] {
  return [
    {
      userId: 'usr-drv-014',
      mobile: '077 302 6618',
      address: 'Kadawatha',
      status: 'Active',
      memberSince: '2023-03-01',
      licence: { number: 'B3318772', className: 'Heavy vehicle', expiresOn: '2028-08-14' },
      pendingRenewal: null,
      changeRequests: [{ id: 'chg-0042', title: 'Mobile number change', sentAt: '2026-10-15', status: 'Approved' }],
      lastSignIn: { at: todayAt(7, 52), device: 'this phone' },
    },
    {
      userId: 'usr-drv-021',
      mobile: '071 448 2093',
      address: 'Gampaha',
      status: 'Active',
      memberSince: '2024-06-01',
      licence: { number: 'B4471209', className: 'Heavy vehicle', expiresOn: inDays(24) },
      pendingRenewal: null,
      changeRequests: [],
      lastSignIn: { at: todayAt(7, 40), device: 'this phone' },
    },
  ];
}
