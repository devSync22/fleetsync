/** The two roles that use the mobile app. Other roles sign in on the website. */
export type StaffRole = 'driver' | 'mechanic';

/** The signed-in driver or mechanic. */
export type AuthUser = {
  id: string;
  name: string;
  role: StaffRole;
  /** Driver or mechanic ID, e.g. "DRV-014", "MEC-012". Not sent by the API yet (staff management isn't built). */
  staffId?: string;
  email: string;
  /** Not sent by the API yet, like `staffId`. */
  depot?: string;
};

export type SignInCredentials = {
  email: string;
  password: string;
};

export type Session = {
  /** Short-lived access token (JWT, 15 minutes), sent as "Authorization: Bearer". */
  token: string;
  /** Single-use refresh token; swapped for a new session when the access token expires. */
  refreshToken: string;
  user: AuthUser;
};

export type LicenceClass = 'light' | 'heavy';

/** A file attached to an account request (NIC copy, driving licence). */
export type AccountDocument = {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  sizeBytes: number;
};

/** "Request an account" form values. */
export type AccountRequestForm = {
  role: StaffRole | null;
  fullName: string;
  nic: string;
  email: string;
  mobile: string;
  /** Driver only. */
  licenceNumber: string;
  /** Driver only. */
  licenceClass: LicenceClass | null;
  documents: AccountDocument[];
  confirmed: boolean;
};

/** What the server returns after a request is sent ("Request sent" frame). */
export type AccountRequest = {
  requestId: string;
  role: StaffRole;
  fullName: string;
  sentAt: string;
};

/** An approved request, opened from the approval email ("Account approved" frame). */
export type AccountApproval = {
  requestId: string;
  role: StaffRole;
  fullName: string;
  staffId: string;
  depot: string;
  signInEmail: string;
  approvedBy: string;
  sentAt: string;
  reviewedAt: string;
  approvedAt: string;
};

export type ActivateAccountInput = {
  requestId: string;
  password: string;
};
