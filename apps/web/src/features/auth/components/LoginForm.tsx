import { useState, type FormEvent } from 'react'
import shieldIcon from '@/assets/icons/shield.svg'
import { Banner } from '@/components/ui/Banner'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { TextField } from '@/components/ui/TextField'
import type { LoginError, LoginRequest } from '../types/auth'
import { formatAttemptsLeft } from '../utils/loginErrors'
import styles from './LoginForm.module.css'

type LoginFormProps = {
  /** Called with the entered credentials; the parent page performs the actual login. */
  onSubmit: (values: LoginRequest) => void | Promise<void>
  /** Disables the submit button and shows "Signing in…" while a request is in flight. */
  isSubmitting?: boolean
  /** Failed sign-in to display: danger banner plus the password field's error state. */
  error?: LoginError
}

/**
 * Presentational sign-in form. Holds the field state locally and hands the
 * values to `onSubmit`; it does not call the API itself.
 */
export function LoginForm({ onSubmit, isSubmitting = false, error }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Trim the email so stray spaces don't cause a failed login; the password is sent as typed.
    void onSubmit({ email: email.trim(), password, rememberMe })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/*
        Per the Figma frames: with no error, an empty slot sits ABOVE the
        heading; with an error, the banner appears BELOW the heading. The empty
        slot is roughly the banner's height, so the form barely moves when the
        error appears.
      */}
      {!error && <div className={styles.messageSlot} aria-hidden="true" />}

      <div className={styles.header}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>
          Welcome back. Use the email registered with your account.
        </p>
      </div>

      {error && <Banner title={error.title} message={error.message} />}

      <TextField
        label="Email address"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="name@company.lk"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <TextField
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••••"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        // Only the password field is marked as invalid (as in the design): we never
        // reveal whether the email exists. Remaining attempts are shown when the API provides them.
        invalid={Boolean(error)}
        helperText={
          error?.attemptsLeft !== undefined ? formatAttemptsLeft(error.attemptsLeft) : undefined
        }
      />

      <div className={styles.options}>
        {/* "Remember me": sent as `rememberMe` so the backend can issue a longer-lived session. */}
        <Checkbox
          label="Keep me signed in"
          name="rememberMe"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
        {/* TODO: the /forgot-password screen is not built yet. */}
        <a href="/forgot-password" className={styles.link}>
          Forgot password?
        </a>
      </div>

      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className={styles.divider}>
        <span>New here?</span>
      </div>

      {/*
        Two sign-up paths: customers self-register, staff request an account
        for approval. TODO: neither /register nor /request-staff-account exists yet.
      */}
      <div className={styles.registerActions}>
        <Button variant="secondary" href="/register" className={styles.registerButton}>
          Register as customer
        </Button>
        <Button
          variant="secondary"
          href="/request-staff-account"
          className={styles.registerButton}
        >
          Request staff account
        </Button>
      </div>

      {/* Reminds users that navigation is role-based after sign-in. */}
      <p className={styles.note}>
        <img src={shieldIcon} width={14} height={14} alt="" />
        You’ll see only the pages your role has access to.
      </p>
    </form>
  )
}
