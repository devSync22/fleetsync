import type { ProfileOverview } from '../types'

/**
 * Copied from "Coordinator — Profile & settings" (417:8776) and "Password & security" (453:10118).
 * The frame shows the mobile mid-edit; the saved number (077 512 8830) is a placeholder.
 */
export const profileMock: ProfileOverview = {
  profile: {
    initials: 'NP',
    roleLabel: 'Operational Coordinator',
    employeeId: 'EMP-0012',
    memberSince: 'Jun 2022',
    details: {
      fullName: 'Nimal Perera',
      workEmail: 'nimal.p@fms.lk',
      mobile: '077 512 8830',
      officePhone: '011 268 4420',
      address: 'No. 21, Temple Road, Maharagama',
    },
  },
  changeRequests: [
    { id: 'CR-2026-0313', field: 'mobile', newValue: '077 233 4519', status: 'pending-review', note: 'submitted today' },
    {
      id: 'CR-2026-0287',
      field: 'officePhone',
      newValue: '011 268 4420',
      status: 'approved',
      note: '8 Oct · approved by Ayesha Silva',
    },
  ],
  security: {
    passwordLastChanged: '3 months ago',
    lastSignIn: 'Today, 07:55 · Chrome on Windows',
    signIns: [
      { id: 's1', when: 'Today, 07:58', description: 'Chrome on Windows · Colombo', outcome: 'success' },
      { id: 's2', when: 'Yesterday, 18:20', description: 'Chrome on Windows · Colombo', outcome: 'success' },
      { id: 's3', when: '24 Oct, 08:05', description: 'Safari on iPhone · Colombo', outcome: 'success' },
      { id: 's4', when: '22 Oct, 21:42', description: 'Chrome on Android · Kandy', outcome: 'wrong-password' },
      { id: 's5', when: '22 Oct, 07:51', description: 'Chrome on Windows · Colombo', outcome: 'success' },
    ],
    sessions: [
      { id: 'd1', device: 'Chrome on Windows', kind: 'desktop', location: 'Colombo', lastActive: 'active now', current: true },
      { id: 'd2', device: 'Safari on iPhone', kind: 'mobile', location: 'Colombo', lastActive: '2 days ago', current: false },
      { id: 'd3', device: 'Chrome on Android', kind: 'mobile', location: 'Gampaha', lastActive: '5 days ago', current: false },
    ],
    passwordChange: null,
  },
}
