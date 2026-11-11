import checkBoldIcon from '@/assets/icons/check-bold.svg'
import checkLargeIcon from '@/assets/icons/check-lg.svg'
import infoCircleMdIcon from '@/assets/icons/info-circle-md.svg'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { RegistrationSubmission } from '../types'
import styles from './RegistrationSubmitted.module.css'

type RegistrationSubmittedProps = {
  submission: RegistrationSubmission
  /** "Resend verification link" handler; the parent page calls the API. */
  onResendVerification: () => void | Promise<void>
}

/** Hours the email verification link stays valid. Keep in sync with the backend. */
const VERIFICATION_LINK_VALID_HOURS = 24

/** done = green check, current = accent number, upcoming = grey number. */
type StepStatus = 'done' | 'current' | 'upcoming'

type Step = {
  title: string
  description: string
  status: StepStatus
}

/** "23 Oct 2026, 09:05" — date + 24h time, as in the summary card. */
function formatDateTime(date: Date) {
  const day = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return `${day}, ${formatTime(date)}`
}

/** "09:05" */
function formatTime(date: Date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

/** "Today, 09:05" for today's date, otherwise the full date and time. */
function formatRelativeDateTime(date: Date) {
  const isToday = date.toDateString() === new Date().toDateString()
  return isToday ? `Today, ${formatTime(date)}` : formatDateTime(date)
}

/**
 * Confirmation shown after a customer registration or staff application
 * (Figma "Auth — Registration submitted (Customer & Staff)").
 * Rendered by the sign-up pages in place of their form once submission succeeds.
 */
export function RegistrationSubmitted({
  submission,
  onResendVerification,
}: RegistrationSubmittedProps) {
  const { reference, firstName, email, accountType, submittedAt } = submission

  // Right after submitting the user is always on step 2 (verify email);
  // later steps happen outside this screen and are reported by email.
  const steps: Step[] = [
    {
      title: 'Registration submitted',
      description: formatRelativeDateTime(submittedAt),
      status: 'done',
    },
    {
      title: 'Verify your email',
      description: `Open the link we sent to ${email}. It expires in ${VERIFICATION_LINK_VALID_HOURS} hours.`,
      status: 'current',
    },
    {
      title: 'Review by a Fleet Administrator',
      description: 'We check your details and documents, usually within 2 working days.',
      status: 'upcoming',
    },
    {
      title: 'Account ready',
      description:
        'We email you when you can sign in. Staff roles and depots are assigned at this step.',
      status: 'upcoming',
    },
  ]

  return (
    <div className={styles.confirmation}>
      <div className={styles.successIcon} aria-hidden="true">
        <img src={checkLargeIcon} width={28} height={28} alt="" />
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Registration submitted</h1>
        <p className={styles.subtitle}>
          Thanks, {firstName}. We have received your request and sent a verification link to{' '}
          {email}.
        </p>
      </div>

      {/* Summary card: label on the left, value on the right (a description list for screen readers). */}
      <dl className={styles.summary}>
        {/* The reference comes from the server, so the row is hidden until it's known. */}
        {reference && (
          <div className={styles.summaryRow}>
            <dt>Reference</dt>
            <dd className={styles.reference}>{reference}</dd>
          </div>
        )}
        <div className={styles.summaryRow}>
          <dt>Account type</dt>
          <dd>{accountType}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Sign-in email</dt>
          <dd>{email}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Submitted</dt>
          <dd>{formatDateTime(submittedAt)}</dd>
        </div>
        <div className={styles.summaryRow}>
          <dt>Status</dt>
          <dd>
            <StatusBadge tone="pending" label="Pending review" />
          </dd>
        </div>
      </dl>

      <section className={styles.nextSteps} aria-labelledby="next-steps-title">
        <h2 id="next-steps-title" className={styles.nextStepsTitle}>
          What happens next
        </h2>
        {/* Vertical timeline: a marker + connecting line on the left of each step. */}
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <li
              key={step.title}
              className={[styles.step, styles[step.status]].join(' ')}
              // Lets screen readers announce which step the user is on.
              aria-current={step.status === 'current' ? 'step' : undefined}
            >
              <div className={styles.track}>
                <span className={styles.marker}>
                  {step.status === 'done' ? (
                    <img src={checkBoldIcon} width={12} height={12} alt="" />
                  ) : (
                    index + 1
                  )}
                </span>
                {/* No connecting line after the last step. */}
                {index < steps.length - 1 && <span className={styles.line} />}
              </div>
              <div className={styles.stepText}>
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.actions}>
        <Button href="/" fullWidth>
          Back to sign in
        </Button>
        <p className={styles.resend}>
          Didn’t get the email?{' '}
          <button type="button" className={styles.resendButton} onClick={onResendVerification}>
            Resend verification link
          </button>
        </p>
      </div>

      <p className={styles.note}>
        <img src={infoCircleMdIcon} width={16} height={16} alt="" />
        You can’t sign in until your account is approved. Keep your reference number if you
        contact us.
      </p>
    </div>
  )
}
