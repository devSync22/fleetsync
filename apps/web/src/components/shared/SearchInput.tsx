import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Accessible name, e.g. "Search orders". */
  label: string
  /** e.g. "border-0 bg-secondary" for the grey search inside a table card. */
  className?: string
}

/** Search box that filters the list below it. */
export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps) {
  return (
    <label
      className={cn(
        'flex w-72 items-center gap-2 rounded-lg border bg-card px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50',
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
      />
    </label>
  )
}
