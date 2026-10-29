import type { ReactNode } from 'react'
import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BannerTone = 'danger' | 'pending' | 'info' | 'success'

const toneStyles: Record<BannerTone, { box: string; title: string; icon: LucideIcon }> = {
  danger: { box: 'bg-danger-soft', title: 'text-danger', icon: CircleAlert },
  pending: { box: 'bg-pending-soft', title: 'text-pending', icon: TriangleAlert },
  info: { box: 'bg-info-soft', title: 'text-info', icon: Info },
  success: { box: 'bg-success-soft', title: 'text-success', icon: CircleCheck },
}

type BannerProps = {
  tone: BannerTone
  title: string
  message: string
  action?: ReactNode
  className?: string
}

/** Style Guide → Banner: inline error, warning, info and success messages. */
export function Banner({ tone, title, message, action, className }: BannerProps) {
  const { box, title: titleClass, icon: Icon } = toneStyles[tone]
  return (
    <div role={tone === 'danger' ? 'alert' : 'status'} className={cn('flex items-start gap-3 rounded-[10px] px-4 py-3.5', box, className)}>
      <Icon className={cn('mt-px size-[18px] shrink-0', titleClass)} aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-5">
        <p className={cn('text-sm font-semibold', titleClass)}>{title}</p>
        <p className="text-[13px]">{message}</p>
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  )
}
