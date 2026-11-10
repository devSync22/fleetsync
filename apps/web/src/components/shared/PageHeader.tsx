import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageHeaderProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
}

/** Page title (28 / Bold), muted description and right-aligned actions. */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-4', className)}>
      <div className="flex min-w-0 flex-col gap-1">
        <h1 className="text-[28px] leading-9 font-bold tracking-[-0.01em]">{title}</h1>
        {description && <div className="text-[13px] text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
