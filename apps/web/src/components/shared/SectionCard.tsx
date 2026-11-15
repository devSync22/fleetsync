import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

type SectionCardProps = {
  title: string
  subtitle?: ReactNode
  /** Accent text link on the right of the header. */
  link?: { label: string; to: string }
  /** Any other header control (select, button); used instead of `link`. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** White card with the Style Guide header pattern: title, muted subtitle and a link or control on the right. */
export function SectionCard({ title, subtitle, link, action, children, className }: SectionCardProps) {
  return (
    <section className={cn('flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card', className)}>
      <header className="flex items-center justify-between gap-4 border-b px-5 py-3.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="text-[15px] leading-[22px] font-semibold">{title}</h2>
          {subtitle && <p className="text-xs leading-4 text-muted-foreground">{subtitle}</p>}
        </div>
        {link && (
          <Link to={link.to} className="shrink-0 text-[13px] font-semibold text-brand hover:underline">
            {link.label}
          </Link>
        )}
        {action}
      </header>
      {children}
    </section>
  )
}
