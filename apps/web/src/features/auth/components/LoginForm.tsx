import { useState, type FormEvent } from 'react'
import shieldIcon from '@/assets/icons/shield.svg'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { TextField } from '@/components/ui/TextField'
import type { LoginRequest } from '../types/auth'
import styles from './LoginForm.module.css'

type LoginFormProps = {
  onSubmit: (values: LoginRequest) => void | Promise<void>
  isSubmitting?: boolean
  errorMessage?: string
}

export function LoginForm({
  onSubmit,
  isSubmitting = false,
  errorMessage,
}: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit({ email: email.trim(), password, rememberMe })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {/* Reserves space so showing an error doesn't shift the form. */}
      <div className={styles.messageSlot}>
        {errorMessage && (
          <div role="alert" className={styles.error}>
            {errorMessage}
          </div>
        )}
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>
          Welcome back. Use the email registered with your account.
        </p>
      </div>

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
      />

      <div className={styles.options}>
        <Checkbox
          label="Keep me signed in"
          name="rememberMe"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
        />
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

      <p className={styles.note}>
        <img src={shieldIcon} width={14} height={14} alt="" />
        You’ll see only the pages your role has access to.
      </p>
    </form>
  )
}
