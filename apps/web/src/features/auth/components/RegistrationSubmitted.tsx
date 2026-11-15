import { Check, Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn, formatDateTime, formatTime } from '@/lib/utils'
import type { RegistrationSubmission } from '../types'

type RegistrationSubmittedProps = {
  submission: RegistrationSubmission
  /** "Resend verification link" handler (customers only); the parent page calls the API. */
  onResendVerification?: () => void | Promise<void>
  /** 'sending' while the resend runs, 'sent' after it succeeded. */
  resendState?: 'idle' | 'sending' | 'sent'
}

/** Hours the email verification link stays valid (API: Auth:Tokens:EmailVerificationHours). */
const VERIFICATION_LINK_VALID_HOURS = 48

/** done = green check, current = accent number, upcoming = grey number. */
type StepStatus = 'done' | 'current' | 'upcoming'

type Step = {
  title: string
  description: string
  status: StepStatus
}

/** "Today, 09:05" for today's date, otherwise the full date and time. */
function formatRelativeDateTime(date: Date) {
  const isToday = date.toDateString() === new Date().toDateString()
  return isToday ? `Today, ${formatTime(date)}` : formatDateTime(date)
}

/**
 * The timeline under "What happens next". Customers verify their email, then
 * wait for review. Staff skip verification: after review they get an emailed
 * link to create their password (the Figma frame shows the customer path).
 */
function buildSteps({ kind, email, submittedAt }: RegistrationSubmission): Step[] {
  const submitted: Step = { title: 'Registration submitted', description: formatRelativeDateTime(submittedAt), status: 'done' }

  if (kind === 'customer') {
    return [
      submitted,
      {
        title: 'Verify your email',
        description: `Open the link we sent to ${email}. It expires in ${VERIFICATION_LINK_VALID_HOURS} hours.`,
        status: 'current',
      },
      {
        title: 'Review by a Fleet Administrator',
        description: 'We check your company details, usually within 2 working days.',
        status: 'upcoming',
      },
      { title: 'Account ready', description: 'We email you when you can sign in.', status: 'upcoming' },
    ]
  }

  return [
    submitted,
    {
      title: 'Review by a Fleet Administrator',
      description: 'We check your details and documents, usually within 2 working days.',
      status: 'current',
    },
    {
      title: 'Create your password',
      description: `If approved, we email ${email} a link to set your password.`,
      status: 'upcoming',
    },
    { title: 'Account ready', description: 'Staff roles and depots are assigned at this step.', status: 'upcoming' },
  ]
}

const markerClasses: Record<StepStatus, string> = {
  done: 'border-success bg-success text-white',
  current: 'border-brand bg-brand-soft text-brand',
  upcoming: 'border-line bg-card text-faint',
}

/**
 * Confirmation shown after a customer registration or staff application
 * (Figma "Auth — Registration submitted (Customer & Staff)", node 371:7348).
 * Rendered by the sign-up pages in place of their form once submission succeeds.
 */
export function RegistrationSubmitted({ submission, onResendVerification, resendState = 'idle' }: RegistrationSubmittedProps) {
  const { kind, reference, firstName, email, accountType, submittedAt } = submission
  const steps = buildSteps(submission)

  const summary: { label: string; value: ReactNode; mono?: boolean }[] = [
    { label: 'Reference', value: reference, mono: true },
    { label: 'Account type', value: accountType },
    { label: 'Sign-in email', value: email },
    { label: 'Submitted', value: formatDateTime(submittedAt) },
    { label: 'Status', value: <StatusBadge status="pending-review" /> },
  ]

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-6">
      <div aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-success-soft">
        <Check className="size-7 text-success" strokeWidth={2.5} />
      </div>

      <div className="flex flex-col gap-2">
        {/* Slightly larger than the form titles (30px vs 28px), per the design. */}
        <h1 className="text-[30px] font-bold text-foreground">Registration submitted</h1>
        <p className="text-[15px] leading-[22px] break-words text-muted-foreground">
          {kind === 'customer'
            ? `Thanks, ${firstName}. We have received your request and sent a verification link to ${email}.`
            : `Thanks, ${firstName}. We have received your application and sent a confirmation to ${email}.`}
        </p>
      </div>

      {/* Summary card: label on the left, value on the right (a description list for screen readers). */}
      <dl className="divide-y divide-border rounded-xl border border-border bg-card">
        {summary.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3 text-[13px]">
            <dt className="shrink-0 whitespace-nowrap text-muted-foreground">{row.label}</dt>
            <dd className={cn('min-w-0 text-right font-medium break-words text-foreground', row.mono && 'font-mono')}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="next-steps-title">
        <h2 id="next-steps-title" className="mb-3 text-sm font-semibold text-foreground">
          What happens next
        </h2>
        {/* Vertical timeline: a marker + connecting line on the left of each step. */}
        <ol>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3"
              // Lets screen readers announce which step the user is on.
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    'flex size-[22px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-[11px] font-semibold',
                    markerClasses[step.status],
                  )}
                >
                  {step.status === 'done' ? <Check aria-hidden="true" className="size-3" strokeWidth={3} /> : index + 1}
                </span>
                {/* No connecting line after the last step. */}
                {index < steps.length - 1 && (
                  <span className={cn('w-0.5 flex-1', step.status === 'done' ? 'bg-success' : 'bg-border')} />
                )}
              </div>
              <div className={cn('flex min-w-0 flex-1 flex-col gap-0.5 pt-px', index < steps.length - 1 && 'pb-[18px]')}>
                <p
                  className={cn(
                    'text-sm',
                    step.status === 'upcoming' ? 'font-medium text-muted-foreground' : 'font-semibold text-foreground',
                  )}
                >
                  {step.title}
                </p>
                <p className="text-[13px] leading-[19px] text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-col gap-3">
        <Button className="w-full" asChild>
          <Link to="/auth/login">Back to sign in</Link>
        </Button>
        {kind === 'customer' && onResendVerification && (
          <p className="text-[13px] text-muted-foreground" aria-live="polite">
            {resendState === 'sent' ? (
              'A new verification link is on its way.'
            ) : (
              <>
                Didn’t get the email?{' '}
                <button
                  type="button"
                  className="cursor-pointer font-semibold text-brand hover:underline disabled:cursor-default disabled:text-faint disabled:no-underline"
                  disabled={resendState === 'sending'}
                  onClick={() => void onResendVerification()}
                >
                  {resendState === 'sending' ? 'Sending…' : 'Resend verification link'}
                </button>
              </>
            )}
          </p>
        )}
      </div>

      <p className="flex items-start gap-2 rounded-md bg-secondary px-3 py-2.5 text-xs leading-[17px] text-muted-foreground">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        You can’t sign in until your account is approved. Keep your reference number if you contact us.
      </p>
    </div>
  )
}
