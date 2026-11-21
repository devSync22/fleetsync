import { Monitor, Smartphone } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/services/apiClient'
import type { Security } from '../types'

type SessionsCardProps = {
  security: Security
  busy: boolean
  error: ApiError | null
  onSignOut: (id: string) => void
  onSignOutOthers: () => void
}

function joinNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names.at(-1)}` : (names[0] ?? '')
}

/** "Where you’re signed in": each device with Sign out, and Sign out of all other devices. */
export function SessionsCard({ security, busy, error, onSignOut, onSignOutOthers }: SessionsCardProps) {
  const others = security.sessions.filter((s) => !s.current)
  const change = security.passwordChange

  return (
    <SectionCard title="Where you’re signed in" subtitle="Sign out of a device you don’t recognise">
      <div className="flex flex-col gap-3.5 px-6 py-5">
        {error && <Banner tone="danger" title="Couldn’t sign out that device" message={error.message} />}
        <ul className="flex flex-col gap-3.5">
          {security.sessions.map((session) => {
            const Icon = session.kind === 'desktop' ? Monitor : Smartphone
            return (
              <li key={session.id} className="flex items-center gap-2.5">
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[13px] font-medium">{session.device}</span>
                  <span className="text-xs text-muted-foreground">
                    {session.location} · {session.lastActive}
                  </span>
                </span>
                {session.current ? (
                  <StatusBadge status="this-device" />
                ) : (
                  <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => onSignOut(session.id)}>
                    Sign out
                  </Button>
                )}
              </li>
            )
          })}
        </ul>

        {change && change.signedOut.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {change.signedOut.length} other {change.signedOut.length === 1 ? 'device was' : 'devices were'} signed out at{' '}
            {change.at}: {joinNames(change.signedOut)}.
          </p>
        )}

        {others.length > 0 && (
          <Button type="button" variant="outline" size="sm" className="w-full" disabled={busy} onClick={onSignOutOthers}>
            Sign out of all other devices
          </Button>
        )}
      </div>
    </SectionCard>
  )
}
