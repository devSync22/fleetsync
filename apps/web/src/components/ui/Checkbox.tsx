import type { InputHTMLAttributes, ReactNode } from 'react'
import styles from './Checkbox.module.css'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  /** Text next to the box. Can contain inline links, e.g. "I agree to the <a>terms</a>". */
  label: ReactNode
}

export function Checkbox({ label, className, ...inputProps }: CheckboxProps) {
  return (
    // The whole label is clickable, so tapping the text toggles the box too.
    <label className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <input type="checkbox" className={styles.box} {...inputProps} />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
