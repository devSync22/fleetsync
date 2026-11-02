import { Search } from 'lucide-react'

type OrderSearchProps = {
  value: string
  onChange: (value: string) => void
}

export function OrderSearch({ value, onChange }: OrderSearchProps) {
  return (
    <label className="flex w-72 items-center gap-2 rounded-lg border bg-card px-3 py-2 focus-within:ring-3 focus-within:ring-ring/50">
      <Search className="size-4 shrink-0 text-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search order ID, customer or route…"
        aria-label="Search orders"
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
      />
    </label>
  )
}
