import type { Paged } from '@/lib/paging'

export type ApplicationStatus = 'pending-review' | 'approved' | 'rejected'
export type ApplicantType = 'staff' | 'company'
/** Roles people can apply for; Fleet Administrators and Owners are never applied for. */
export type RequestedRole = 'customer' | 'driver' | 'mechanic' | 'coordinator'

export type ApplicationDocument = {
  name: string
  /** "PDF · 1.2 MB" */
  meta: string
  status: 'verified' | 'not-checked'
}

export type LicencePhoto = {
  side: 'Front' | 'Back'
  fileName: string
  size: string
  /** Real photo URL once document storage exists; mock data has none and shows a placeholder. */
  url: string | null
}

/** Licence details the administrator types in after checking the photos. */
export type LicenceDetails = { licenceClass: string; licenceNumber: string; licenceExpiry: string }

export type AutomaticCheck = { label: string; passed: boolean }

export type TimelineEntry = { text: string; time: string; tone: 'accent' | 'success' | 'neutral' | 'danger' }

/** One row of the Applications list. */
export type ApplicationSummary = {
  applicationId: string
  name: string
  type: ApplicantType
  requestedRole: RequestedRole
  status: ApplicationStatus
  /** "2 days ago" + "17 Oct, 10:12" */
  submittedLabel: string
  submittedAt: string
  documentsUploaded: number
  documentsRequired: number
  /** Approved / rejected: "19 Oct, 14:05" and who decided. */
  decidedAt: string | null
  decidedBy: string | null
  /** Approved: the new account's ID (EMP-0161, CUS-0034, DRV-035…). */
  accountId: string | null
  /** Rejected: short reason shown in the list. */
  rejectReason: string | null
}

/** Everything the Review page shows. */
export type ApplicationDetail = ApplicationSummary & {
  fullName: string
  nic: string | null
  email: string
  mobile: string
  address: string
  /** Company applicants only. */
  company: { brNumber: string; contactName: string } | null
  /** Driver applicants only. */
  licencePhotos: LicencePhoto[]
  licence: LicenceDetails | null
  documents: ApplicationDocument[]
  checks: AutomaticCheck[]
  timeline: TimelineEntry[]
  internalNote: string
}

export type ApplicationTab = 'open' | 'approved' | 'rejected' | 'all'

export type ApplicationsQuery = {
  tab: ApplicationTab
  search: string
  type: ApplicantType | 'all'
  role: RequestedRole | 'all'
  page: number
}

export type ApplicationsPage = Paged<ApplicationSummary> & {
  tabCounts: Record<ApplicationTab, number>
  /** "2 days", for "Oldest waiting: 2 days" on the Open tab. */
  oldestWaiting: string | null
}

export type ApproveInput = {
  workEmail: string
  role: RequestedRole
  depot: string | null
  signIn: 'setup-link' | 'temporary-password'
  sendWelcomeEmail: boolean
  licence: LicenceDetails | null
}

export type RejectInput = { reason: string; message: string; allowReapply: boolean }

export type ApprovalOptions = { accountId: string; depots: string[]; licenceClasses: string[] }
