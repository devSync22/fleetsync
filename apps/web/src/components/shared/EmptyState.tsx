import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type EmptyStateTone = 'neutral' | 'accent' | 'pending' | 'danger'

const circleClasses: Record<EmptyStateTone, string> = {
  neutral: 'bg-secondary text-foreground',
  accent: 'bg-brand-soft text-brand',
  pending: 'bg-pending-soft text-pending',
  danger: 'bg-danger-soft text-danger',
}

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description: string
  tone?: EmptyStateTone
  action?: ReactNode
  /** Render without its own card chrome, e.g. inside a dashboard card body. */
  bare?: boolean
  className?: string
}

/** Style Guide → Empty state (also used for 403 / 404 / session expired). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  action,
  bare = false,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 px-6 py-8 text-center',
        !bare && 'rounded-xl border bg-card',
        className,
      )}
    >
      <div className={cn('flex size-14 items-center justify-center rounded-full', circleClasses[tone])}>
        <Icon className="size-6" aria-hidden />
      </div>
      <p className="text-base leading-6 font-semibold">{title}</p>
      <p className="max-w-xs text-[13px] leading-5 text-muted-foreground">{description}</p>
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}
