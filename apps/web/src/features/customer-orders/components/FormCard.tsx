import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FormCardTone = 'info' | 'accent' | 'pending'

const toneClasses: Record<FormCardTone, string> = {
  info: 'bg-info-soft text-info',
  accent: 'bg-brand-soft text-brand',
  pending: 'bg-pending-soft text-pending',
}

type FormCardProps = {
  icon: LucideIcon
  tone: FormCardTone
  title: string
  subtitle?: string
  /** Right side of the header, e.g. the Review step's "Edit". */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Card with a tinted icon tile in the header, used by every step of New transport order. */
export function FormCard({ icon: Icon, tone, title, subtitle, action, children, className }: FormCardProps) {
  return (
    <section className={cn('flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card', className)}>
      <header className={cn('flex items-center gap-3 border-b px-6', subtitle ? 'py-4' : 'py-3.5')}>
        <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', toneClasses[tone])}>
          <Icon className="size-4" aria-hidden />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}
