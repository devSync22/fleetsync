import { MailCheck } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { AuthFormHeader } from '../components/AuthFormHeader'
import { IconBadge } from '../components/IconBadge'
import { useTokenCheck } from '../hooks/useTokenCheck'
import { verifyEmail } from '../services/authApi'

/**
 * `/auth/verify-email?token=…`, opened from the link in the registration email.
 * Confirms the address; the application then waits for a Fleet Administrator.
 *
 * There is no Figma frame for this page yet; it reuses the patterns of the
 * forgot-password screen (icon badge, title, banner, full-width button).
 */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const result = useTokenCheck(searchParams.get('token'), verifyEmail)

  if (result.status === 'checking') {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Confirming your email…
      </p>
    )
  }

  return (
    <div className="flex w-full max-w-[400px] flex-col gap-5">
      <IconBadge icon={MailCheck} />

      {result.status === 'valid' ? (
        <>
          <AuthFormHeader
            title="Email confirmed"
            subtitle="Thanks. A Fleet Administrator will now review your registration. We’ll email you when you can sign in."
          />
          <Banner
            tone="info"
            title="Waiting for approval"
            message="Reviews usually take up to 2 working days."
          />
        </>
      ) : (
        <>
          <AuthFormHeader title="We couldn’t confirm your email" />
          <Banner
            tone="danger"
            title="Link invalid or expired"
            message="This link has expired or was already used. If you haven’t confirmed your email yet, register again or ask us to resend the link from the confirmation screen."
          />
        </>
      )}

      <Button className="w-full" asChild>
        <Link to="/auth/login">Back to sign in</Link>
      </Button>
    </div>
  )
}
