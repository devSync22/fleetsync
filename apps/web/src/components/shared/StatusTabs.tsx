import { cn } from '@/lib/utils'

export type StatusTab<T extends string> = {
  id: T
  label: string
  /** Shown as a pill after the label; leave undefined while loading. */
  count?: number
}

type StatusTabsProps<T extends string> = {
  tabs: StatusTab<T>[]
  activeId: T
  onChange: (id: T) => void
  /** Accessible name for the tab list, e.g. "Order status". */
  label: string
}

/** Underlined tab bar with counts, used to switch a list page between its states. */
export function StatusTabs<T extends string>({ tabs, activeId, onChange, label }: StatusTabsProps<T>) {
  return (
    <div className="border-b">
      <div role="tablist" aria-label={label} className="-mb-px flex gap-6 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.id === activeId
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
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs leading-4 font-semibold',
                    active ? 'bg-brand-soft text-brand' : 'bg-secondary text-muted-foreground',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
