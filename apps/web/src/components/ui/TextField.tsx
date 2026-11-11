import { useId, type InputHTMLAttributes } from 'react'
import xCircleSmallIcon from '@/assets/icons/x-circle-sm.svg'
import styles from './TextField.module.css'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  /** Puts the field in its error state: red border and `aria-invalid`. */
  invalid?: boolean
  /**
   * Short hint shown under the input (e.g. "2 attempts left").
   * When the field is invalid it is prefixed with the danger icon.
   */
  helperText?: string
  /** Renders the typed value in the monospace font (for codes and phone numbers). */
  monospace?: boolean
}

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
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={[styles.input, invalid && styles.invalid, monospace && styles.monospace]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={invalid || undefined}
        aria-describedby={helperText ? helperId : undefined}
        {...inputProps}
      />
      {helperText && (
        <p id={helperId} className={styles.helper}>
          {invalid && <img src={xCircleSmallIcon} width={14} height={14} alt="" />}
          {helperText}
        </p>
      )}
    </div>
  )
}
