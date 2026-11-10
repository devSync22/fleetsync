import { ChevronDown } from 'lucide-react'

type FilterSelectProps<T extends string> = {
  label: string
  value: T
  options: { id: T; label: string }[]
  onChange: (value: T) => void
}

/** Style Guide Select (native under the hood) used for sorting and filtering card lists. */
export function FilterSelect<T extends string>({ label, value, options, onChange }: FilterSelectProps<T>) {
  return (
    <label className="relative flex w-[230px] shrink-0 items-center">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full appearance-none rounded-lg border border-line bg-card py-[9px] pr-9 pl-3 text-sm leading-5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-muted-foreground" aria-hidden />
    </label>
  )
}
