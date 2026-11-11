import { useState, type FormEvent } from 'react'
import infoCircleSmallIcon from '@/assets/icons/info-circle-sm.svg'
import lockIcon from '@/assets/icons/lock.svg'
import { Button } from '@/components/ui/Button'
import { IconBadge } from '@/components/ui/IconBadge'
import { TextField } from '@/components/ui/TextField'
import { meetsPasswordRules } from '../utils/passwordRules'
import styles from './AuthForm.module.css'
import { PasswordStrength } from './PasswordStrength'

type SetNewPasswordFormProps = {
  /** Called with the new password once it passes the rules and matches the confirmation. */
  onSubmit: (newPassword: string) => void | Promise<void>
  /** Disables the button and shows "Updating…" while a request is in flight. */
  isSubmitting?: boolean
  /** Account the reset link belongs to; shown as "For <email>" when known. */
  email?: string
}

/**
 * "Set a new password" form (Figma "Auth — Set new password"), opened from the
 * reset link emailed by the forgot-password screen. Shows live strength
 * feedback, and only submits when every rule passes and both entries match.
 */
export function SetNewPasswordForm({
  onSubmit,
  isSubmitting = false,
  email,
}: SetNewPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  // Both errors only appear after a submit attempt, not while the user is typing.
  const [rulesError, setRulesError] = useState(false)
  const [mismatchError, setMismatchError] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const rulesOk = meetsPasswordRules(password)
    const matches = password === confirmPassword
    setRulesError(!rulesOk)
    setMismatchError(!matches)
    if (!rulesOk || !matches) return

    void onSubmit(password)
  }

  return (
    <form className={[styles.form, styles.compact].join(' ')} onSubmit={handleSubmit}>
      <IconBadge icon={lockIcon} />

      <div className={styles.header}>
        <h1 className={styles.title}>Set a new password</h1>
        {email && <p className={styles.subtitle}>For {email}</p>}
      </div>

      {/*
        Hidden username field so password managers save the new password
        against the right account (recommended by Chrome/Safari).
      */}
      {email && (
        <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
      )}

      <TextField
        label="New password"
        type="password"
        name="newPassword"
        autoComplete="new-password"
        placeholder="••••••••••••"
        required
        value={password}
        onChange={(event) => {
          setPassword(event.target.value)
          setRulesError(false)
        }}
        invalid={rulesError}
        helperText={rulesError ? 'Your password doesn’t meet all the rules below' : undefined}
      />

      <PasswordStrength
        password={password}
        // Can't be checked in the browser; the server rejects a reused password.
        serverRules={['Not the same as your last password']}
      />

      <TextField
        label="Confirm new password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="••••••••••••"
        required
        value={confirmPassword}
        onChange={(event) => {
          setConfirmPassword(event.target.value)
          setMismatchError(false)
        }}
        invalid={mismatchError}
        helperText={mismatchError ? 'Passwords don’t match' : undefined}
      />

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Updating…' : 'Update password'}
      </Button>

      <p className={styles.note}>
        <img src={infoCircleSmallIcon} width={14} height={14} alt="" />
        You’ll be signed out of other devices after the change.
      </p>
    </form>
  )
}
