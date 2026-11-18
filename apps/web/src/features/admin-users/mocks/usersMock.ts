import type { ActivityItem, CustomerCompany, DriverRow, ModulePermissions, UserAccount } from '../types'

/*
 * Mock data from the Admin → User accounts frames (56:646, 65:1185, 69:1216, 57:791, 83:1486).
 * The first eight users are the "All users" frame in order; the rest come from the Drivers and
 * Customer companies frames so every tab shows the same people.
 */

type Seed = Partial<UserAccount> & Pick<UserAccount, 'userId' | 'name' | 'email' | 'role' | 'lastSignIn'>

const signIn = (time: string, from = 'web app'): ActivityItem => ({ text: `Signed in from ${from}`, time, tone: 'neutral' })

function user(seed: Seed): UserAccount {
  return {
    status: 'active',
    isCompany: seed.role === 'customer',
    employeeId: null,
    phone: '—',
    address: '—',
    joined: '2025-01-15',
    driver: null,
    monthSummary: null,
    recentActivity: [signIn(seed.lastSignIn)],
    ...seed,
  }
}

export const usersMock: UserAccount[] = [
  user({
    userId: 'USR-0142',
    name: 'Kasun Perera',
    email: 'kasun.p@fms.lk',
    role: 'driver',
    lastSignIn: 'Today, 08:12',
    employeeId: 'EMP-0142',
    phone: '077 123 4567',
    address: 'No. 24, Puttalam Road, Kurunegala',
    joined: '2024-03-12',
    driver: { licenceNumber: 'B1234567', licenceClass: 'Heavy vehicle (C)', licenceExpiry: '2028-03-12', licenceStatus: 'valid' },
    monthSummary: '18 trips · 2,140 km',
    recentActivity: [
      { text: 'Completed trip TRP-2026-00379', time: 'Today, 07:55', tone: 'success' },
      { text: 'Signed in from Android app', time: 'Today, 06:58', tone: 'neutral' },
      { text: 'Reported a vehicle issue on WP CAB-4521', time: 'Yesterday, 17:40', tone: 'pending' },
    ],
  }),
  user({
    userId: 'USR-0101',
    name: 'Nimal Perera',
    email: 'nimal.p@fms.lk',
    role: 'coordinator',
    lastSignIn: 'Today, 07:55',
    employeeId: 'EMP-0101',
    phone: '071 456 7890',
    address: 'No. 8, Galle Road, Colombo 03',
    joined: '2023-08-01',
    recentActivity: [
      { text: 'Assigned vehicle and driver to TRP-2026-00392', time: 'Today, 11:58', tone: 'success' },
      signIn('Today, 07:55'),
    ],
  }),
  user({
    userId: 'USR-0118',
    name: 'Sanduni Fernando',
    email: 'sanduni.f@fms.lk',
    role: 'driver',
    lastSignIn: 'Yesterday, 18:20',
    employeeId: 'EMP-0118',
    phone: '071 987 2210',
    address: 'No. 52, Temple Road, Negombo',
    joined: '2024-06-03',
    driver: { licenceNumber: 'B7654321', licenceClass: 'Light vehicle (B)', licenceExpiry: '2029-01-20', licenceStatus: 'valid' },
    monthSummary: '14 trips · 1,320 km',
  }),
  user({
    userId: 'USR-0124',
    name: 'Ravindu Silva',
    email: 'ravindu.s@fms.lk',
    role: 'mechanic',
    lastSignIn: 'Today, 06:40',
    employeeId: 'EMP-0124',
    phone: '076 321 4455',
    address: 'No. 3, Station Road, Gampaha',
    joined: '2024-02-19',
    recentActivity: [
      { text: 'Recorded maintenance on WP LM-7703', time: 'Today, 10:57', tone: 'success' },
      signIn('Today, 06:40', 'Android app'),
    ],
  }),
  user({
    userId: 'USR-0201',
    name: 'Lanka Tiles PLC',
    email: 'orders@lankatiles.lk',
    role: 'customer',
    lastSignIn: '2 days ago',
    phone: '011 234 5678',
    address: 'No. 215, Nawala Road, Nugegoda',
    joined: '2024-01-08',
  }),
  user({
    userId: 'USR-0002',
    name: 'Ayesha Silva',
    email: 'ayesha.s@fms.lk',
    role: 'fleet-administrator',
    lastSignIn: 'Now',
    employeeId: 'EMP-0002',
    phone: '077 555 1020',
    address: 'No. 41, Flower Road, Colombo 07',
    joined: '2023-05-02',
  }),
  user({
    userId: 'USR-0001',
    name: 'Chaminda Jayasuriya',
    email: 'chaminda.j@fms.lk',
    role: 'owner',
    lastSignIn: '3 days ago',
    employeeId: 'EMP-0001',
    phone: '077 100 2000',
    address: 'No. 12, Ward Place, Colombo 07',
    joined: '2023-05-01',
  }),
  user({
    userId: 'USR-0071',
    name: 'Dinesh Kumara',
    email: 'dinesh.k@fms.lk',
    role: 'mechanic',
    status: 'deactivated',
    lastSignIn: '21 Sep 2026',
    employeeId: 'EMP-0071',
    phone: '078 222 9090',
    address: 'No. 7, Kandy Road, Kadawatha',
    joined: '2023-11-14',
  }),
  user({
    userId: 'USR-0131',
    name: 'Rasika Silva',
    email: 'rasika.s@fms.lk',
    role: 'driver',
    lastSignIn: 'Today, 07:10',
    employeeId: 'EMP-0131',
    phone: '076 555 0912',
    driver: { licenceNumber: 'B2348765', licenceClass: 'Heavy vehicle (C)', licenceExpiry: '2026-12-02', licenceStatus: 'expiring' },
    monthSummary: '11 trips · 980 km',
  }),
  user({
    userId: 'USR-0135',
    name: 'Nuwan Jayasinghe',
    email: 'nuwan.j@fms.lk',
    role: 'driver',
    lastSignIn: 'Today, 09:02',
    employeeId: 'EMP-0135',
    phone: '070 333 4411',
    driver: { licenceNumber: 'B9981234', licenceClass: 'Heavy vehicle (C)', licenceExpiry: '2027-08-14', licenceStatus: 'valid' },
    monthSummary: '16 trips · 1,870 km',
  }),
  user({
    userId: 'USR-0139',
    name: 'Malith Rathnayake',
    email: 'malith.r@fms.lk',
    role: 'driver',
    lastSignIn: 'Today, 05:48',
    employeeId: 'EMP-0139',
    phone: '078 111 2233',
    driver: { licenceNumber: 'B6677889', licenceClass: 'Heavy vehicle (C)', licenceExpiry: '2030-06-01', licenceStatus: 'valid' },
    monthSummary: '20 trips · 2,460 km',
  }),
  user({
    userId: 'USR-0158',
    name: 'Pradeep Kumara',
    email: 'pradeep.k@fms.lk',
    role: 'driver',
    lastSignIn: 'Yesterday, 16:05',
    employeeId: 'EMP-0158',
    phone: '077 900 3344',
    driver: { licenceNumber: 'B1122334', licenceClass: 'Light vehicle (B)', licenceExpiry: '2027-11-12', licenceStatus: 'valid' },
    monthSummary: '12 trips · 1,040 km',
  }),
  user({
    userId: 'USR-0146',
    name: 'Tharaka Bandara',
    email: 'tharaka.b@fms.lk',
    role: 'driver',
    lastSignIn: '2 days ago',
    employeeId: 'EMP-0146',
    phone: '075 220 1188',
    driver: { licenceNumber: 'B4455667', licenceClass: 'Heavy combination (CE)', licenceExpiry: '2028-02-09', licenceStatus: 'valid' },
    monthSummary: '9 trips · 760 km',
  }),
  user({
    userId: 'USR-0149',
    name: 'Chathura Weerasinghe',
    email: 'chathura.w@fms.lk',
    role: 'driver',
    lastSignIn: '5 days ago',
    employeeId: 'EMP-0149',
    phone: '071 444 7788',
    driver: { licenceNumber: 'B5566778', licenceClass: 'Heavy vehicle (C)', licenceExpiry: '2026-11-01', licenceStatus: 'expired' },
    monthSummary: '0 trips',
  }),
  user({ userId: 'USR-0203', name: 'Hayleys Freight', email: 'logistics@hayleys.lk', role: 'customer', lastSignIn: 'Yesterday, 14:30' }),
  user({ userId: 'USR-0204', name: 'Kandy Builders (Pvt) Ltd', email: 'admin@kandybuilders.lk', role: 'customer', lastSignIn: '4 days ago' }),
  user({ userId: 'USR-0205', name: 'Southern Fisheries Co.', email: 'accounts@sfco.lk', role: 'customer', lastSignIn: 'Today, 08:47' }),
  user({ userId: 'USR-0206', name: 'Colombo Pharma Distributors', email: 'dispatch@cpd.lk', role: 'customer', lastSignIn: 'Today, 10:15' }),
  user({ userId: 'USR-0207', name: 'Galle Garments Ltd', email: 'supply@gallegarments.lk', role: 'customer', lastSignIn: '3 months ago' }),
  user({ userId: 'USR-0208', name: 'Matale Spice Exports', email: 'info@matalespice.lk', role: 'customer', lastSignIn: '6 days ago' }),
]

/** Driver list rows (Drivers tab, 65:1185), keyed to the users above. */
export const driverRowsMock: Omit<DriverRow, 'name' | 'phone'>[] = [
  { userId: 'USR-0142', licenceNumber: 'B1234567', licenceClass: 'Heavy (C)', licenceExpiry: 'Mar 2028', licenceStatus: 'valid', expiresInDays: null, availability: 'on-trip', tripsThisMonth: 18, kmThisMonth: 2140 },
  { userId: 'USR-0118', licenceNumber: 'B7654321', licenceClass: 'Light (B)', licenceExpiry: 'Jan 2029', licenceStatus: 'valid', expiresInDays: null, availability: 'available', tripsThisMonth: 14, kmThisMonth: 1320 },
  { userId: 'USR-0131', licenceNumber: 'B2348765', licenceClass: 'Heavy (C)', licenceExpiry: 'Dec 2026', licenceStatus: 'expiring', expiresInDays: 14, availability: 'available', tripsThisMonth: 11, kmThisMonth: 980 },
  { userId: 'USR-0135', licenceNumber: 'B9981234', licenceClass: 'Heavy (C)', licenceExpiry: 'Aug 2027', licenceStatus: 'valid', expiresInDays: null, availability: 'assigned', tripsThisMonth: 16, kmThisMonth: 1870 },
  { userId: 'USR-0139', licenceNumber: 'B6677889', licenceClass: 'Heavy (C)', licenceExpiry: 'Jun 2030', licenceStatus: 'valid', expiresInDays: null, availability: 'on-trip', tripsThisMonth: 20, kmThisMonth: 2460 },
  { userId: 'USR-0158', licenceNumber: 'B1122334', licenceClass: 'Light (B)', licenceExpiry: 'Nov 2027', licenceStatus: 'valid', expiresInDays: null, availability: 'available', tripsThisMonth: 12, kmThisMonth: 1040 },
  { userId: 'USR-0146', licenceNumber: 'B4455667', licenceClass: 'Heavy (CE)', licenceExpiry: 'Feb 2028', licenceStatus: 'valid', expiresInDays: null, availability: 'off-duty', tripsThisMonth: 9, kmThisMonth: 760 },
  { userId: 'USR-0149', licenceNumber: 'B5566778', licenceClass: 'Heavy (C)', licenceExpiry: 'Nov 2026', licenceStatus: 'expired', expiresInDays: null, availability: 'blocked', tripsThisMonth: 0, kmThisMonth: null },
]

/** Customer companies tab (69:1216). */
export const companiesMock: CustomerCompany[] = [
  { companyId: 'CMP-001', name: 'Lanka Tiles PLC', brNumber: 'PV 00012345', contactName: 'Dilini Perera', contactEmail: 'orders@lankatiles.lk', ordersThisMonth: 14, ordersNote: 'LKR 1.28M total', outstanding: 0, balanceFlag: null, status: 'active', applicationId: null, billingAddress: 'No. 215, Nawala Road, Nugegoda', phone: '011 234 5678' },
  { companyId: 'CMP-013', name: 'Ceylon Agro Ltd', brNumber: 'PV 00098765', contactName: 'Ruwan Jayawardena', contactEmail: 'ops@ceylonagro.lk', ordersThisMonth: 0, ordersNote: 'New applicant', outstanding: null, balanceFlag: null, status: 'pending-review', applicationId: 'APP-2026-0121', billingAddress: 'No. 88, Kandy Road, Peradeniya', phone: '081 238 4400' },
  { companyId: 'CMP-004', name: 'Hayleys Freight', brNumber: 'PQ 00045671', contactName: 'Sachini Fernando', contactEmail: 'logistics@hayleys.lk', ordersThisMonth: 9, ordersNote: 'LKR 642,000 total', outstanding: 48500, balanceFlag: { tone: 'pending', label: 'Due in 5 days' }, status: 'active', applicationId: null, billingAddress: 'No. 400, Deans Road, Colombo 10', phone: '011 262 7000' },
  { companyId: 'CMP-006', name: 'Kandy Builders (Pvt) Ltd', brNumber: 'PV 00076543', contactName: 'Asanka Herath', contactEmail: 'admin@kandybuilders.lk', ordersThisMonth: 6, ordersNote: 'LKR 318,750 total', outstanding: 0, balanceFlag: null, status: 'active', applicationId: null, billingAddress: 'No. 19, Peradeniya Road, Kandy', phone: '081 222 3344' },
  { companyId: 'CMP-007', name: 'Southern Fisheries Co.', brNumber: 'PV 00033221', contactName: 'Nadeesha Gamage', contactEmail: 'accounts@sfco.lk', ordersThisMonth: 11, ordersNote: 'LKR 905,200 total', outstanding: 126000, balanceFlag: { tone: 'danger', label: 'Overdue 12 days' }, status: 'active', applicationId: null, billingAddress: 'Harbour Road, Galle', phone: '091 223 4567' },
  { companyId: 'CMP-002', name: 'Colombo Pharma Distributors', brNumber: 'PV 00055678', contactName: 'Hiran De Silva', contactEmail: 'dispatch@cpd.lk', ordersThisMonth: 18, ordersNote: 'LKR 2.14M total', outstanding: 0, balanceFlag: null, status: 'active', applicationId: null, billingAddress: 'No. 60, Baseline Road, Colombo 09', phone: '011 268 9900' },
  { companyId: 'CMP-009', name: 'Galle Garments Ltd', brNumber: 'PV 00087654', contactName: 'Ishara Wickramasinghe', contactEmail: 'supply@gallegarments.lk', ordersThisMonth: 0, ordersNote: 'No orders in 90 days', outstanding: 0, balanceFlag: null, status: 'inactive', applicationId: null, billingAddress: 'Industrial Zone, Koggala', phone: '091 228 3010' },
  { companyId: 'CMP-010', name: 'Matale Spice Exports', brNumber: 'PV 00011223', contactName: 'Roshan Karunaratne', contactEmail: 'info@matalespice.lk', ordersThisMonth: 3, ordersNote: 'LKR 212,400 total', outstanding: 212400, balanceFlag: { tone: 'danger', label: 'Overdue 45 days' }, status: 'suspended', applicationId: null, billingAddress: 'No. 5, Main Street, Matale', phone: '066 222 1188' },
]

/** Roles & permissions matrix (57:791). Read-only: access follows the role. */
export const permissionsMock: ModulePermissions[] = [
  { module: 'Orders & quotations', description: 'Place, review and price orders', access: { customer: 'own', driver: 'none', mechanic: 'none', coordinator: 'full', 'fleet-administrator': 'view', owner: 'view' } },
  { module: 'Payments & invoices', description: 'Online payment, history, invoices', access: { customer: 'own', driver: 'none', mechanic: 'none', coordinator: 'view', 'fleet-administrator': 'view', owner: 'view' } },
  { module: 'Trips', description: 'Create, assign, start, complete', access: { customer: 'view', driver: 'assigned', mechanic: 'none', coordinator: 'full', 'fleet-administrator': 'view', owner: 'view' } },
  { module: 'Vehicles', description: 'Fleet records and availability', access: { customer: 'none', driver: 'assigned', mechanic: 'view', coordinator: 'view', 'fleet-administrator': 'full', owner: 'view' } },
  { module: 'Maintenance & documents', description: 'Service records, schedules, files', access: { customer: 'none', driver: 'report', mechanic: 'full', coordinator: 'view', 'fleet-administrator': 'view', owner: 'view' } },
  { module: 'User accounts & roles', description: 'Create users, change roles', access: { customer: 'none', driver: 'none', mechanic: 'none', coordinator: 'none', 'fleet-administrator': 'full', owner: 'view' } },
  { module: 'Reference data', description: 'Service types and lookups', access: { customer: 'none', driver: 'none', mechanic: 'none', coordinator: 'none', 'fleet-administrator': 'full', owner: 'none' } },
  { module: 'Reports & export', description: 'Generate and export reports', access: { customer: 'none', driver: 'none', mechanic: 'none', coordinator: 'full', 'fleet-administrator': 'view', owner: 'full' } },
  { module: 'Audit log', description: 'System activity records', access: { customer: 'none', driver: 'none', mechanic: 'none', coordinator: 'none', 'fleet-administrator': 'full', owner: 'view' } },
  { module: 'Chat', description: 'Messages between roles', access: { customer: 'full', driver: 'full', mechanic: 'full', coordinator: 'full', 'fleet-administrator': 'none', owner: 'none' } },
]

export const depotsMock = ['Colombo North', 'Colombo South', 'Kandy', 'Galle', 'Kurunegala']
export const licenceClassesMock = ['Light vehicle (B)', 'Heavy vehicle (C)', 'Heavy combination (CE)']
