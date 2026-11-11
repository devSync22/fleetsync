import { useId, type SelectHTMLAttributes } from 'react'
import styles from './Select.module.css'

type SelectOption = {
  value: string
  label: string
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> & {
  label: string
  options: SelectOption[]
  /** Optional first, empty choice (e.g. "Select a role") so nothing is pre-selected. */
  placeholder?: string
}

/**
 * Labelled dropdown (Figma component "Select"). Uses a native <select> so
 * keyboard, mobile pickers and screen readers work out of the box; only the
 * closed box is styled.
 */
export function Select({ label, options, placeholder, id, className, ...selectProps }: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label htmlFor={selectId} className={styles.label}>
        {label}
      </label>
      <select id={selectId} className={styles.select} {...selectProps}>
        {/* Empty value means "not chosen", so `required` blocks submission until a choice is made. */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
