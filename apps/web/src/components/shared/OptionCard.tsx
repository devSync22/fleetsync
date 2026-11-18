import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type OptionCardProps = {
  /** Radio group name shared by the cards of one question. */
  name: string
  value: string
  checked: boolean
  onSelect: (value: string) => void
  title: string
  description?: string
  /** Extra content on the right, e.g. a "Current" badge. */
  aside?: ReactNode
  disabled?: boolean
  className?: string
}

/**
 * Bordered radio option with a title and a muted description. Selected = accent border on accent-soft
 * (role pickers on Create user / Change role, "Sign-in setup", reject reasons…).
 */
export function OptionCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  aside,
  disabled = false,
  className,
}: OptionCardProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-[10px] border px-4 py-3 transition-colors',
        checked ? 'border-2 border-brand bg-brand-soft px-[15px] py-[11px]' : 'bg-card hover:bg-secondary/60',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onSelect(value)}
        className="size-[18px] shrink-0 accent-brand"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm leading-5 font-semibold">{title}</span>
        {description && <span className="text-xs leading-4 text-muted-foreground">{description}</span>}
      </span>
      {aside}
    </label>
  )
}
