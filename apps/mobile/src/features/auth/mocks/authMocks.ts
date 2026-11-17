import type { AccountApproval, AuthUser } from '../types';

/**
 * Mock data copied from the Figma frames:
 * - Kasun Jayasinghe — "Driver — Profile" / "Mobile — Sign in"
 * - Ishara Bandara — "Mechanic — Profile"
 * - Ruwan Silva — not in the frames: a second driver whose licence expires soon ("Driver — Profile (Licence expiring)")
 * - Tharindu Wijesinghe — "Mobile — Request account / Request sent / Account approved"
 */

/** Password for the mock accounts (not in the design — any password meeting the rules would do). */
export const MOCK_PASSWORD = 'FleetSync1';

export type MockAccount = {
  user: AuthUser;
  password: string;
};

export const mockAccounts: MockAccount[] = [
  {
    password: MOCK_PASSWORD,
    user: {
      id: 'usr-drv-014',
      name: 'Kasun Jayasinghe',
      role: 'driver',
      staffId: 'DRV-014',
      email: 'kasun.j@fleetms.lk',
      depot: 'Colombo depot',
    },
  },
  {
    password: MOCK_PASSWORD,
    user: {
      id: 'usr-drv-021',
      name: 'Ruwan Silva',
      role: 'driver',
      staffId: 'DRV-021',
      email: 'ruwan.s@fleetms.lk',
      depot: 'Colombo depot',
    },
  },
  {
    password: MOCK_PASSWORD,
    user: {
      id: 'usr-mec-012',
      name: 'Ishara Bandara',
      role: 'mechanic',
      staffId: 'MEC-012',
      email: 'ishara.b@fleetms.lk',
      depot: 'Colombo depot',
    },
  },
];

/** First request ID handed out; later requests count up from here. */
export const FIRST_REQUEST_NUMBER = 118;
export const REQUEST_ID_PREFIX = 'APP-2026-';

/** New staff IDs given on approval (DRV-036 is in the "Account approved" frame). */
export const NEXT_STAFF_IDS = {
  driver: 'DRV-036',
  mechanic: 'MEC-013',
} as const;

export const APPROVED_BY = 'Ayesha · Fleet Administrator';
export const APPROVED_DEPOT = 'Colombo depot';
export const STAFF_EMAIL_DOMAIN = 'fms.lk';

/** The approval shown in the "Account approved" frame, used when the request isn't in memory. */
export const mockApproval: AccountApproval = {
  requestId: 'APP-2026-0118',
  role: 'driver',
  fullName: 'Tharindu Wijesinghe',
  staffId: 'DRV-036',
  depot: APPROVED_DEPOT,
  signInEmail: 'tharindu.w@fms.lk',
  approvedBy: APPROVED_BY,
  sentAt: '2026-10-17T10:12:00+05:30',
  reviewedAt: '2026-10-20T09:40:00+05:30',
  approvedAt: '2026-10-20T09:45:00+05:30',
};

/**
 * Password-reset links. `fleetsync://reset-password?token=demo-token&email=kasun.j@fleetms.lk`
 * is valid (for Kasun's account); any other token counts as expired.
 */
export const MOCK_RESET_TOKEN = 'demo-token';
export const mockResetTokens: Record<string, string> = {
  [MOCK_RESET_TOKEN]: 'kasun.j@fleetms.lk',
};
