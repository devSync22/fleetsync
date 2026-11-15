import { cn } from '@/lib/utils'
import { statusTone, type StatusTone } from './statusTone'

const toneClasses: Record<StatusTone, string> = {
  neutral: 'bg-secondary text-muted-foreground',
  pending: 'bg-pending-soft text-pending',
  accent: 'bg-brand-soft text-brand',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
}

type StatusBadgeProps = {
  /** Text inside the badge, e.g. "Pending review". */
  label: string
  /** Either an explicit tone, or a domain status that is mapped with `statusTone`. */
  tone?: StatusTone
  status?: string
  className?: string
}

/** Small pill showing a record's status (Figma "Status Badge", node 16:47): soft background, strong label, no dot. */
export function StatusBadge({ label, tone, status, className }: StatusBadgeProps) {
  const resolved = tone ?? (status ? statusTone(status) : 'neutral')

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs leading-4 font-semibold whitespace-nowrap',
        toneClasses[resolved],
        className,
      )}
    >
      {label}
    </span>
  )
}
