import type { AuditEvent } from '../types'

type Seed = Omit<AuditEvent, 'at' | 'eventId' | 'ipAddress' | 'device' | 'sessionId' | 'changes' | 'reason' | 'recordLabel' | 'recordUserId' | 'userId'> &
  Partial<AuditEvent> & { time: string; daysAgo?: number }

/**
 * Events from the "Admin — Audit log" frame (95:1894), dated today so the period filter works,
 * plus older ones for "Last 7 / 30 days".
 */
const seeds: Seed[] = [
  { time: '11:58:12', userName: 'Nimal Perera', userRole: 'Coordinator', userId: 'USR-0101', action: 'Assigned vehicle and driver', module: 'Trips', record: 'TRP-2026-00392', result: 'success' },
  { time: '11:41:05', userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Deactivated user account', module: 'Users', record: 'USR-0071', recordLabel: 'Dinesh Kumara', recordUserId: 'USR-0071', result: 'success', changes: [{ field: 'Status', before: 'Active', after: 'Deactivated' }], reason: 'Left the company' },
  { time: '11:20:47', userName: 'System', userRole: 'Authentication', action: 'Failed sign-in (3rd attempt)', module: 'Auth', record: 'kasun.perera@lankatiles.lk', result: 'failed', ipAddress: '203.94.71.12', device: 'Safari 18 · iPhone' },
  { time: '11:02:33', eventId: 'AUD-2026-118402', userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Changed user role', module: 'Users', record: 'USR-0063', recordLabel: 'Sanduni Fernando', recordUserId: 'USR-0118', result: 'success', changes: [{ field: 'Role', before: 'Driver', after: 'Operational Coordinator' }], reason: 'Promoted to coordinator from 1 November.' },
  { time: '10:57:10', userName: 'Ravindu Silva', userRole: 'Mechanic', userId: 'USR-0124', action: 'Recorded maintenance', module: 'Maintenance', record: 'WP LM-7703', result: 'success', device: 'FleetSync app · Android 15' },
  { time: '10:32:44', userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Updated role permissions', module: 'Roles', record: 'Role: Mechanic', result: 'success', changes: [{ field: 'Vehicles', before: 'No access', after: 'View only' }] },
  { time: '10:15:09', userName: 'Dilini Perera', userRole: 'Customer', userId: 'USR-0201', action: 'Submitted transport order', module: 'Orders', record: 'ORD-1047', result: 'success' },
  { time: '09:48:51', userName: 'System', userRole: 'Payments', action: 'Online payment declined', module: 'Payments', record: 'PAY-88213', result: 'failed' },
  { time: '09:14:02', userName: 'Ruwan Bandara', userRole: 'Applicant', action: 'Submitted account application', module: 'Applications', record: 'APP-2026-0123', result: 'success' },
  { time: '08:30:00', userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Assigned application to self', module: 'Applications', record: 'APP-2026-0118', result: 'success' },
  { time: '08:12:40', userName: 'Kasun Perera', userRole: 'Driver', userId: 'USR-0142', action: 'Signed in', module: 'Auth', record: 'kasun.p@fms.lk', result: 'success', device: 'FleetSync app · Android 14' },
  { time: '07:55:21', userName: 'Kasun Perera', userRole: 'Driver', userId: 'USR-0142', action: 'Completed trip', module: 'Trips', record: 'TRP-2026-00379', result: 'success', changes: [{ field: 'End odometer', before: '—', after: '187,400 km' }] },
  { time: '07:55:02', userName: 'Nimal Perera', userRole: 'Coordinator', userId: 'USR-0101', action: 'Signed in', module: 'Auth', record: 'nimal.p@fms.lk', result: 'success' },
  { time: '06:40:15', userName: 'Ravindu Silva', userRole: 'Mechanic', userId: 'USR-0124', action: 'Signed in', module: 'Auth', record: 'ravindu.s@fms.lk', result: 'success', device: 'FleetSync app · Android 15' },
  { time: '18:20:33', daysAgo: 1, userName: 'Sanduni Fernando', userRole: 'Driver', userId: 'USR-0118', action: 'Requested profile change', module: 'Users', record: 'CR-2026-0309', result: 'success', changes: [{ field: 'Licence expiry date', before: '14 Nov 2026', after: '14 Nov 2034' }] },
  { time: '17:40:12', daysAgo: 1, userName: 'Kasun Perera', userRole: 'Driver', userId: 'USR-0142', action: 'Reported a vehicle issue', module: 'Maintenance', record: 'WP CAB-4521', result: 'success' },
  { time: '15:40:00', daysAgo: 1, userName: 'Ruwan Jayawardena', userRole: 'Applicant', action: 'Submitted account application', module: 'Applications', record: 'APP-2026-0121', result: 'success' },
  { time: '14:05:44', daysAgo: 1, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Approved application', module: 'Applications', record: 'APP-2026-0114', result: 'success', changes: [{ field: 'Account', before: '—', after: 'EMP-0161' }] },
  { time: '11:20:10', daysAgo: 2, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Added vehicle', module: 'Vehicles', record: 'WP CAB-9012', result: 'success' },
  { time: '16:02:19', daysAgo: 3, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Turned off service type', module: 'Reference data', record: 'Fire extinguisher check', result: 'success', changes: [{ field: 'Active', before: 'On', after: 'Off' }], reason: 'Replaced by safety audit' },
  { time: '12:10:05', daysAgo: 3, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Rejected application', module: 'Applications', record: 'APP-2026-0119', result: 'success', reason: 'Licence expired' },
  { time: '09:42:30', daysAgo: 5, userName: 'Nadeesha Perera', userRole: 'Administrator', action: 'Approved application', module: 'Applications', record: 'APP-2026-0109', result: 'success', changes: [{ field: 'Account', before: '—', after: 'DRV-035' }] },
  { time: '10:30:00', daysAgo: 6, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Rejected application', module: 'Applications', record: 'APP-2026-0113', result: 'success', reason: 'Registration not valid' },
  { time: '15:18:00', daysAgo: 9, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Approved application', module: 'Applications', record: 'APP-2026-0104', result: 'success' },
  { time: '19:55:41', daysAgo: 12, userName: 'System', userRole: 'Authentication', action: 'Account locked after 5 failed sign-ins', module: 'Auth', record: 'tharaka.b@fms.lk', result: 'failed' },
  { time: '08:00:00', daysAgo: 20, userName: 'Ayesha Silva', userRole: 'Administrator', userId: 'USR-0002', action: 'Created user account', module: 'Users', record: 'USR-0158', recordLabel: 'Pradeep Kumara', recordUserId: 'USR-0158', result: 'success' },
]

/** Builds the events relative to today, newest first. */
export function buildAuditEvents(now = new Date()): AuditEvent[] {
  return seeds
    .map(({ time, daysAgo = 0, ...rest }, i) => {
      const [h, m, s] = time.split(':').map(Number)
      const at = new Date(now)
      at.setDate(at.getDate() - daysAgo)
      at.setHours(h, m, s, 0)
      return {
        eventId: rest.eventId ?? `AUD-2026-${String(118420 - i).padStart(6, '0')}`,
        at: at.toISOString(),
        userId: null,
        recordLabel: null,
        recordUserId: null,
        changes: [],
        reason: null,
        ipAddress: '112.134.48.20',
        device: 'Chrome 129 · Windows 11',
        sessionId: `SES-${(0x7f3a91c2 - i * 7919).toString(16)}`,
        ...rest,
      }
    })
    .sort((a, b) => b.at.localeCompare(a.at))
}
