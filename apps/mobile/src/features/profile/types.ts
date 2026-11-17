import type { PickedPhoto } from '@/hooks/usePhotoPicker';

export type ChangeRequestStatus = 'Pending' | 'Approved' | 'Rejected';

/** A row under "My change requests". */
export type ChangeRequest = {
  id: string;
  /** "Mobile number change", "Licence renewal". */
  title: string;
  /** ISO date the request was sent. */
  sentAt: string;
  status: ChangeRequestStatus;
};

/** Set by the Fleet Administrator. Dates are "YYYY-MM-DD". */
export type DriverLicence = {
  number: string;
  /** "Heavy vehicle". */
  className: string;
  expiresOn: string;
};

/**
 * Driver details shown on Profile, on top of the signed-in user (name, staff ID, email, depot).
 * No vehicle: a driver's vehicle comes from each trip assignment.
 */
export type DriverProfile = {
  userId: string;
  mobile: string;
  address: string;
  /** Account status badge — "Active". */
  status: string;
  /** ISO date the driver joined ("Since Mar 2023"). */
  memberSince: string;
  licence: DriverLicence;
  /** A renewed licence waiting for a Fleet Administrator, or null. */
  pendingRenewal: { sentAt: string; newExpiresOn: string } | null;
  changeRequests: ChangeRequest[];
  lastSignIn: { at: string; device: string };
};

export type LicenceRenewalInput = {
  /** Front, then back. */
  photos: PickedPhoto[];
  /** "YYYY-MM-DD". */
  newExpiresOn: string;
};
