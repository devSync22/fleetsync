import { recordTripIssue, type Trip } from '@/features/trips';
import { ApiError } from '@/services/apiClient';

import { MOCK_ISSUE_SCENARIO, mockIssues } from '../mocks/issueMocks';
import type { IssueReport, VehicleIssue } from '../types';
import { validateDescription, validateIssueType, validateSeverity } from '../validation';

/**
 * Vehicle issues service. Returns mock data behind the async signature the real API will use, so switching
 * to the backend only changes this file:
 * - POST /trips/{tripId}/issues   multipart: type, severity, description + photos → VehicleIssue
 * - GET  /driver/issues                                                           → VehicleIssue[]
 * The backend takes the vehicle from the trip and the reporter from the sign-in token.
 */

const MOCK_LATENCY_MS = 900;
let mockAttempts = 0;

/** `isReport`: only Send report counts towards 'failFirst', so loading Home doesn't use up the failure. */
async function mockRequest(isReport: boolean) {
  await new Promise<void>((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  if (isReport) mockAttempts += 1;
  if (MOCK_ISSUE_SCENARIO === 'error' || (isReport && MOCK_ISSUE_SCENARIO === 'failFirst' && mockAttempts === 1)) {
    throw new ApiError('Check your connection and try again.');
  }
}

/** Sends a report for the trip's vehicle. Throws TripCancelledError (409) if the coordinator cancelled the trip. */
export async function reportIssue(
  trip: Trip,
  report: IssueReport,
  reportedBy: VehicleIssue['reportedBy'],
): Promise<VehicleIssue> {
  await mockRequest(true);
  // Checks the server will also make.
  const error = validateIssueType(report.type) ?? validateSeverity(report.severity) ?? validateDescription(report.description);
  if (error) throw new ApiError(error, 422);

  // Mock only: the backend links the issue to the trip itself.
  await recordTripIssue(trip.id);

  const issue: VehicleIssue = {
    id: `ISS-${String(400 + mockIssues.length).padStart(4, '0')}`,
    tripId: trip.id,
    vehicleId: trip.vehicle.id,
    vehiclePlate: trip.vehicle.plate,
    reportedBy,
    type: report.type,
    severity: report.severity,
    description: report.description.trim(),
    photoUris: report.photos.map((photo) => photo.uri),
    status: 'Reported',
    odometerKm: trip.startOdometerKm,
    createdAt: new Date().toISOString(),
  };
  mockIssues.unshift(issue);
  return issue;
}

/** Issues reported by this driver, newest first. */
export async function getIssuesForDriver(driverId: string): Promise<VehicleIssue[]> {
  await mockRequest(false);
  return mockIssues.filter((issue) => issue.reportedBy.id === driverId);
}
