import { ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import type { LoginError, LoginRequest } from '../types'
import { formatAttemptsLeft } from '../utils/loginErrors'
import { authLinkClass, AuthFormHeader } from './AuthFormHeader'
import { CheckboxField } from './CheckboxField'

type LoginFormProps = {
  /** Called with the entered credentials; the parent page performs the actual login. */
  onSubmit: (values: LoginRequest) => void | Promise<void>
  /** Disables the submit button and shows "Signing in…" while a request is in flight. */
  isSubmitting?: boolean
  /** Failed sign-in to display: danger banner plus the password field's error state. */
  error?: LoginError
  /** Info shown above the form when there is no error (e.g. "Password updated"). */
  notice?: { title: string; message: string }
}

/**
 * Presentational sign-in form (Figma "Login", node 33:438, and "Login — error", 33:687).
 * Holds the field state locally and hands the values to `onSubmit`; it does not call the API.
 */
export function LoginForm({ onSubmit, isSubmitting = false, error, notice }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    // Trim the email so stray spaces don't cause a failed login; the password is sent as typed.
    void onSubmit({ email: email.trim(), password, rememberMe })
  }

  return (
    <form className="flex w-full max-w-[400px] flex-col gap-5" onSubmit={handleSubmit}>
      {/*
        Per the Figma frames: with no error, an empty 100px slot sits ABOVE the
        heading; with an error, the banner appears BELOW the heading, so the form
        barely moves when the error appears.
      */}
      {!error &&
        (notice ? (
          <Banner tone="success" title={notice.title} message={notice.message} />
        ) : (
          <div aria-hidden="true" className="h-[100px]" />
        ))}

      <AuthFormHeader title="Sign in" subtitle="Welcome back. Use the email registered with your account." />

      {error && <Banner tone="danger" title={error.title} message={error.message} />}

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
        // Only the password field is marked invalid (as in the design): we never reveal whether
        // the email exists. Remaining attempts are shown when the API provides them.
        invalid={Boolean(error)}
        helperText={error?.attemptsLeft !== undefined ? formatAttemptsLeft(error.attemptsLeft) : undefined}
      />

      <div className="flex items-center justify-between gap-3">
        {/* "Remember me": sent as `rememberMe` so the cookie survives closing the browser. */}
        <CheckboxField
          name="rememberMe"
          label="Keep me signed in"
          checked={rememberMe}
          onCheckedChange={setRememberMe}
        />
        <Link to="/auth/forgot-password" className={`text-[13px] whitespace-nowrap ${authLinkClass}`}>
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        New here?
      </div>

      {/* Two sign-up paths: customers register, staff request an account for approval. */}
      <div className="flex flex-col gap-3 min-[440px]:flex-row">
        <Button variant="outline" className="min-w-0 flex-1" asChild>
          <Link to="/auth/register">Register as customer</Link>
        </Button>
        <Button variant="outline" className="min-w-0 flex-1" asChild>
          <Link to="/auth/request-staff-account">Request staff account</Link>
        </Button>
      </div>

      {/* Reminds users that navigation is role-based after sign-in. */}
      <p className="flex items-center gap-2 text-xs text-faint">
        <ShieldCheck aria-hidden="true" className="size-3.5" />
        You’ll see only the pages your role has access to.
      </p>
    </form>
  )
}
