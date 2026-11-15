import { Bell, CircleCheck, Clock, SquareCheck } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AttentionItem } from '../types'

const kindStyle = {
  'not-started': { icon: Clock, chip: 'bg-danger-soft text-danger' },
  'notification-not-opened': { icon: Bell, chip: 'bg-pending-soft text-pending' },
  'odometer-missing': { icon: SquareCheck, chip: 'bg-brand-soft text-brand' },
}

export function NeedsAttentionCard({ items }: { items: AttentionItem[] }) {
  return (
    <SectionCard title="Needs attention" subtitle={`${items.length} ${items.length === 1 ? 'item' : 'items'}`}>
      {items.length === 0 ? (
        <EmptyState bare icon={CircleCheck} title="All clear" description="Late starts and unopened notifications show up here." />
      ) : (
        <ul>
          {items.map((item) => {
            const { icon: Icon, chip } = kindStyle[item.kind]
            return (
              <li key={item.title} className="flex gap-3 border-b px-5 py-4 last:border-b-0">
                <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', chip)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs leading-[18px] text-muted-foreground">{item.description}</p>
                  {item.action.to ? (
                    <Button asChild variant="outline" size="sm" className="mt-1.5">
                      <Link to={item.action.to}>{item.action.label}</Link>
                    </Button>
                  ) : (
                    // TODO: call the resend-notification endpoint once it exists
                    <Button type="button" variant="outline" size="sm" className="mt-1.5">
                      {item.action.label}
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
