import { CircleX } from 'lucide-react'
import { useId, type ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type TextFieldProps = ComponentProps<'input'> & {
  label: string
  /** Puts the field in its error state: red border and `aria-invalid`. */
  invalid?: boolean
  /**
   * Short hint under the input (e.g. "2 attempts left", "You'll sign in with this email").
   * When the field is invalid it is shown in red with the danger icon.
   */
  helperText?: string
  /** Renders the typed value in the monospace font (codes, phone and ID numbers). */
  monospace?: boolean
}

/**
 * Labelled text input with an optional helper line (Figma "Input"),
 * built on shadcn's Input and Label.
 */
export function TextField({
  label,
  id,
  className,
  invalid = false,
  helperText,
  monospace = false,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  // Linked through aria-describedby so screen readers read the hint with the field.
  const helperId = `${inputId}-helper`

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        className={cn(monospace && 'font-mono')}
        aria-invalid={invalid || undefined}
        aria-describedby={helperText ? helperId : undefined}
        {...inputProps}
      />
      {helperText && (
        <p
          id={helperId}
          className={cn('flex items-center gap-1.5 text-xs leading-4', invalid ? 'text-danger' : 'text-muted-foreground')}
        >
          {invalid && <CircleX aria-hidden="true" className="size-3.5 shrink-0" />}
          {helperText}
        </p>
      )}
    </div>
  )
}
