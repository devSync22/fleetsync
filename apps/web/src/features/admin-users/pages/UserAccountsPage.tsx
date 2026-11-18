import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { downloadCsv } from '@/lib/csv'
import { AllUsersTab } from '../components/AllUsersTab'
import { ChangeRoleDialog } from '../components/ChangeRoleDialog'
import { CompaniesTab } from '../components/CompaniesTab'
import { DeactivateUserDialog } from '../components/DeactivateUserDialog'
import { DriversTab } from '../components/DriversTab'
import { RolesTab } from '../components/RolesTab'
import { UserProfileSheet } from '../components/UserProfileSheet'
import { useUserTabCounts } from '../hooks/useUserTabCounts'
import { roleInfo } from '../roles'
import { getExport, getUser } from '../services/adminUsersApi'
import type { UserAccount } from '../types'

type Tab = 'all' | 'drivers' | 'companies' | 'roles'

const tabLabels: { id: Tab; label: string }[] = [
  { id: 'all', label: 'All users' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'companies', label: 'Customer companies' },
  { id: 'roles', label: 'Roles & permissions' },
]

const isTab = (value: string | null): value is Tab => tabLabels.some((tab) => tab.id === value)

/** The main header button changes with the tab, as in the frames. */
function PrimaryAction({ tab }: { tab: Tab }) {
  const [label, to] =
    tab === 'drivers'
      ? ['Add driver', '/admin/users/new?role=driver']
      : tab === 'companies'
        ? // No "Add company" frame yet: companies register themselves and are approved under Applications.
          ['Add company', '/admin/applications?type=company']
        : ['Create user', '/admin/users/new']
  return (
    <Button asChild>
      <Link to={to}>
        <Plus aria-hidden />
        {label}
      </Link>
    </Button>
  )
}

/**
 * "Admin — User accounts" with its four tabs (56:646, 65:1185, 69:1216, 57:791), the row menu (82:1345),
 * View profile sheet (83:1486), Change role (59:986) and Deactivate account (106:3155).
 * The tab and the open profile live in the URL (`?tab=drivers&user=USR-0142`).
 */
export function UserAccountsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const tab: Tab = isTab(tabParam) ? tabParam : 'all'
  const profileId = searchParams.get('user')

  const counts = useUserTabCounts()
  const [roleTarget, setRoleTarget] = useState<UserAccount | null>(null)
  const [deactivateTarget, setDeactivateTarget] = useState<UserAccount | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  // Bumped after a change so the tab remounts and reloads its list.
  const [listVersion, setListVersion] = useState(0)
  const lookup = useAction(getUser)
  const exporter = useAction(getExport)

  function selectTab(next: Tab) {
    // Switching tabs drops the other tab's search, filters and page.
    setSearchParams(next === 'all' ? {} : { tab: next })
  }

  function openProfile(userId: string | null) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      if (userId) next.set('user', userId)
      else next.delete('user')
      return next
    })
  }

  /** The Drivers tab only has IDs; load the account before opening a dialog. */
  async function withUser(userId: string, open: (user: UserAccount) => void) {
    const user = await lookup.run(userId)
    if (user) open(user)
  }

  function afterChange(message: string) {
    setNotice(message)
    setListVersion((v) => v + 1)
    counts.retry()
  }

  async function exportTab() {
    const table = await exporter.run(tab)
    if (table) downloadCsv(table.fileName, table.header, table.rows)
  }

  const countData = counts.state.status === 'success' ? counts.state.data : null
  const tabs = tabLabels.map((t) => ({ ...t, count: countData?.[t.id] }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="User accounts"
        description="Everyone who can sign in — staff, drivers and customer companies. Only administrators can change a role."
        actions={
          <>
            <Button type="button" variant="outline" onClick={exportTab} disabled={exporter.pending}>
              {exporter.pending ? 'Exporting…' : 'Export'}
            </Button>
            <PrimaryAction tab={tab} />
          </>
        }
      />

      <StatusTabs label="User account sections" tabs={tabs} activeId={tab} onChange={selectTab} />

      {notice && <Banner tone="success" title="Saved" message={notice} action={<Button type="button" variant="ghost" size="sm" onClick={() => setNotice(null)}>Dismiss</Button>} />}
      {(lookup.error || exporter.error) && (
        <Banner tone="danger" title="Something went wrong" message={(lookup.error ?? exporter.error)!.message} />
      )}

      <div key={`${tab}-${listVersion}`}>
        {tab === 'all' && <AllUsersTab onView={openProfile} onChangeRole={setRoleTarget} onDeactivate={setDeactivateTarget} />}
        {tab === 'drivers' && (
          <DriversTab
            onView={openProfile}
            onChangeRole={(id) => withUser(id, setRoleTarget)}
            onDeactivate={(id) => withUser(id, setDeactivateTarget)}
          />
        )}
        {tab === 'companies' && <CompaniesTab />}
        {tab === 'roles' && <RolesTab />}
      </div>

      {profileId && (
        <UserProfileSheet
          // Remount when a dialog saves, so the sheet shows the new role / status.
          key={`${profileId}-${listVersion}`}
          userId={profileId}
          onClose={() => openProfile(null)}
          onChangeRole={setRoleTarget}
          onDeactivate={setDeactivateTarget}
        />
      )}

      {roleTarget && (
        <ChangeRoleDialog
          user={roleTarget}
          onClose={() => setRoleTarget(null)}
          onChanged={(user) => {
            setRoleTarget(null)
            afterChange(`${user.name} now has the ${roleInfo[user.role].label} role and was emailed about the change.`)
          }}
        />
      )}

      {deactivateTarget && (
        <DeactivateUserDialog
          user={deactivateTarget}
          onClose={() => setDeactivateTarget(null)}
          onDeactivated={(user) => {
            setDeactivateTarget(null)
            afterChange(`${user.name}’s account was deactivated and their sessions were ended.`)
          }}
        />
      )}
    </div>
  )
}
