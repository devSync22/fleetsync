import { useState } from 'react'
import { Bell, CreditCard, FileText, Mail, Package, TriangleAlert, type LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useNotifications } from '../hooks/useNotifications'
import type { AppNotification, NotificationKind } from '../types'

const kindStyles: Record<NotificationKind, { icon: LucideIcon; chip: string }> = {
  'new-order': { icon: FileText, chip: 'bg-brand-soft text-brand' },
  payment: { icon: CreditCard, chip: 'bg-success-soft text-success' },
  'vehicle-issue': { icon: TriangleAlert, chip: 'bg-pending-soft text-pending' },
  'trip-update': { icon: Package, chip: 'bg-info-soft text-info' },
  mail: { icon: Mail, chip: 'bg-secondary text-muted-foreground' },
}

const groups = [
  { id: 'today', label: 'TODAY' },
  { id: 'earlier', label: 'EARLIER' },
] as const

function NotificationRow({ item, onOpen }: { item: AppNotification; onOpen: (item: AppNotification) => void }) {
  const { icon: Icon, chip } = kindStyles[item.kind]
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className={cn(
          'flex w-full items-start gap-3 px-5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset',
          item.unread ? 'bg-brand-soft hover:bg-brand-soft/70' : 'hover:bg-secondary/60',
        )}
      >
        <span className={cn('flex size-[34px] shrink-0 items-center justify-center rounded-full', chip)}>
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[13px] font-semibold">{item.title}</span>
          <span className="text-[13px] leading-[18px] text-muted-foreground">{item.message}</span>
          <span className="text-[11px] text-faint">{item.timeLabel}</span>
        </span>
        {item.unread ? (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand">
            <span className="sr-only">Unread</span>
          </span>
        ) : (
          <span className="size-2 shrink-0" />
        )}
      </button>
    </li>
  )
}

/** Top-bar bell with the Notifications panel (457:11263). */
export function NotificationsBell() {
  const navigate = useNavigate()
  const { state, retry, items, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const shown = filter === 'unread' ? items.filter((n) => n.unread) : items

  const openItem = (item: AppNotification) => {
    if (item.unread) markAsRead([item.id])
    setOpen(false)
    navigate(item.to)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          className="relative flex size-9 items-center justify-center rounded-full border hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none data-[state=open]:bg-secondary"
        >
          <Bell className="size-[18px]" strokeWidth={1.5} aria-hidden />
          {unreadCount > 0 && <span className="absolute top-[7px] right-[6px] size-2 rounded-full bg-danger" />}
        </button>
      </PopoverTrigger>
      <PopoverContent aria-label="Notifications" className="flex max-h-[min(720px,calc(100vh-88px))] w-[420px] flex-col">
        <div className="flex items-center gap-2 px-5 pt-4 pb-2.5">
          <h2 className="text-base font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <span className="rounded-[10px] bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">{unreadCount} new</span>
          )}
          <span className="flex-1" />
          {unreadCount > 0 && (
            <button type="button" onClick={markAllAsRead} className="text-[13px] font-semibold text-brand hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        <div role="tablist" aria-label="Show notifications" className="flex gap-[18px] border-b px-5">
          {(['all', 'unread'] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={filter === id}
              onClick={() => setFilter(id)}
              className={cn(
                '-mb-px border-b-2 pt-1 pb-2 text-[13px] transition-colors',
                filter === id ? 'border-brand font-semibold' : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {id === 'all' ? 'All' : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {state.status === 'loading' && (
            <div className="flex flex-col gap-3 px-5 py-4" aria-busy="true" aria-label="Loading notifications">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="size-[34px] rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-1/2" />
                    <Skeleton className="h-3.5 w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {state.status === 'error' && (
            <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
              <p className="text-[13px] text-muted-foreground">{state.error.message}</p>
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            </div>
          )}

          {state.status === 'success' &&
            (shown.length === 0 ? (
              <p className="px-5 py-10 text-center text-[13px] text-muted-foreground">
                {filter === 'unread' ? 'No unread notifications.' : 'No notifications yet.'}
              </p>
            ) : (
              <>
                {groups.map((group) => {
                  const inGroup = shown.filter((n) => n.group === group.id)
                  if (inGroup.length === 0) return null
                  return (
                    <section key={group.id} aria-label={group.label.toLowerCase()}>
                      <h3 className="px-5 pt-3 pb-1 text-[11px] font-semibold tracking-[0.05em] text-faint">{group.label}</h3>
                      <ul>
                        {inGroup.map((item) => (
                          <NotificationRow key={item.id} item={item} onOpen={openItem} />
                        ))}
                      </ul>
                    </section>
                  )
                })}
                <p className="mt-1 border-t py-3 text-center text-xs text-faint">You’re all caught up after these</p>
              </>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
