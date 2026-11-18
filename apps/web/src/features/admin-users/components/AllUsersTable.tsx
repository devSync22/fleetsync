import { Ban, UserCog } from 'lucide-react'
import { RowActionsMenu } from '@/components/shared/RowActionsMenu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import { roleInfo } from '../roles'
import type { UserAccount } from '../types'
import { UserAvatar } from './UserAvatar'

type AllUsersTableProps = {
  users: UserAccount[]
  onView: (user: UserAccount) => void
  onChangeRole: (user: UserAccount) => void
  onDeactivate: (user: UserAccount) => void
  onActivate: (user: UserAccount) => void
  /** Activate is in flight for this user. */
  activatingId: string | null
}

/** "All users" table (56:646) with the View profile / Activate button and the ⋯ row menu (82:1345). */
export function AllUsersTable({ users, onView, onChangeRole, onDeactivate, onActivate, activatingId }: AllUsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>User</th>
            <th scope="col" className={t.th}>Role</th>
            <th scope="col" className={t.th}>Status</th>
            <th scope="col" className={t.th}>Last sign-in</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const active = user.status === 'active'
            return (
              <tr key={user.userId} className={t.row}>
                <td className={t.td}>
                  <div className="flex items-center gap-3">
                    <UserAvatar name={user.name} isCompany={user.isCompany} />
                    <div className="flex flex-col whitespace-nowrap">
                      <span className="text-[13px] font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </td>
                <td className={`${t.td} whitespace-nowrap`}>{roleInfo[user.role].label}</td>
                <td className={t.td}>
                  <StatusBadge status={user.status} />
                </td>
                <td className={`${t.td} whitespace-nowrap text-muted-foreground`}>{user.lastSignIn}</td>
                <td className={t.td}>
                  <div className="flex items-center justify-end gap-2">
                    {active ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => onView(user)}>
                        View profile
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={activatingId === user.userId}
                        onClick={() => onActivate(user)}
                      >
                        {activatingId === user.userId ? 'Activating…' : 'Activate'}
                      </Button>
                    )}
                    <RowActionsMenu
                      label={`More actions for ${user.name}`}
                      title={user.name}
                      subtitle={roleInfo[user.role].label}
                      actions={[
                        { label: 'Change role', description: 'Pick a new role for this user', icon: UserCog, onSelect: () => onChangeRole(user) },
                        active
                          ? {
                              label: 'Deactivate account',
                              description: 'User can no longer sign in',
                              icon: Ban,
                              tone: 'danger',
                              onSelect: () => onDeactivate(user),
                            }
                          : { label: 'View profile', description: 'Details and recent activity', icon: UserCog, onSelect: () => onView(user) },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
