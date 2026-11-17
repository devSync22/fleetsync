import type { ComponentProps, ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { fieldAria, fieldId } from '../newOrderOptions'
import type { NewOrderField } from '../types'
import { FormField } from './FormField'

type TextFieldProps = Omit<ComponentProps<'input'>, 'id' | 'value' | 'onChange'> & {
  field: NewOrderField
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  helper?: ReactNode
  /** Unit shown inside the right edge, e.g. "kg". */
  suffix?: string
  fieldClassName?: string
}

/** A labelled text input of the New transport order form, with its helper or error. */
export function TextField({ field, label, value, onChange, error, helper, suffix, fieldClassName, className, ...props }: TextFieldProps) {
  const id = fieldId(field)
  return (
    <FormField id={id} label={label} helper={helper} error={error} className={fieldClassName}>
      <div className="relative flex items-center">
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(suffix && 'pr-10', className)}
          {...fieldAria(id, { error, helper })}
          {...props}
        />
        {suffix && <span className="pointer-events-none absolute right-3 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </FormField>
  )
}
