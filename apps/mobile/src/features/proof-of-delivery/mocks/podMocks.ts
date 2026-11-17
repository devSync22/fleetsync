import type { PodSubmission } from '../types';

/**
 * Switch to see the submit states of Driver — Complete trip in Expo Go:
 * - 'default'    — submission succeeds after a short delay
 * - 'failFirst'  — the first attempt fails (error banner + Try again), the retry succeeds
 * - 'error'      — every attempt fails
 */
export type MockPodScenario = 'default' | 'failFirst' | 'error';
export const MOCK_POD_SCENARIO: MockPodScenario = 'default';

/** Submissions accepted while the app is running (in memory only — reloading the app clears them). */
export const mockPodSubmissions: PodSubmission[] = [];
