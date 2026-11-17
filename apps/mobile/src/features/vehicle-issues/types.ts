import type { PickedPhoto } from '@/hooks/usePhotoPicker';

/** "What is the problem?" choices on Driver — Report vehicle issue. */
export type IssueType = 'Tyres' | 'Brakes' | 'Engine' | 'Electrical' | 'Cooling unit' | 'Lights' | 'Body damage' | 'Other';

/** "Can you keep driving?": Can continue = "Yes, carefully"; Stopped = "No, I have stopped" (needs help now). */
export type IssueSeverity = 'Can continue' | 'Stopped';

/** Reported by the driver; the mechanic moves it to In progress and Resolved (mechanic module). */
export type IssueStatus = 'Reported' | 'In progress' | 'Resolved';

/** A vehicle problem reported during a trip. Linked to the trip and to the trip's vehicle. */
export type VehicleIssue = {
  /** "ISS-0412". */
  id: string;
  /** "TRP-2208". */
  tripId: string;
  /** The vehicle on that trip (from the trip assignment, never fixed per driver). */
  vehicleId: string;
  /** "WP LB-7702". */
  vehiclePlate: string;
  reportedBy: { id: string; name: string };
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  /** Local photo URIs in the mock; the real API returns uploaded photo URLs. */
  photoUris: string[];
  status: IssueStatus;
  /** Last odometer reading recorded on the trip, in km. */
  odometerKm?: number;
  /** ISO date-time. */
  createdAt: string;
};

/** What the driver sends from the Report vehicle issue form. */
export type IssueReport = {
  tripId: string;
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  photos: PickedPhoto[];
};
