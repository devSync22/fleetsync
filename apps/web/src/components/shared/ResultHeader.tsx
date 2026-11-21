import type { ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ResultHeaderProps = {
  tone: 'success' | 'danger'
  title: string
  badge: ReactNode
  description: string
  actions: ReactNode
}

/** Big confirmation card at the top of the Trip created / Trip cancelled pages. */
export function ResultHeader({ tone, title, badge, description, actions }: ResultHeaderProps) {
  const Icon = tone === 'success' ? Check : X
  return (
    <section className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-xl border bg-card px-7 py-6">
      <div
        className={cn(
          'flex size-14 shrink-0 items-center justify-center rounded-full',
          tone === 'success' ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger',
        )}
      >
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="flex min-w-[280px] flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl leading-8 font-bold tracking-[-0.01em]">{title}</h1>
          {badge}
        </div>
        <p className="max-w-[700px] text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 gap-2">{actions}</div>
    </section>
  )
}
