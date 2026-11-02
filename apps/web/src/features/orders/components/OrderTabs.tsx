import { cn } from '@/lib/utils'
import { orderTabs } from '../orderTabs'
import type { OrderTab } from '../types'

type OrderTabsProps = {
  activeTab: OrderTab
  /** Order count per tab; hidden while loading. */
  counts: Record<OrderTab, number> | null
  onChange: (tab: OrderTab) => void
}

export function OrderTabs({ activeTab, counts, onChange }: OrderTabsProps) {
  return (
    <div role="tablist" aria-label="Order status" className="-mb-px flex gap-6 overflow-x-auto">
      {orderTabs.map((tab) => {
        const active = tab.id === activeTab
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 border-b-2 pt-1 pb-3 text-sm whitespace-nowrap transition-colors',
              active
                ? 'border-brand font-semibold text-foreground'
                : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
            {counts && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs leading-4 font-semibold',
                  active ? 'bg-brand-soft text-brand' : 'bg-secondary text-muted-foreground',
                )}
              >
                {counts[tab.id]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
