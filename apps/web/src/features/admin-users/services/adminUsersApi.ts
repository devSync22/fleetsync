import { ApiError } from '@/services/apiClient'
import { mockRequest, nowTime } from '@/services/mockRequest'
import {
  companiesMock,
  depotsMock,
  driverRowsMock,
  licenceClassesMock,
  permissionsMock,
  usersMock,
} from '../mocks/usersMock'
import { roleInfo } from '../roles'
import type {
  CompaniesQuery,
  CreateUserInput,
  CreateUserOptions,
  CustomerCompany,
  DriverRow,
  DriversQuery,
  ModulePermissions,
  Paged,
  UserAccount,
  UserRole,
  UsersQuery,
  UserTabCounts,
} from '../types'

/*
 * Mocked until the admin user endpoints exist. Planned real calls (Auth module, admin only):
 *   getUsers        → apiClient.get<Paged<UserAccount>>('/users', { params: query })
 *   getUser         → apiClient.get<UserAccount>(`/users/${userId}`)
 *   changeUserRole  → apiClient.put(`/users/${userId}/role`, { role, reason })
 *   setUserActive   → apiClient.put(`/users/${userId}/status`, { isActive, reason })   (exists in the API)
 *   sendPasswordReset → apiClient.post(`/users/${userId}/password-reset`)
 *   createUser      → apiClient.post<{ userId: string }>('/users', input)
 *
 * Changes made in this session are kept in memory so the list, profile sheet and dashboard agree.
 * In dev, `?mock=error` previews error states and `?mock=empty` empty lists.
 */

export const PAGE_SIZE = 8

// Working copies, so role changes and deactivations persist while the app is open.
const users: UserAccount[] = usersMock.map((u) => ({ ...u, recentActivity: [...u.recentActivity] }))
const companies: CustomerCompany[] = companiesMock.map((c) => ({ ...c }))
let nextEmployeeNumber = 159

function paginate<T>(rows: T[], page: number): Paged<T> {
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  return {
    items: rows.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    total: rows.length,
    page: current,
    pageCount,
    pageSize: PAGE_SIZE,
  }
}

const matches = (text: string, search: string) => text.toLowerCase().includes(search.trim().toLowerCase())

function findUser(userId: string) {
  const found = users.find((u) => u.userId === userId)
  if (!found) throw new ApiError(`User ${userId} was not found.`, 404)
  return found
}

export async function getUserTabCounts(): Promise<UserTabCounts> {
  await mockRequest()
  return {
    all: users.length,
    drivers: users.filter((u) => u.role === 'driver').length,
    companies: companies.length,
    roles: Object.keys(roleInfo).length,
  }
}

export async function getUsers(query: UsersQuery): Promise<Paged<UserAccount>> {
  const scenario = await mockRequest()
  if (scenario === 'empty') return paginate([], 1)
  const rows = users.filter(
    (u) =>
      (query.role === 'all' || u.role === query.role) &&
      (query.status === 'all' || u.status === query.status) &&
      (matches(u.name, query.search) || matches(u.email, query.search)),
  )
  return paginate(rows, query.page)
}

export async function getUser(userId: string): Promise<UserAccount> {
  await mockRequest()
  return findUser(userId)
}

export async function changeUserRole(userId: string, role: UserRole, reason: string): Promise<UserAccount> {
  await mockRequest()
  const target = findUser(userId)
  if (target.role === role) throw new ApiError('Pick a role that is different from the current one.', 409)
  if (target.userId === CURRENT_ADMIN_ID) throw new ApiError('You can’t change your own role.', 403)
  const before = roleInfo[target.role].label
  target.role = role
  target.isCompany = role === 'customer'
  target.recentActivity.unshift({
    text: `Role changed from ${before} to ${roleInfo[role].label}${reason.trim() ? ` · ${reason.trim()}` : ''}`,
    time: `Today, ${nowTime()}`,
    tone: 'neutral',
  })
  return target
}

/** The signed-in administrator (Ayesha Silva); admins can't deactivate or demote themselves. */
export const CURRENT_ADMIN_ID = 'USR-0002'

export async function setUserActive(userId: string, isActive: boolean, reason?: string): Promise<UserAccount> {
  await mockRequest()
  const target = findUser(userId)
  if (target.userId === CURRENT_ADMIN_ID) throw new ApiError('You can’t deactivate your own account.', 403)
  target.status = isActive ? 'active' : 'deactivated'
  target.recentActivity.unshift({
    text: isActive ? 'Account reactivated' : `Account deactivated${reason ? ` · ${reason}` : ''}`,
    time: `Today, ${nowTime()}`,
    tone: isActive ? 'success' : 'pending',
  })
  return target
}

/** Emails the user a password reset link. */
export async function sendPasswordReset(userId: string): Promise<{ email: string }> {
  await mockRequest()
  return { email: findUser(userId).email }
}

// ---- Drivers ------------------------------------------------------------------

export async function getDrivers(query: DriversQuery): Promise<Paged<DriverRow> & { attention: DriverRow[] }> {
  const scenario = await mockRequest()
  const all: DriverRow[] = driverRowsMock.flatMap((row) => {
    const account = users.find((u) => u.userId === row.userId && u.role === 'driver')
    return account ? [{ ...row, name: account.name, phone: account.phone }] : []
  })
  if (scenario === 'empty') return { ...paginate([], 1), attention: [] }
  const rows = all.filter(
    (d) =>
      (query.licenceClass === 'all' || d.licenceClass === query.licenceClass) &&
      (query.status === 'all' || d.availability === query.status) &&
      (matches(d.name, query.search) || matches(d.phone.replace(/\s/g, ''), query.search.replace(/\s/g, '')) || matches(d.licenceNumber, query.search)),
  )
  return { ...paginate(rows, query.page), attention: all.filter((d) => d.licenceStatus !== 'valid') }
}

// ---- Customer companies ---------------------------------------------------------

export async function getCompanies(query: CompaniesQuery): Promise<Paged<CustomerCompany> & { overdue: CustomerCompany[] }> {
  const scenario = await mockRequest()
  if (scenario === 'empty') return { ...paginate([], 1), overdue: [] }
  const rows = companies.filter(
    (c) =>
      (query.status === 'all' || c.status === query.status) &&
      (query.balance === 'any' ||
        (query.balance === 'outstanding' && (c.outstanding ?? 0) > 0) ||
        (query.balance === 'overdue' && c.balanceFlag?.tone === 'danger')) &&
      (matches(c.name, query.search) || matches(c.brNumber, query.search) || matches(c.contactName, query.search)),
  )
  return { ...paginate(rows, query.page), overdue: companies.filter((c) => c.balanceFlag?.tone === 'danger') }
}

/** Lifts a suspension once the balance is settled (or the admin decides to). */
export async function reactivateCompany(companyId: string): Promise<CustomerCompany> {
  await mockRequest()
  const company = companies.find((c) => c.companyId === companyId)
  if (!company) throw new ApiError(`Company ${companyId} was not found.`, 404)
  company.status = 'active'
  return company
}

// ---- Roles & permissions ----------------------------------------------------------

export async function getPermissions(): Promise<ModulePermissions[]> {
  await mockRequest()
  return permissionsMock
}

// ---- Create user -------------------------------------------------------------------

export async function getCreateUserOptions(): Promise<CreateUserOptions> {
  await mockRequest()
  return {
    nextEmployeeId: `EMP-${String(nextEmployeeNumber).padStart(4, '0')}`,
    depots: depotsMock,
    licenceClasses: licenceClassesMock,
  }
}

export async function createUser(input: CreateUserInput): Promise<{ userId: string }> {
  await mockRequest()
  const email = input.email.trim().toLowerCase()
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new ApiError('An account with this email already exists.', 409)
  }
  const employeeId = `EMP-${String(nextEmployeeNumber).padStart(4, '0')}`
  nextEmployeeNumber += 1
  const userId = `USR-${employeeId.slice(4)}`
  users.unshift({
    userId,
    name: input.fullName.trim(),
    email,
    role: input.role,
    status: 'active',
    lastSignIn: 'Never',
    isCompany: false,
    employeeId,
    phone: input.mobile,
    address: '—',
    joined: new Date().toISOString().slice(0, 10),
    driver: input.driver
      ? {
          licenceNumber: input.driver.licenceNumber,
          licenceClass: input.driver.licenceClass,
          licenceExpiry: input.driver.licenceExpiry,
          licenceStatus: 'valid',
        }
      : null,
    monthSummary: input.role === 'driver' ? '0 trips' : null,
    recentActivity: [
      {
        text: input.signIn === 'setup-link' ? 'Account created · setup link emailed' : 'Account created · temporary password set',
        time: `Today, ${nowTime()}`,
        tone: 'success',
      },
    ],
  })
  return { userId }
}

// ---- Export --------------------------------------------------------------------------

export type ExportTable = { fileName: string; header: string[]; rows: (string | number | null)[][] }

/**
 * Rows for the Export button of a tab, built from the full (unpaged) list.
 * TODO: switch to a server-side CSV endpoint once it exists (GET /users/export?tab=…).
 */
export async function getExport(tab: 'all' | 'drivers' | 'companies' | 'roles'): Promise<ExportTable> {
  await mockRequest()
  const today = new Date().toISOString().slice(0, 10)
  if (tab === 'drivers') {
    const drivers = driverRowsMock.filter((d) => users.some((u) => u.userId === d.userId && u.role === 'driver'))
    return {
      fileName: `drivers-${today}.csv`,
      header: ['Driver', 'Phone', 'Licence number', 'Licence class', 'Licence expiry', 'Status', 'Trips this month', 'Km this month'],
      rows: drivers.map((d) => {
        const account = users.find((u) => u.userId === d.userId)
        return [account?.name ?? d.userId, account?.phone ?? '', d.licenceNumber, d.licenceClass, d.licenceExpiry, d.availability, d.tripsThisMonth, d.kmThisMonth]
      }),
    }
  }
  if (tab === 'companies') {
    return {
      fileName: `customer-companies-${today}.csv`,
      header: ['Company', 'BR number', 'Contact', 'Email', 'Orders this month', 'Outstanding (LKR)', 'Status'],
      rows: companies.map((c) => [c.name, c.brNumber, c.contactName, c.contactEmail, c.ordersThisMonth, c.outstanding, c.status]),
    }
  }
  if (tab === 'roles') {
    return {
      fileName: `roles-and-permissions-${today}.csv`,
      header: ['Module', ...Object.values(roleInfo).map((r) => r.label)],
      rows: permissionsMock.map((m) => [m.module, ...Object.keys(roleInfo).map((role) => m.access[role as UserRole])]),
    }
  }
  return {
    fileName: `user-accounts-${today}.csv`,
    header: ['User ID', 'Name', 'Email', 'Role', 'Status', 'Last sign-in'],
    rows: users.map((u) => [u.userId, u.name, u.email, roleInfo[u.role].label, u.status, u.lastSignIn]),
  }
}
