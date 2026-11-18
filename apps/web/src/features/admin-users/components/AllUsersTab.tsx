import { useState } from 'react'
import { Banner } from '@/components/shared/Banner'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { ListSearchBox } from '@/components/shared/ListSearchBox'
import { PagedListCard } from '@/components/shared/PagedListCard'
import { useAction } from '@/hooks/useAction'
import { useUserList } from '../hooks/useUserList'
import { roleInfo, roleOrder } from '../roles'
import { setUserActive } from '../services/adminUsersApi'
import type { UserAccount } from '../types'
import { AllUsersTable } from './AllUsersTable'

const roleOptions = [{ id: 'all', label: 'All roles' }, ...roleOrder.map((role) => ({ id: role, label: roleInfo[role].label }))]
const statusOptions = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'deactivated', label: 'Deactivated' },
]

type AllUsersTabProps = {
  onView: (userId: string) => void
  onChangeRole: (user: UserAccount) => void
  onDeactivate: (user: UserAccount) => void
}

/** "All users" tab: every account, filterable by role and status. Activate works inline. */
export function AllUsersTab({ onView, onChangeRole, onDeactivate }: AllUsersTabProps) {
  const { state, retry, query, setQuery } = useUserList()
  const activate = useAction(setUserActive)
  const [activatingId, setActivatingId] = useState<string | null>(null)

  async function handleActivate(user: UserAccount) {
    setActivatingId(user.userId)
    const updated = await activate.run(user.userId, true)
    setActivatingId(null)
    if (updated) retry()
  }

  return (
    <div className="flex flex-col gap-4">
      {activate.error && <Banner tone="danger" title="Couldn’t activate the account" message={activate.error.message} />}
      <PagedListCard
        state={state}
        retry={retry}
        noun="users"
        onPageChange={(page) => setQuery('page', String(page))}
        filters={
          <>
            <ListSearchBox value={query.search} onChange={(v) => setQuery('search', v, { replace: true })} placeholder="Search by name or email" />
            <FilterSelect label="Role" value={query.role} options={roleOptions} onChange={(v) => setQuery('role', v)} className="w-[200px]" />
            <FilterSelect label="Status" value={query.status} options={statusOptions} onChange={(v) => setQuery('status', v)} className="w-[200px]" />
          </>
        }
      >
        {(data) => (
          <AllUsersTable
            users={data.items}
            onView={(user) => onView(user.userId)}
            onChangeRole={onChangeRole}
            onDeactivate={onDeactivate}
            onActivate={handleActivate}
            activatingId={activatingId}
          />
        )}
      </PagedListCard>
    </div>
  )
}
