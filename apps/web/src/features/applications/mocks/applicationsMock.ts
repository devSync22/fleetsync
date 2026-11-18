import type { ApplicationDetail, ApplicationSummary } from '../types'

/*
 * Mock data from the Admin → Applications frames (87:1645 Open, 434:8880 Approved, 434:9500 Rejected,
 * 434:10082 All) and the Review frame for APP-2026-0118 (89:1770). Applications the frames only list
 * get generic review details built in the service.
 */

const open = (s: Omit<ApplicationSummary, 'status' | 'decidedAt' | 'decidedBy' | 'accountId' | 'rejectReason'>): ApplicationSummary => ({
  ...s,
  status: 'pending-review',
  decidedAt: null,
  decidedBy: null,
  accountId: null,
  rejectReason: null,
})

export const applicationsMock: ApplicationSummary[] = [
  open({ applicationId: 'APP-2026-0123', name: 'Ruwan Bandara', type: 'staff', requestedRole: 'coordinator', submittedLabel: 'Today', submittedAt: '19 Oct, 09:14', documentsUploaded: 3, documentsRequired: 3 }),
  open({ applicationId: 'APP-2026-0121', name: 'Ceylon Agro Ltd', type: 'company', requestedRole: 'customer', submittedLabel: 'Yesterday', submittedAt: '18 Oct, 15:40', documentsUploaded: 3, documentsRequired: 3 }),
  open({ applicationId: 'APP-2026-0120', name: 'Malsha Gunawardena', type: 'staff', requestedRole: 'mechanic', submittedLabel: 'Yesterday', submittedAt: '18 Oct, 09:05', documentsUploaded: 2, documentsRequired: 3 }),
  open({ applicationId: 'APP-2026-0118', name: 'Tharindu Wijesinghe', type: 'staff', requestedRole: 'driver', submittedLabel: '2 days ago', submittedAt: '17 Oct, 10:12', documentsUploaded: 4, documentsRequired: 4 }),
  { applicationId: 'APP-2026-0119', name: 'Chathura Silva', type: 'staff', requestedRole: 'driver', status: 'rejected', submittedLabel: '3 days ago', submittedAt: '16 Oct, 17:22', documentsUploaded: 4, documentsRequired: 4, decidedAt: '18 Oct, 12:10', decidedBy: 'Ayesha Silva', accountId: null, rejectReason: 'Licence expired' },
  { applicationId: 'APP-2026-0114', name: 'Sanduni Jayawardena', type: 'staff', requestedRole: 'coordinator', status: 'approved', submittedLabel: '5 days ago', submittedAt: '14 Oct, 13:40', documentsUploaded: 3, documentsRequired: 3, decidedAt: '19 Oct, 14:05', decidedBy: 'Ayesha Silva', accountId: 'EMP-0161', rejectReason: null },
  { applicationId: 'APP-2026-0113', name: 'Quick Movers Lanka', type: 'company', requestedRole: 'customer', status: 'rejected', submittedLabel: '6 days ago', submittedAt: '13 Oct, 08:55', documentsUploaded: 3, documentsRequired: 3, decidedAt: '15 Oct, 10:30', decidedBy: 'Ayesha Silva', accountId: null, rejectReason: 'Registration not valid' },
  { applicationId: 'APP-2026-0112', name: 'Hayleys Freight', type: 'company', requestedRole: 'customer', status: 'approved', submittedLabel: '7 days ago', submittedAt: '12 Oct, 16:10', documentsUploaded: 3, documentsRequired: 3, decidedAt: '18 Oct, 11:20', decidedBy: 'Ayesha Silva', accountId: 'CUS-0034', rejectReason: null },
  { applicationId: 'APP-2026-0109', name: 'Pradeep Kumara', type: 'staff', requestedRole: 'driver', status: 'approved', submittedLabel: '9 days ago', submittedAt: '10 Oct, 11:02', documentsUploaded: 4, documentsRequired: 4, decidedAt: '16 Oct, 09:42', decidedBy: 'Nadeesha Perera', accountId: 'DRV-035', rejectReason: null },
  { applicationId: 'APP-2026-0107', name: 'Dilan Senarath', type: 'staff', requestedRole: 'mechanic', status: 'rejected', submittedLabel: '10 days ago', submittedAt: '9 Oct, 14:20', documentsUploaded: 3, documentsRequired: 3, decidedAt: '11 Oct, 09:15', decidedBy: 'Nadeesha Perera', accountId: null, rejectReason: 'Duplicate account' },
  { applicationId: 'APP-2026-0104', name: 'Ishara Bandara', type: 'staff', requestedRole: 'mechanic', status: 'approved', submittedLabel: '12 days ago', submittedAt: '7 Oct, 08:40', documentsUploaded: 3, documentsRequired: 3, decidedAt: '12 Oct, 15:18', decidedBy: 'Ayesha Silva', accountId: 'MEC-012', rejectReason: null },
  { applicationId: 'APP-2026-0101', name: 'Nova Electricals (Pvt) Ltd', type: 'company', requestedRole: 'customer', status: 'approved', submittedLabel: '2 weeks ago', submittedAt: '5 Oct, 10:15', documentsUploaded: 3, documentsRequired: 3, decidedAt: '10 Oct, 10:05', decidedBy: 'Nadeesha Perera', accountId: 'CUS-0031', rejectReason: null },
  { applicationId: 'APP-2026-0099', name: 'Amila Herath', type: 'staff', requestedRole: 'driver', status: 'rejected', submittedLabel: '2 weeks ago', submittedAt: '4 Oct, 12:30', documentsUploaded: 4, documentsRequired: 4, decidedAt: '8 Oct, 14:50', decidedBy: 'Ayesha Silva', accountId: null, rejectReason: 'Licence photos unreadable' },
  { applicationId: 'APP-2026-0097', name: 'Mohamed Rizwan', type: 'staff', requestedRole: 'driver', status: 'approved', submittedLabel: '3 weeks ago', submittedAt: '1 Oct, 09:00', documentsUploaded: 4, documentsRequired: 4, decidedAt: '7 Oct, 16:40', decidedBy: 'Ayesha Silva', accountId: 'DRV-031', rejectReason: null },
  { applicationId: 'APP-2026-0092', name: 'Kasun Traders', type: 'company', requestedRole: 'customer', status: 'rejected', submittedLabel: '3 weeks ago', submittedAt: '29 Sep, 15:45', documentsUploaded: 3, documentsRequired: 3, decidedAt: '2 Oct, 11:05', decidedBy: 'Nadeesha Perera', accountId: null, rejectReason: 'Contact not verified' },
]

/** Full review details for APP-2026-0118, copied from the Review frame (89:1770). */
export const tharinduDetail: Omit<ApplicationDetail, keyof ApplicationSummary> = {
  fullName: 'Tharindu Sampath Wijesinghe',
  nic: '199512345678',
  email: 'tharindu.w@gmail.com',
  mobile: '077 456 1290',
  address: '45/2, Temple Road, Gampaha',
  company: null,
  licencePhotos: [
    { side: 'Front', fileName: 'IMG_2041.jpg', size: '2.4 MB', url: null },
    { side: 'Back', fileName: 'IMG_2042.jpg', size: '2.1 MB', url: null },
  ],
  licence: { licenceClass: 'Heavy vehicle (C)', licenceNumber: 'B3344556', licenceExpiry: '2029-07-04' },
  documents: [
    { name: 'NIC — front and back.pdf', meta: 'PDF · 1.2 MB', status: 'verified' },
    { name: 'Medical certificate.pdf', meta: 'PDF · 540 KB', status: 'not-checked' },
    { name: 'Police clearance report.pdf', meta: 'PDF · 720 KB', status: 'verified' },
  ],
  checks: [
    { label: 'Email address verified', passed: true },
    { label: 'Mobile number verified', passed: true },
    { label: 'No duplicate account found', passed: true },
    { label: 'Licence photos uploaded (front and back)', passed: true },
    { label: 'Medical certificate needs a manual check', passed: false },
  ],
  timeline: [
    { text: 'Assigned to Ayesha Silva', time: 'Today, 08:30', tone: 'accent' },
    { text: 'Automatic checks completed', time: '17 Oct, 10:13', tone: 'success' },
    { text: 'Application submitted', time: '17 Oct, 10:12', tone: 'neutral' },
    { text: 'Application form generated', time: '16 Oct, 16:45', tone: 'neutral' },
  ],
  internalNote: '',
}

/** Contact details for the other applicants (the frames only list them). */
export const applicantContacts: Record<string, { email: string; mobile: string; address: string; contactName?: string; brNumber?: string }> = {
  'APP-2026-0123': { email: 'ruwan.b@yahoo.com', mobile: '071 223 9087', address: '12, Lake Road, Kurunegala' },
  'APP-2026-0121': { email: 'ops@ceylonagro.lk', mobile: '081 238 4400', address: 'No. 88, Kandy Road, Peradeniya', contactName: 'Ruwan Jayawardena', brNumber: 'PV 00098765' },
  'APP-2026-0120': { email: 'malsha.g@gmail.com', mobile: '076 410 2231', address: '9, Station Road, Panadura' },
}

export const depotsMock = ['Colombo depot', 'Kandy depot', 'Galle depot', 'Kurunegala depot']
export const licenceClassesMock = ['Light vehicle (B)', 'Heavy vehicle (C)', 'Heavy combination (CE)']
