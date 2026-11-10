import { Search } from 'lucide-react'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Accessible name, e.g. "Search orders". */
  label: string
}

/** Page-level search box that filters the list below it. */
export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  return (
    <label className="flex w-72 items-center gap-2 rounded-lg border bg-card px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50">
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
