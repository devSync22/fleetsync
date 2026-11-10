import { Fragment } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/lib/utils'

type Crumb = { label: string; to?: string; mono?: boolean }

/** "‹ Trips / TRP-2203": the first crumb links back, the rest are the current location. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px]">
      <ChevronLeft className="size-3.5 text-brand" aria-hidden />
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && <span className="text-faint">/</span>}
          {item.to ? (
            <Link to={item.to} className={cn('font-semibold text-brand hover:underline', item.mono && 'font-mono')}>
              {item.label}
            </Link>
          ) : (
            <span className={cn('text-muted-foreground', item.mono && 'font-mono')}>{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}
