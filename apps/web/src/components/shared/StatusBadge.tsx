import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { statusMeta, type DomainStatus, type StatusTone } from './statusTones'

const toneClasses: Record<StatusTone, string> = {
  neutral: 'bg-secondary text-muted-foreground',
  pending: 'bg-pending-soft text-pending',
  accent: 'bg-brand-soft text-brand',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
}

type StatusBadgeProps = { className?: string } & (
  | { status: DomainStatus; tone?: never; children?: never }
  | { status?: never; tone: StatusTone; children: ReactNode }
)

/** Soft tinted badge (Style Guide → Status Badge). Pass a domain `status`, or a `tone` with custom text. */
export function StatusBadge({ status, tone, children, className }: StatusBadgeProps) {
  const resolvedTone = status ? statusMeta[status].tone : tone
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-md px-2.5 py-[3px] text-xs leading-4 font-semibold whitespace-nowrap',
        toneClasses[resolvedTone],
        className,
      )}
    >
      {status ? statusMeta[status].label : children}
    </span>
  )
}
