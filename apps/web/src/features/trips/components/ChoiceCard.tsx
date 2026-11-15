import type { ReactNode } from 'react'
import { InfoNote } from '@/components/shared/InfoNote'
import { SectionCard } from '@/components/shared/SectionCard'
import { cn } from '@/lib/utils'

export type ChoiceColumn<T> = {
  header: string
  /** Fixed column width class from the frame, e.g. "w-[120px]". */
  width: string
  render: (row: T) => ReactNode
}

type ChoiceCardProps<T> = {
  title: string
  subtitle: string
  filter: ReactNode
  /** Radio group name; also the accessible label of the list. */
  name: string
  mainHeader: string
  renderMain: (row: T) => ReactNode
  columns: ChoiceColumn<T>[]
  rows: T[]
  getKey: (row: T) => string
  selected: string | null
  onSelect: (key: string) => void
  footnote?: string
  emptyText: string
}

/** One "1. Choose a vehicle"-style card on Create trip: a table where each row is a radio option. */
export function ChoiceCard<T>({
  title,
  subtitle,
  filter,
  name,
  mainHeader,
  renderMain,
  columns,
  rows,
  getKey,
  selected,
  onSelect,
  footnote,
  emptyText,
}: ChoiceCardProps<T>) {
  return (
    <SectionCard title={title} subtitle={subtitle} action={filter}>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="flex gap-3.5 border-b bg-background px-5 py-2 text-xs font-medium text-muted-foreground" aria-hidden>
            <span className="w-[18px] shrink-0" />
            <span className="min-w-0 flex-1">{mainHeader}</span>
            {columns.map((column) => (
              <span key={column.header} className={cn('shrink-0', column.width)}>
                {column.header}
              </span>
            ))}
          </div>
          <div role="radiogroup" aria-label={title}>
            {rows.length === 0 && <p className="px-5 py-4 text-[13px] text-muted-foreground">{emptyText}</p>}
            {rows.map((row) => {
              const key = getKey(row)
              const checked = key === selected
              return (
                <label
                  key={key}
                  className={cn(
                    'flex cursor-pointer items-center gap-3.5 border-b px-5 py-3 transition-colors last:border-b-0',
                    checked ? 'bg-brand-soft' : 'hover:bg-secondary/60',
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={key}
                    checked={checked}
                    onChange={() => onSelect(key)}
                    className="size-[18px] shrink-0 accent-brand"
                  />
                  <div className="min-w-0 flex-1">{renderMain(row)}</div>
                  {columns.map((column) => (
                    <div key={column.header} className={cn('shrink-0 text-[13px]', column.width)}>
                      {column.render(row)}
                    </div>
                  ))}
                </label>
              )
            })}
          </div>
        </div>
      </div>
      {footnote && <InfoNote className="border-t px-5 py-3">{footnote}</InfoNote>}
    </SectionCard>
  )
}
