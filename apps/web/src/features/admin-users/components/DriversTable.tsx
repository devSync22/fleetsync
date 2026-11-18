import { Ban, IdCard, UserCog } from 'lucide-react'
import { RowActionsMenu } from '@/components/shared/RowActionsMenu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import type { DriverRow } from '../types'
import { UserAvatar } from './UserAvatar'

type DriversTableProps = {
  drivers: DriverRow[]
  onView: (userId: string) => void
  onChangeRole: (userId: string) => void
  onDeactivate: (userId: string) => void
}

/**
 * "Drivers" tab table (65:1185). A driver with an expired licence is Blocked and gets
 * "Update licence" instead of "View profile" (it opens the profile, where the licence is shown).
 */
export function DriversTable({ drivers, onView, onChangeRole, onDeactivate }: DriversTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>Driver</th>
            <th scope="col" className={t.th}>Licence</th>
            <th scope="col" className={t.th}>Status</th>
            <th scope="col" className={t.th}>This month</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.userId} className={t.row}>
              <td className={t.td}>
                <div className="flex items-center gap-3">
                  <UserAvatar name={driver.name} />
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-[13px] font-medium">{driver.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{driver.phone}</span>
                  </div>
                </div>
              </td>
              <td className={t.td}>
                <div className="flex flex-col items-start gap-1 whitespace-nowrap">
                  <span className="font-mono text-[13px] font-medium">{driver.licenceNumber}</span>
                  <span className="text-xs text-muted-foreground">
                    {driver.licenceClass}
                    {/* Expiring / expired licences show a tag instead of the expiry month. */}
                    {driver.licenceStatus === 'valid' && ` · exp. ${driver.licenceExpiry}`}
                  </span>
                  {driver.licenceStatus === 'expiring' && (
                    <StatusBadge tone="pending">Expires in {driver.expiresInDays} days</StatusBadge>
                  )}
                  {driver.licenceStatus === 'expired' && <StatusBadge status="licence-expired" />}
                </div>
              </td>
              <td className={t.td}>
                <StatusBadge status={driver.availability} />
              </td>
              <td className={t.td}>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[13px]">{driver.tripsThisMonth} trips</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {driver.kmThisMonth != null ? `${driver.kmThisMonth.toLocaleString('en-LK')} km` : '–'}
                  </span>
                </div>
              </td>
              <td className={t.td}>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onView(driver.userId)}>
                    {driver.licenceStatus === 'expired' ? 'Update licence' : 'View profile'}
                  </Button>
                  <RowActionsMenu
                    label={`More actions for ${driver.name}`}
                    title={driver.name}
                    subtitle={`Driver · ${driver.licenceNumber}`}
                    actions={[
                      { label: 'View licence', description: `${driver.licenceClass} · ${driver.licenceNumber}`, icon: IdCard, onSelect: () => onView(driver.userId) },
                      { label: 'Change role', description: 'Pick a new role for this user', icon: UserCog, onSelect: () => onChangeRole(driver.userId) },
                      { label: 'Deactivate account', description: 'User can no longer sign in', icon: Ban, tone: 'danger', onSelect: () => onDeactivate(driver.userId) },
                    ]}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
