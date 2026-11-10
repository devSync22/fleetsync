import { useMatch, useNavigate } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { InfoNote } from '@/components/shared/InfoNote'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChangePasswordCard } from '../components/ChangePasswordCard'
import { ChangeRequestsCard } from '../components/ChangeRequestsCard'
import { IdentityCard } from '../components/IdentityCard'
import { PersonalDetailsCard } from '../components/PersonalDetailsCard'
import { SessionsCard } from '../components/SessionsCard'
import { SignInActivityCard } from '../components/SignInActivityCard'
import { SignInSummaryCard } from '../components/SignInSummaryCard'
import { useProfile } from '../hooks/useProfile'

type Tab = 'profile' | 'security'

const PROFILE_PATH = '/coordinator/profile'
const SECURITY_PATH = `${PROFILE_PATH}/security`

const tabs: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Password & security' },
]

function LoadingColumns() {
  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]" aria-busy="true" aria-label="Loading your profile">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[106px] w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[140px] w-full rounded-xl" />
      </div>
    </div>
  )
}

/**
 * "Coordinator — Profile & settings" (417:8776), "Password & security" (453:10118) and
 * "Password updated" (456:10519). Both tabs are one route so switching keeps the loaded data.
 */
export function ProfileSettingsPage() {
  const navigate = useNavigate()
  const tab: Tab = useMatch(SECURITY_PATH) ? 'security' : 'profile'
  const profile = useProfile()
  const overview = profile.overview

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Profile & settings"
        description="Your own account. Changes to your details are approved by a Fleet Administrator."
      />
      <StatusTabs
        label="Profile sections"
        tabs={tabs}
        activeId={tab}
        onChange={(id) => navigate(id === 'security' ? SECURITY_PATH : PROFILE_PATH)}
      />

      {profile.state.status === 'loading' && <LoadingColumns />}

      {profile.state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load your profile"
          message={profile.state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={profile.retry}>
              Try again
            </Button>
          }
        />
      )}

      {overview && tab === 'profile' && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <IdentityCard profile={overview.profile} />
            <PersonalDetailsCard
              saved={overview.profile.details}
              submitting={profile.submitting}
              error={profile.submitError}
              onSubmit={profile.submitChanges}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <ChangeRequestsCard requests={overview.changeRequests} />
            <SignInSummaryCard security={overview.security} securityPath={SECURITY_PATH} />
          </div>
        </div>
      )}

      {overview && tab === 'security' && (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ChangePasswordCard
              security={overview.security}
              email={overview.profile.details.workEmail}
              updating={profile.updatingPassword}
              error={profile.passwordError}
              onUpdate={profile.updatePassword}
            />
            <SignInActivityCard
              events={overview.security.signIns}
              includesChanges={overview.security.signIns.some((e) => e.outcome === 'password-changed')}
            />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <SessionsCard
              security={overview.security}
              busy={profile.signingOut}
              error={profile.sessionError}
              onSignOut={profile.signOut}
              onSignOutOthers={profile.signOutOthers}
            />
            <InfoNote className="rounded-[10px] bg-secondary px-3.5 py-3">
              Something looks wrong? Change your password and contact a Fleet Administrator.
            </InfoNote>
          </div>
        </div>
      )}
    </div>
  )
}
