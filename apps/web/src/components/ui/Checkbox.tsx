import type { InputHTMLAttributes } from 'react'
import styles from './Checkbox.module.css'

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string
}

export function Checkbox({ label, className, ...inputProps }: CheckboxProps) {
  return (
    <label className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <input type="checkbox" className={styles.box} {...inputProps} />
      <span className={styles.label}>{label}</span>
    </label>
  )
}
