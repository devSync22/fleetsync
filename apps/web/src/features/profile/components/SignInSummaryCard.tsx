import { Link } from 'react-router'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import type { Security } from '../types'

/** "Sign-in & security" on the Profile tab: a summary that links to the Password & security tab. */
export function SignInSummaryCard({ security, securityPath }: { security: Security; securityPath: string }) {
  return (
    <SectionCard title="Sign-in & security">
      <dl className="flex flex-col gap-3.5 px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <dt className="text-[13px] font-medium">Password</dt>
            <dd className="text-xs text-muted-foreground">Last changed {security.passwordLastChanged}</dd>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to={securityPath}>Change</Link>
          </Button>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[13px] font-medium">Last sign-in</dt>
          <dd className="text-xs text-muted-foreground">{security.lastSignIn}</dd>
        </div>
      </dl>
    </SectionCard>
  )
}
