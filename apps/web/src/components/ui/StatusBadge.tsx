import styles from './StatusBadge.module.css'

/**
 * Tones of the Figma "StatusBadge" component. Only `pending` is used so far;
 * add more (approved, rejected…) as their screens are built.
 */
type StatusBadgeTone = 'pending'

type StatusBadgeProps = {
  /** Text inside the badge, e.g. "Pending review". */
  label: string
  tone: StatusBadgeTone
}

/** Small coloured pill showing the status of a record (Figma node 16:47). */
export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return <span className={[styles.badge, styles[tone]].join(' ')}>{label}</span>
}
