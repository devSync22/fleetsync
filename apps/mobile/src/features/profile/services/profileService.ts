import { ApiError } from '@/services/apiClient';

import { daysUntil, RENEWAL_PHOTO_COUNT } from '../licence';
import { createMockProfiles } from '../mocks/profileMocks';
import type { DriverProfile, LicenceRenewalInput } from '../types';

/**
 * Profile service. Mock data behind the same async signatures the real API will use
 * (GET /me/profile, POST /me/licence-renewals), so switching to the backend only changes this file.
 */

const MOCK_LATENCY_MS = 600;

/** Testing: set to true to make the next profile load fail once (shows the error + Retry state). */
export const mockOptions = { failNextLoad: false };

// In-memory mock state (resets when the app reloads).
const profiles = new Map(createMockProfiles().map((profile) => [profile.userId, profile]));

function delay(ms = MOCK_LATENCY_MS) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function findProfile(userId: string): DriverProfile {
  const profile = profiles.get(userId);
  if (!profile) throw new ApiError('We couldn’t find your profile. Please try again later.', 404);
  return profile;
}

export async function getProfile(userId: string): Promise<DriverProfile> {
  await delay();
  if (mockOptions.failNextLoad) {
    mockOptions.failNextLoad = false;
    throw new ApiError('Check your connection and try again.', null);
  }
  // A copy, so screens never change the mock state directly.
  return JSON.parse(JSON.stringify(findProfile(userId))) as DriverProfile;
}

/**
 * Sends the renewed licence for a Fleet Administrator to approve (on the web).
 * shortcut: photos are not uploaded; switch to the team's Document module upload when it exists.
 */
export async function submitLicenceRenewal(userId: string, input: LicenceRenewalInput): Promise<void> {
  await delay();
  const profile = findProfile(userId);
  if (input.photos.length < RENEWAL_PHOTO_COUNT) {
    throw new ApiError('Add photos of the front and back of your licence.', 422);
  }
  if (daysUntil(input.newExpiresOn) <= 0 || input.newExpiresOn <= profile.licence.expiresOn) {
    throw new ApiError('The new expiry date must be later than your current one.', 422);
  }
  if (profile.pendingRenewal) {
    throw new ApiError('Your renewed licence is already waiting for review.', 409);
  }
  const sentAt = new Date().toISOString();
  profile.pendingRenewal = { sentAt, newExpiresOn: input.newExpiresOn };
  profile.changeRequests.unshift({ id: `chg-${Date.now()}`, title: 'Licence renewal', sentAt, status: 'Pending' });
}
