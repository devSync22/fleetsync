import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { SignInEvent } from '../types'

const outcomeStatus = {
  success: 'signed-in',
  'wrong-password': 'wrong-password',
  'password-changed': 'password-changed',
} as const

export function SignInActivityCard({ events, includesChanges }: { events: SignInEvent[]; includesChanges: boolean }) {
  return (
    <SectionCard
      title="Recent sign-in activity"
      subtitle={includesChanges ? 'Sign-ins and security changes to your account' : `The last ${events.length} sign-ins to your account`}
    >
      <ul>
        {events.map((event) => (
          <li key={event.id} className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0">
            <span className="w-[150px] shrink-0 text-[13px] font-medium">{event.when}</span>
            <span className="min-w-0 flex-1 text-[13px] text-muted-foreground">{event.description}</span>
            <StatusBadge status={outcomeStatus[event.outcome]} />
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
