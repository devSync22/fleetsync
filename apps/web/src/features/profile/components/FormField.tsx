import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  id: string
  label: string
  /** Muted line under the control, e.g. "Changed — will be sent for approval". */
  helper?: ReactNode
  children: ReactNode
  className?: string
}

/** Style Guide → Input: label, control and an optional helper line. */
export function FormField({ id, label, helper, children, className }: FormFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] leading-5 font-medium">
        {label}
      </label>
      {children}
      {helper && (
        <div id={`${id}-helper`} className="flex items-center gap-1.5 text-xs leading-4 text-muted-foreground">
          {helper}
        </div>
      )}
    </div>
  )
}
