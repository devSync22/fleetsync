import { Info, Lock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Banner } from '@/components/shared/Banner'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/services/apiClient'
import { meetsPasswordRules } from '../utils/passwordRules'
import { AuthFormHeader } from './AuthFormHeader'
import { IconBadge } from './IconBadge'
import { PasswordStrength } from './PasswordStrength'

type SetNewPasswordFormProps = {
  /** Called with the new password once it passes the rules and matches the confirmation. */
  onSubmit: (newPassword: string) => void | Promise<void>
  /** Disables the button and shows "Updating…" while a request is in flight. */
  isSubmitting?: boolean
  /** Account the reset link belongs to; shown as "For <email>". */
  email: string
  /** The last failed submit (e.g. "Choose a new password" when it matches an earlier one). */
  error?: ApiError
}

/**
 * "Set a new password" form (Figma "Auth — Set new password", node 113:4333),
 * opened from the reset link emailed by the forgot-password screen. Shows live
 * strength feedback, and only submits when every rule passes and both entries match.
 */
export function SetNewPasswordForm({ onSubmit, isSubmitting = false, email, error }: SetNewPasswordFormProps) {
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
    <form className="flex w-full max-w-[400px] flex-col gap-5" onSubmit={handleSubmit}>
      <IconBadge icon={Lock} />

      <AuthFormHeader title="Set a new password" subtitle={`For ${email}`} />

      {error && <Banner tone="danger" title={error.title} message={error.detail} />}

      {/* Hidden username field so password managers save the new password against the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

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
        // Can't be checked in the browser; the server rejects any of the last 5 passwords.
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

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Updating…' : 'Update password'}
      </Button>

      <p className="flex items-center gap-2 text-xs text-faint">
        <Info aria-hidden="true" className="size-3.5" />
        You’ll be signed out of other devices after the change.
      </p>
    </form>
  )
}
