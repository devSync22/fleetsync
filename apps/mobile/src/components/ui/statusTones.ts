import type { Tone } from '@/theme';

/**
 * Every domain status shown in the mobile app, mapped to one of the six tones
 * from the Figma "Status colour map". Add new statuses here — never pick a colour in a screen.
 */
export const statusTones = {
  // Neutral — inactive / off duty
  Draft: 'neutral',
  Inactive: 'neutral',
  'Off duty': 'neutral',
  Deactivated: 'neutral',

  // Pending — waiting on someone, due soon
  Pending: 'pending',
  'Pending review': 'pending',
  'Service due': 'pending',
  'Due soon': 'pending',
  Reported: 'pending',

  // Accent — assigned / scheduled
  Quoted: 'accent',
  Assigned: 'accent',
  Scheduled: 'accent',

  // Info — in progress / on trip
  Accepted: 'info',
  'In progress': 'info',
  Processing: 'info',
  'On trip': 'info',
  'In service': 'info',
  'Changes requested': 'info',

  // Success — completed / approved
  Completed: 'success',
  Paid: 'success',
  Available: 'success',
  Approved: 'success',
  Active: 'success',
  Resolved: 'success',

  // Danger — cancelled / overdue
  Cancelled: 'danger',
  Failed: 'danger',
  'Out of service': 'danger',
  Overdue: 'danger',
  Rejected: 'danger',
  'Licence expiring': 'danger',
} as const satisfies Record<string, Tone>;

export type Status = keyof typeof statusTones;

/** Tone for a status; unknown statuses fall back to neutral. */
export function getStatusTone(status: string): Tone {
  return (statusTones as Record<string, Tone>)[status] ?? 'neutral';
}
