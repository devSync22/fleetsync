import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ResultTone = 'success' | 'danger' | 'info'

const circleClasses: Record<ResultTone, string> = {
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}

type ResultCardProps = {
  icon: LucideIcon
  tone: ResultTone
  title: string
  message: ReactNode
  /** Spin the icon (pending). */
  spinning?: boolean
  children?: ReactNode
}

/** Centred 560px card of the Payment result frames: tinted icon, title, message, then details and buttons. */
export function ResultCard({ icon: Icon, tone, title, message, spinning = false, children }: ResultCardProps) {
  return (
    <div className="flex justify-center pt-10">
      <section className="flex w-[560px] max-w-full flex-col items-center gap-4 rounded-2xl border bg-card px-6 pt-10 pb-8 sm:px-10">
        <span className={cn('flex size-16 items-center justify-center rounded-full', circleClasses[tone])}>
          <Icon className={cn('size-7', spinning && 'animate-spin')} aria-hidden />
        </span>
        <h1 className="text-center text-2xl leading-8 font-bold tracking-[-0.01em]">{title}</h1>
        <p className="text-center text-sm leading-[22px] text-muted-foreground">{message}</p>
        {children}
      </section>
    </div>
  )
}
