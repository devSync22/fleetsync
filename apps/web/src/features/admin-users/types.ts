/** The six roles; values match the Auth module's role names (see docs/runbooks/auth-module.md). */
export type UserRole = 'customer' | 'driver' | 'mechanic' | 'coordinator' | 'fleet-administrator' | 'owner'

export type AccountStatus = 'active' | 'deactivated'

export type LicenceStatus = 'valid' | 'expiring' | 'expired'

export type DriverDetails = {
  licenceNumber: string
  /** "Heavy vehicle (C)" */
  licenceClass: string
  /** ISO date */
  licenceExpiry: string
  licenceStatus: LicenceStatus
}

export type ActivityItem = {
  text: string
  time: string
  /** Colour of the dot: success = completed, neutral = sign-in, pending = issue / warning. */
  tone: 'success' | 'neutral' | 'pending'
}

/** One row of "All users", plus what the View profile sheet shows. */
export type UserAccount = {
  userId: string
  name: string
  email: string
  role: UserRole
  status: AccountStatus
  /** "Today, 08:12", "Now", "21 Sep 2026" */
  lastSignIn: string
  /** Customer accounts are companies: grey square-ish avatar, no employee ID. */
  isCompany: boolean
  employeeId: string | null
  phone: string
  address: string
  /** ISO date */
  joined: string
  driver: DriverDetails | null
  /** "18 trips · 2,140 km" for drivers; null for roles without trips. */
  monthSummary: string | null
  recentActivity: ActivityItem[]
}

export type UsersQuery = { search: string; role: UserRole | 'all'; status: AccountStatus | 'all'; page: number }

export type Paged<T> = { items: T[]; total: number; page: number; pageCount: number; pageSize: number }

/** Counts for the four tab pills. */
export type UserTabCounts = { all: number; drivers: number; companies: number; roles: number }

// ---- Drivers tab ------------------------------------------------------------

/** Driver availability as the Drivers tab shows it. Blocked = licence expired, cannot be assigned. */
export type DriverAvailability = 'on-trip' | 'available' | 'assigned' | 'off-duty' | 'blocked'

export type DriverRow = {
  userId: string
  name: string
  phone: string
  licenceNumber: string
  /** Short class shown in the list: "Heavy (C)", "Light (B)", "Heavy (CE)". */
  licenceClass: string
  licenceExpiry: string
  licenceStatus: LicenceStatus
  /** Days left, for "Expires in 14 days". */
  expiresInDays: number | null
  availability: DriverAvailability
  tripsThisMonth: number
  kmThisMonth: number | null
}

export type DriversQuery = { search: string; licenceClass: string; status: DriverAvailability | 'all'; page: number }

// ---- Customer companies tab -------------------------------------------------

export type CompanyStatus = 'active' | 'pending-review' | 'inactive' | 'suspended'

export type CustomerCompany = {
  companyId: string
  name: string
  /** Business registration number, "PV 00012345". */
  brNumber: string
  contactName: string
  contactEmail: string
  ordersThisMonth: number
  /** Second line under the order count: "LKR 1.28M total", "New applicant". */
  ordersNote: string
  /** null = not applicable yet (new applicant). */
  outstanding: number | null
  /** Due-soon / overdue tag under the outstanding amount. */
  balanceFlag: { tone: 'pending' | 'danger'; label: string } | null
  status: CompanyStatus
  /** Set while the company's application is still waiting for review. */
  applicationId: string | null
  billingAddress: string
  phone: string
}

export type CompaniesQuery = { search: string; status: CompanyStatus | 'all'; balance: 'any' | 'outstanding' | 'overdue'; page: number }

// ---- Roles & permissions tab ------------------------------------------------

export type Access = 'full' | 'own' | 'view' | 'assigned' | 'report' | 'none'

export type ModulePermissions = {
  module: string
  description: string
  access: Record<UserRole, Access>
}

// ---- Create user ------------------------------------------------------------

/** Staff roles an administrator can create directly (customers register themselves). */
export type StaffRole = Exclude<UserRole, 'customer'>

export type CreateUserInput = {
  fullName: string
  nic: string
  email: string
  mobile: string
  depot: string
  role: StaffRole
  signIn: 'setup-link' | 'temporary-password'
  driver: { licenceNumber: string; licenceClass: string; licenceExpiry: string; licenceFileName: string | null } | null
}

export type CreateUserOptions = { nextEmployeeId: string; depots: string[]; licenceClasses: string[] }
