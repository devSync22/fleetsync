/** Status Badge tones from the Style Guide — one colour per meaning. */
export type StatusTone = 'neutral' | 'pending' | 'accent' | 'info' | 'success' | 'danger'

/**
 * Every domain status the app shows, mapped to its badge label and tone.
 * Add new statuses here so the colour stays consistent across screens.
 */
export const statusMeta = {
  // neutral — inactive / draft / off duty
  draft: { label: 'Draft', tone: 'neutral' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  'off-duty': { label: 'Off duty', tone: 'neutral' },
  'in-maintenance': { label: 'In maintenance', tone: 'neutral' },
  'not-due': { label: 'Not due yet', tone: 'neutral' },
  'no-payment': { label: 'No payment', tone: 'neutral' },
  'quotation-expired': { label: 'Quotation expired', tone: 'neutral' },
  declined: { label: 'Declined by customer', tone: 'neutral' },
  busy: { label: 'Busy', tone: 'neutral' },
  // pending — pending / due soon
  pending: { label: 'Pending', tone: 'pending' },
  'pending-review': { label: 'Pending review', tone: 'pending' },
  'awaiting-payment': { label: 'Awaiting payment', tone: 'pending' },
  'due-soon': { label: 'Due soon', tone: 'pending' },
  'service-soon': { label: 'Service soon', tone: 'pending' },
  'not-opened': { label: 'Not opened', tone: 'pending' },
  maintenance: { label: 'Maintenance', tone: 'pending' },
  // accent — assigned / quoted / scheduled
  quoted: { label: 'Quoted', tone: 'accent' },
  assigned: { label: 'Assigned', tone: 'accent' },
  scheduled: { label: 'Scheduled', tone: 'accent' },
  // info — on trip / in progress / accepted
  'in-progress': { label: 'In progress', tone: 'info' },
  'on-trip': { label: 'On trip', tone: 'info' },
  delivered: { label: 'Delivered', tone: 'info' },
  'password-changed': { label: 'Password changed', tone: 'info' },
  accepted: { label: 'Accepted', tone: 'info' },
  // success — active / completed / paid
  active: { label: 'Active', tone: 'success' },
  available: { label: 'Available', tone: 'success' },
  free: { label: 'Free', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  paid: { label: 'Paid', tone: 'success' },
  opened: { label: 'Opened', tone: 'success' },
  'trip-created': { label: 'Trip created', tone: 'success' },
  approved: { label: 'Approved', tone: 'success' },
  'signed-in': { label: 'Success', tone: 'success' },
  'this-device': { label: 'This device', tone: 'success' },
  // danger — overdue / failed / suspended / cancelled
  overdue: { label: 'Overdue', tone: 'danger' },
  'payment-failed': { label: 'Payment failed', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  'trip-cancelled': { label: 'Trip cancelled', tone: 'danger' },
  rejected: { label: 'Rejected', tone: 'danger' },
  'wrong-password': { label: 'Wrong password', tone: 'danger' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>

export type DomainStatus = keyof typeof statusMeta
