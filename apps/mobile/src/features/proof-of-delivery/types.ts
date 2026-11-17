import type { TripStatus } from '@/features/trips';

/** "Cargo received" answer on Driver — Proof of delivery. */
export type CargoCondition = 'All received' | 'Some missing' | 'Damaged';

export type PodPhotoSource = 'camera' | 'library';

/** A delivery photo (cargo at the store, signed delivery note…). */
export type PodPhoto = {
  id: string;
  /** Local file URI on the phone; the real API uploads this file. */
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  /** Null when the picker doesn't report the size. */
  fileSizeBytes: number | null;
  /** ISO date-time the photo was added. */
  capturedAt: string;
  source: PodPhotoSource;
};

/** Receiver signature drawn on the pad, kept as vector strokes. */
export type PodSignature = {
  /** One SVG path (`d`) per stroke, in pad coordinates. */
  paths: string[];
  /** Pad size the paths were drawn in, so the signature can be scaled or rendered to an image later. */
  padWidth: number;
  padHeight: number;
  /** ISO date-time of the last stroke. */
  signedAt: string;
};

/** What the driver has entered so far. Lives across Proof of delivery → Complete trip until submitted. */
export type PodDraft = {
  /** "Pradeep Kumara · Store keeper". */
  recipientName: string;
  cargoCondition: CargoCondition;
  photos: PodPhoto[];
  signature: PodSignature | null;
  notes: string;
  /** Ending odometer as typed on the keypad (digits only, may be empty). */
  endOdometerDigits: string;
};

/** Sent when the driver taps "Confirm and complete trip". */
export type PodSubmission = {
  tripId: string;
  recipientName: string;
  cargoCondition: CargoCondition;
  photos: PodPhoto[];
  signature: PodSignature | null;
  endOdometerKm: number;
  notes?: string;
  /** ISO date-time. */
  submittedAt: string;
};

export type PodSubmissionResult = {
  /** "POD-2208-1". */
  podId: string;
  tripId: string;
  submittedAt: string;
  /** The trip's status after the submission — "Completed". */
  tripStatus: TripStatus;
};
