import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { accessInfo, roleInfo, roleOrder } from '../roles'
import type { Access, ModulePermissions } from '../types'

function AccessBadge({ access }: { access: Access }) {
  if (access === 'none') {
    return (
      <span className="text-faint" aria-label="No access">
        —
      </span>
    )
  }
  const { label, tone } = accessInfo[access]
  return <StatusBadge tone={tone}>{label}</StatusBadge>
}

/** "Permissions by role" (57:791): one row per module, one column per role. Read-only. */
export function PermissionsMatrix({ modules }: { modules: ModulePermissions[] }) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base leading-6 font-semibold">Permissions by role</h2>
          <p className="text-xs text-muted-foreground">What each role can do in every module</p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <AccessBadge access="full" />
          <AccessBadge access="own" />
          <AccessBadge access="view" />
          <span className="text-faint">— No access</span>
        </div>
      </header>
      <div className="overflow-x-auto">
        <table className={t.table}>
          <thead className={t.headRow}>
            <tr>
              <th scope="col" className={t.th}>Module</th>
              {roleOrder.map((role) => (
                <th key={role} scope="col" className={t.th}>
                  {roleInfo[role].short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modules.map((row) => (
              <tr key={row.module} className={t.row}>
                <th scope="row" className={`${t.td} text-left font-normal`}>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-[13px] font-medium">{row.module}</span>
                    <span className="text-xs text-muted-foreground">{row.description}</span>
                  </div>
                </th>
                {roleOrder.map((role) => (
                  <td key={role} className={t.td}>
                    <AccessBadge access={row.access[role]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
