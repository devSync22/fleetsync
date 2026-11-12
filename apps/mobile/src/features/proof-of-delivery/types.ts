import type { TripStatus } from '@/features/trips';
import type { PhotoSource, PickedPhoto } from '@/hooks/usePhotoPicker';

/** "Cargo received" answer on Driver — Proof of delivery. */
export type CargoCondition = 'All received' | 'Some missing' | 'Damaged';

export type PodPhotoSource = PhotoSource;

/** A delivery photo (cargo at the store, signed delivery note…). */
export type PodPhoto = PickedPhoto;

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

/** What the driver has entered on Proof of delivery. Kept until it is sent, so going back loses nothing. */
export type PodDraft = {
  /** "Pradeep Kumara · Store keeper". */
  recipientName: string;
  cargoCondition: CargoCondition;
  photos: PodPhoto[];
  signature: PodSignature | null;
  notes: string;
};

/** Sent when the driver taps "Continue" on Proof of delivery; the trip becomes Delivered. */
export type PodSubmission = {
  tripId: string;
  recipientName: string;
  cargoCondition: CargoCondition;
  photos: PodPhoto[];
  signature: PodSignature | null;
  notes?: string;
  /** ISO date-time. */
  submittedAt: string;
};

export type PodSubmissionResult = {
  /** "POD-2208-1". */
  podId: string;
  tripId: string;
  submittedAt: string;
  /** The trip's status after the submission — "Delivered". */
  tripStatus: TripStatus;
};
