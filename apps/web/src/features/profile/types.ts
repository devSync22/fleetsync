export type ProfileDetails = {
  fullName: string
  workEmail: string
  mobile: string
  officePhone: string
  address: string
}

export type ProfileField = keyof ProfileDetails

export type Profile = {
  initials: string
  roleLabel: string
  employeeId: string
  memberSince: string
  details: ProfileDetails
}

export type ChangeRequest = {
  id: string
  field: ProfileField
  newValue: string
  status: 'pending-review' | 'approved' | 'rejected'
  /** e.g. "submitted today" or "8 Oct · approved by Ayesha Silva". */
  note: string
}

export type SignInEvent = {
  id: string
  when: string
  description: string
  outcome: 'success' | 'wrong-password' | 'password-changed'
}

export type DeviceSession = {
  id: string
  device: string
  kind: 'desktop' | 'mobile'
  location: string
  lastActive: string
  current: boolean
}

export type Security = {
  passwordLastChanged: string
  lastSignIn: string
  signIns: SignInEvent[]
  sessions: DeviceSession[]
  /** Set after a password change: "today at 11:50" and the devices that were signed out. */
  passwordChange: { at: string; signedOut: string[] } | null
}

export type ProfileOverview = {
  profile: Profile
  changeRequests: ChangeRequest[]
  security: Security
}
