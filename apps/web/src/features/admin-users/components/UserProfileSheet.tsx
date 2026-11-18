import { useState } from 'react'
import { Banner } from '@/components/shared/Banner'
import { SideSheet } from '@/components/shared/SideSheet'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/hooks/useAction'
import { formatDate, initialsOf } from '@/lib/utils'
import { useUserProfile } from '../hooks/useUserProfile'
import { roleInfo } from '../roles'
import { sendPasswordReset } from '../services/adminUsersApi'
import type { LicenceStatus, UserAccount } from '../types'
import { ActivityList } from './ActivityList'
import { ProfileField } from './ProfileField'
import { ProfileSection } from './ProfileSection'

type UserProfileSheetProps = {
  userId: string
  onClose: () => void
  onChangeRole: (user: UserAccount) => void
  onDeactivate: (user: UserAccount) => void
}

const licenceBadge: Record<LicenceStatus, { tone: 'success' | 'pending' | 'danger'; label: string }> = {
  valid: { tone: 'success', label: 'Valid' },
  expiring: { tone: 'pending', label: 'Expiring soon' },
  expired: { tone: 'danger', label: 'Expired' },
}

/** "User accounts / View profile" (83:1486): details, account facts and recent activity of one user. */
export function UserProfileSheet({ userId, onClose, onChangeRole, onDeactivate }: UserProfileSheetProps) {
  const { state, retry } = useUserProfile(userId)
  const [tab, setTab] = useState<'overview' | 'activity'>('overview')
  const reset = useAction(sendPasswordReset)
  const [resetSentTo, setResetSentTo] = useState<string | null>(null)
  const user = state.status === 'success' ? state.data : null

  async function resetPassword() {
    if (!user) return
    const result = await reset.run(user.userId)
    if (result) setResetSentTo(result.email)
  }

  return (
    <SideSheet
      open
      onClose={onClose}
      heading="User profile"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {/* TODO: no "Edit details" frame yet; users request changes through Change approvals. */}
          <Button type="button" disabled title="Editing details is not designed yet">
            Edit details
          </Button>
        </>
      }
    >
      {state.status === 'loading' && (
        <div className="flex flex-col gap-4 p-6" aria-busy="true" aria-label="Loading profile">
          <Skeleton className="h-16 w-64 rounded-xl" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      )}

      {state.status === 'error' && (
        <div className="p-6">
          <Banner
            tone="danger"
            title="Couldn’t load this profile"
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        </div>
      )}

      {user && (
        <div className="flex flex-col">
          <div className="flex flex-col gap-5 px-6 pt-6">
            <div className="flex items-center gap-4">
              <div
                aria-hidden
                className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xl font-semibold text-brand"
              >
                {initialsOf(user.name)}
              </div>
              <div className="flex min-w-0 flex-col gap-1.5">
                <h2 className="text-xl leading-7 font-semibold">{user.name}</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone="neutral">{roleInfo[user.role].label}</StatusBadge>
                  <StatusBadge status={user.status} />
                  {user.employeeId && <span className="font-mono text-xs text-muted-foreground">{user.employeeId}</span>}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => onChangeRole(user)}>
                Change role
              </Button>
              <Button type="button" variant="outline" onClick={resetPassword} disabled={reset.pending || user.status !== 'active'}>
                {reset.pending ? 'Sending…' : 'Reset password'}
              </Button>
              {user.status === 'active' && (
                <Button type="button" variant="destructive" onClick={() => onDeactivate(user)}>
                  Deactivate
                </Button>
              )}
            </div>
            {resetSentTo && (
              <Banner tone="success" title="Reset link sent" message={`A password reset link was emailed to ${resetSentTo}.`} />
            )}
            {reset.error && <Banner tone="danger" title="Couldn’t send the reset link" message={reset.error.message} />}

            <StatusTabs
              label="Profile sections"
              tabs={[
                { id: 'overview', label: 'Overview' },
                { id: 'activity', label: 'Activity' },
              ]}
              activeId={tab}
              onChange={setTab}
            />
          </div>

          {tab === 'overview' ? (
            <div className="flex flex-col gap-6 px-6 py-5">
              <ProfileSection title="Contact details">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <ProfileField label="Email">{user.email}</ProfileField>
                  <ProfileField label="Phone" mono>
                    {user.phone}
                  </ProfileField>
                  <div className="col-span-2">
                    <ProfileField label="Address">{user.address}</ProfileField>
                  </div>
                </dl>
              </ProfileSection>

              {user.driver && (
                <ProfileSection title="Driver details">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <ProfileField label="Licence number" mono>
                      {user.driver.licenceNumber}
                    </ProfileField>
                    <ProfileField label="Licence class">{user.driver.licenceClass}</ProfileField>
                    <ProfileField label="Licence expiry">{formatDate(user.driver.licenceExpiry)}</ProfileField>
                    <ProfileField label="Licence status">
                      <StatusBadge tone={licenceBadge[user.driver.licenceStatus].tone}>
                        {licenceBadge[user.driver.licenceStatus].label}
                      </StatusBadge>
                    </ProfileField>
                  </dl>
                </ProfileSection>
              )}

              <ProfileSection title="Account">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <ProfileField label="Joined">{formatDate(user.joined)}</ProfileField>
                  <ProfileField label="Last sign-in">{user.lastSignIn}</ProfileField>
                  {user.monthSummary && <ProfileField label="Trips this month">{user.monthSummary}</ProfileField>}
                </dl>
              </ProfileSection>

              <ProfileSection
                title="Recent activity"
                action={
                  <button type="button" onClick={() => setTab('activity')} className="text-[13px] font-semibold text-brand hover:underline">
                    View all
                  </button>
                }
              >
                <ActivityList items={user.recentActivity.slice(0, 3)} />
              </ProfileSection>
            </div>
          ) : (
            <div className="px-6 py-5">
              <ActivityList items={user.recentActivity} />
            </div>
          )}
        </div>
      )}
    </SideSheet>
  )
}
