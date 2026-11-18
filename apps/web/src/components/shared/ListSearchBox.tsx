import { SearchInput } from '@/components/shared/SearchInput'
import { cn } from '@/lib/utils'

type ListSearchBoxProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Width override, e.g. "min-w-[280px] flex-1" to stretch. */
  className?: string
}

/** The grey search field at the start of each list card's filter row. */
export function ListSearchBox({ value, onChange, placeholder, className }: ListSearchBoxProps) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={placeholder}
      className={cn('w-[280px] border-0 bg-secondary py-[9px]', className)}
    />
  )
}
