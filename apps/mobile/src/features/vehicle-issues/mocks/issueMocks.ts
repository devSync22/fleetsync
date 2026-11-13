import type { VehicleIssue } from '../types';

/**
 * Switch to test the report screen in Expo Go:
 * - 'default'   — reports are accepted
 * - 'failFirst' — the first Send report fails (error banner, nothing lost), the retry works
 * - 'error'     — every request fails
 */
export type MockIssueScenario = 'default' | 'failFirst' | 'error';
export const MOCK_ISSUE_SCENARIO: MockIssueScenario = 'default';

const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/**
 * Issues reported while the app is running (in memory only — reloading the app resets them).
 * Seeded with one resolved issue on TRP-2181 (an older trip in Trip history, which counts it as Issues 1).
 */
export const mockIssues: VehicleIssue[] = [
  {
    id: 'ISS-0398',
    tripId: 'TRP-2181',
    vehicleId: 'veh-4521',
    vehiclePlate: 'WP LB-4521',
    reportedBy: { id: 'usr-drv-014', name: 'Kasun Jayasinghe' },
    type: 'Lights',
    severity: 'Can continue',
    description: 'Left brake light not working. Noticed at the Ratnapura stop.',
    photoUris: [],
    status: 'Resolved',
    createdAt: daysAgo(9),
  },
];
