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
  // pending — pending / due soon
  pending: { label: 'Pending', tone: 'pending' },
  'pending-review': { label: 'Pending review', tone: 'pending' },
  'awaiting-payment': { label: 'Awaiting payment', tone: 'pending' },
  'due-soon': { label: 'Due soon', tone: 'pending' },
  // accent — assigned / quoted / scheduled
  quoted: { label: 'Quoted', tone: 'accent' },
  assigned: { label: 'Assigned', tone: 'accent' },
  scheduled: { label: 'Scheduled', tone: 'accent' },
  // info — on trip / in progress
  'in-progress': { label: 'In progress', tone: 'info' },
  'on-trip': { label: 'On trip', tone: 'info' },
  // success — active / completed / paid
  active: { label: 'Active', tone: 'success' },
  available: { label: 'Available', tone: 'success' },
  completed: { label: 'Completed', tone: 'success' },
  paid: { label: 'Paid', tone: 'success' },
  // danger — overdue / failed / suspended / cancelled
  overdue: { label: 'Overdue', tone: 'danger' },
  'payment-failed': { label: 'Payment failed', tone: 'danger' },
  suspended: { label: 'Suspended', tone: 'danger' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
} as const satisfies Record<string, { label: string; tone: StatusTone }>

export type DomainStatus = keyof typeof statusMeta
