import { CircleX } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

type CheckboxFieldProps = {
  /** Text next to the box. Can contain inline links, e.g. "I agree to the <a>terms</a>". */
  label: ReactNode
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  name?: string
  /** Error shown under the row (e.g. "Accept the terms to continue"). */
  error?: string
  /** 'md' = 18px box used on the sign-up forms; 'sm' = 16px box used on the login form. */
  size?: 'sm' | 'md'
  className?: string
}

/**
 * Checkbox with a clickable label (Figma "Checkbox"), built on shadcn's Checkbox.
 * Required checkboxes are validated by the parent form, which passes `error`.
 */
export function CheckboxField({
  label,
  checked,
  onCheckedChange,
  name,
  error,
  size = 'sm',
  className,
}: CheckboxFieldProps) {
  const id = useId()

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className={cn('flex items-center', size === 'md' ? 'gap-2.5' : 'gap-2')}>
        <Checkbox
          id={id}
          name={name}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
          aria-invalid={error ? true : undefined}
          className={cn(size === 'md' && 'size-[18px]')}
        />
        <label htmlFor={id} className="cursor-pointer text-[13px] text-foreground">
          {label}
        </label>
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-xs leading-4 text-danger" role="alert">
          <CircleX aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
