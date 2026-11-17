import type { ComponentProps } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

type SelectInputProps = Omit<ComponentProps<'select'>, 'onChange' | 'value'> & {
  value: string
  onChange: (value: string) => void
  options: { id: string; label: string }[]
  /** Shown while nothing is chosen; can't be picked again. */
  placeholder: string
}

/** Style Guide → Select as a form control (native select), full width, with an empty placeholder option. */
export function SelectInput({ value, onChange, options, placeholder, className, ...props }: SelectInputProps) {
  return (
    <div className="relative flex items-center">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          'h-[42px] w-full appearance-none rounded-lg border border-line bg-card pr-9 pl-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft aria-invalid:border-danger',
          value === '' && 'text-faint',
          className,
        )}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="text-foreground">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-muted-foreground" aria-hidden />
    </div>
  )
}
