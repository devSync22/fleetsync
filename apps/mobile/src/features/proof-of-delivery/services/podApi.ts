import { recordTripCompleted } from '@/features/trips';
import { ApiError } from '@/services/apiClient';

import { MOCK_POD_SCENARIO, mockPodSubmissions } from '../mocks/podMocks';
import type { PodSubmission, PodSubmissionResult } from '../types';
import { validateRecipientName } from '../validation';

/**
 * Proof-of-delivery service. Returns mock results behind the async signature the real API will use
 * (KAN-315 / KAN-317: POST /trips/{tripId}/proof-of-delivery as multipart — photos as files, the
 * signature as an image, the rest as fields). Switching to the backend only changes this file.
 */

const MOCK_LATENCY_MS = 1200;
let mockAttempts = 0;

export async function submitProofOfDelivery(submission: PodSubmission): Promise<PodSubmissionResult> {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  mockAttempts += 1;

  if (MOCK_POD_SCENARIO === 'error' || (MOCK_POD_SCENARIO === 'failFirst' && mockAttempts === 1)) {
    throw new ApiError('Check your connection and try again.');
  }

  // Checks the server will also make.
  const nameError = validateRecipientName(submission.recipientName);
  if (nameError) {
    throw new ApiError(nameError, 400);
  }
  // Mock only: the backend marks the trip Completed itself when it accepts the proof of delivery.
  const trip = await recordTripCompleted(submission.tripId, {
    completedAt: submission.submittedAt,
    endOdometerKm: submission.endOdometerKm,
  });

  mockPodSubmissions.push(submission);
  return {
    podId: `POD-${submission.tripId.replace('TRP-', '')}-${mockPodSubmissions.length}`,
    tripId: submission.tripId,
    submittedAt: submission.submittedAt,
    tripStatus: trip.status,
  };
}
