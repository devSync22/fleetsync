import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type KpiTone = 'neutral' | 'info' | 'success' | 'pending'

const chipClasses: Record<KpiTone, string> = {
  neutral: 'bg-secondary text-foreground',
  info: 'bg-info-soft text-info',
  success: 'bg-success-soft text-success',
  pending: 'bg-pending-soft text-pending',
}

type KpiCardProps = {
  label: string
  value: string | number
  meta?: string
  icon: LucideIcon
  tone?: KpiTone
  className?: string
}

/** Style Guide → KPI Card: icon chip, label, large value and a muted meta line. */
export function KpiCard({ label, value, meta, icon: Icon, tone = 'neutral', className }: KpiCardProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5', className)}>
      <div className={cn('flex size-10 items-center justify-center rounded-[10px]', chipClasses[tone])}>
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-[13px] leading-[18px] font-medium text-muted-foreground">{label}</p>
        <p className="text-[28px] leading-9 font-semibold tracking-[-0.01em]">{value}</p>
        {meta && <p className="truncate text-xs leading-4 text-muted-foreground">{meta}</p>}
      </div>
    </div>
  )
}
