import { ChevronLeft, KeyRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { TextField } from '@/components/shared/TextField'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/services/apiClient'
import { authLinkClass, AuthFormHeader } from './AuthFormHeader'
import { IconBadge } from './IconBadge'

/** Seconds the user must wait before requesting another reset email. */
const RESEND_COOLDOWN_SECONDS = 60

/** Minutes a reset link stays valid (API: Auth:Tokens:PasswordResetMinutes). */
const RESET_LINK_VALID_MINUTES = 60

type ForgotPasswordFormProps = {
  /** Called with the email to send a reset link to (first send and "Send again"). */
  onSubmit: (email: string) => void | Promise<void>
  /** Disables the buttons and shows "Sending…" while a request is in flight. */
  isSubmitting?: boolean
  /**
   * Time (ms since epoch) the last link was sent. When set, the success banner
   * and the "Send again" countdown are shown.
   */
  sentAt?: number
  /** The last request failed (network or server error). */
  error?: ApiError
}

/** 45 → "0:45", 60 → "1:00". */
function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

/**
 * "Forgot your password?" form (Figma "Auth — Forgot password", node 113:4235).
 * After a send, shows a deliberately vague success message — it never says
 * whether the email has an account, so the form can't be used to find users.
 */
export function ForgotPasswordForm({ onSubmit, isSubmitting = false, sentAt, error }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  // Current time, refreshed every second while the resend countdown runs.
  const [now, setNow] = useState(() => Date.now())

  // Tick once a second after a send, and stop once the cooldown is over.
  useEffect(() => {
    if (sentAt === undefined) return
    const cooldownEndsAt = sentAt + RESEND_COOLDOWN_SECONDS * 1000
    const timer = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current >= cooldownEndsAt) window.clearInterval(timer)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [sentAt])

  // Clamped to the cooldown because `now` can lag up to a second behind a fresh `sentAt`.
  const secondsLeft =
    sentAt === undefined
      ? 0
      : Math.min(RESEND_COOLDOWN_SECONDS, Math.max(0, Math.ceil((sentAt + RESEND_COOLDOWN_SECONDS * 1000 - now) / 1000)))

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void onSubmit(email.trim())
  }

  return (
    <form className="flex w-full max-w-[400px] flex-col gap-5" onSubmit={handleSubmit}>
      <Link to="/auth/login" className={`inline-flex items-center gap-1.5 self-start text-[13px] ${authLinkClass}`}>
        <ChevronLeft aria-hidden="true" className="size-3.5" />
        Back to sign in
      </Link>

      <IconBadge icon={KeyRound} />

      <AuthFormHeader
        title="Forgot your password?"
        subtitle="Enter the email you sign in with. We’ll send a link to set a new password."
      />

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

      {/*
        Stays enabled during the cooldown (as in the design) so a user who mistyped
        their email can fix it and send right away. Abuse is limited by the API's rate limit.
      */}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send reset link'}
      </Button>

      {error && <Banner title={error.title} message={error.detail} />}

      {sentAt !== undefined && !error && (
        <>
          <Banner
            tone="success"
            title="Check your email"
            message={`If an account exists for that email, a reset link is on its way. It expires in ${RESET_LINK_VALID_MINUTES} minutes.`}
          />

          <p className="text-[13px] text-muted-foreground">
            Didn’t get it?{' '}
            {/* Disabled (grey) with a countdown first; becomes a link-style button when it reaches 0. */}
            <button
              type="submit"
              className="cursor-pointer font-semibold text-brand hover:enabled:underline disabled:cursor-default disabled:text-faint"
              disabled={isSubmitting || secondsLeft > 0}
            >
              {secondsLeft > 0 ? `Send again in ${formatCountdown(secondsLeft)}` : 'Send again'}
            </button>
          </p>
        </>
      )}
    </form>
  )
}
