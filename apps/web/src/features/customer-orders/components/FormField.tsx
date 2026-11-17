import type { ReactNode } from 'react'
import { CircleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  /** id of the control the label points at. */
  id: string
  label: string
  /** Muted line under the control (Style Guide → Input helper). Replaced by the error when there is one. */
  helper?: ReactNode
  error?: string
  children: ReactNode
  className?: string
}

/**
 * Style Guide → Input: label, control, helper — plus the error message under the field.
 * Same pattern as features/profile FormField; move both to components/shared when a third form needs it.
 */
export function FormField({ id, label, helper, error, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] leading-5 font-medium">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-xs leading-4 text-danger">
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        helper && (
          <p id={`${id}-helper`} className="text-xs leading-4 text-muted-foreground">
            {helper}
          </p>
        )
      )}
    </div>
  )
}
