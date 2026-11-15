import { CircleX } from 'lucide-react'
import { useId, type ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = Omit<ComponentProps<'select'>, 'children' | 'size'> & {
  label: string
  options: SelectOption[]
  /** Optional first, empty choice (e.g. "Select a role") so nothing is pre-selected. */
  placeholder?: string
  /** Error message shown under the box (also sets `aria-invalid`). */
  error?: string
}

/**
 * Labelled dropdown (Figma "Select"). A native <select> (shadcn NativeSelect)
 * so keyboard, mobile pickers and screen readers work out of the box.
 */
export function SelectField({
  label,
  options,
  placeholder,
  error,
  id,
  className,
  ...selectProps
}: SelectFieldProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <Label htmlFor={selectId}>{label}</Label>
      <NativeSelect
        id={selectId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...selectProps}
      >
        {/* Empty value means "not chosen", so `required` blocks submission until a choice is made. */}
        {placeholder && (
          <NativeSelectOption value="" disabled>
            {placeholder}
          </NativeSelectOption>
        )}
        {options.map((option) => (
          <NativeSelectOption key={option.value} value={option.value}>
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-xs leading-4 text-danger">
          <CircleX aria-hidden="true" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}
