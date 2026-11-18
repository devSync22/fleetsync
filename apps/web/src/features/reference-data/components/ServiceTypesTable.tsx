import { Power, PowerOff } from 'lucide-react'
import { RowActionsMenu } from '@/components/shared/RowActionsMenu'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn, formatLKR } from '@/lib/utils'
import type { ServiceType } from '../types'

type ServiceTypesTableProps = {
  serviceTypes: ServiceType[]
  onEdit: (serviceType: ServiceType) => void
  onToggle: (serviceType: ServiceType, active: boolean) => void
  /** Rows whose switch is saving. */
  savingIds: Set<string>
}

/** Service types (113:3243): interval in km and / or months, what it applies to, cost and an Active switch. */
export function ServiceTypesTable({ serviceTypes, onEdit, onToggle, savingIds }: ServiceTypesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>Service type</th>
            <th scope="col" className={t.th}>Every (km)</th>
            <th scope="col" className={t.th}>Or every</th>
            <th scope="col" className={t.th}>Applies to</th>
            <th scope="col" className={t.th}>Typical cost</th>
            <th scope="col" className={t.th}>Active</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {serviceTypes.map((s) => (
            // Turned-off types are greyed out but stay in the list.
            <tr key={s.id} className={cn(t.row, !s.active && 'text-muted-foreground')}>
              <td className={t.td}>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[13px] font-medium">{s.name}</span>
                  <span className="text-xs text-muted-foreground">{s.note}</span>
                </div>
              </td>
              <td className={`${t.td} font-mono`}>{s.everyKm != null ? s.everyKm.toLocaleString('en-LK') : <span className="text-faint">–</span>}</td>
              <td className={`${t.td} whitespace-nowrap`}>{s.everyMonths != null ? `${s.everyMonths} months` : <span className="text-faint">—</span>}</td>
              <td className={`${t.td} whitespace-nowrap`}>{s.appliesTo}</td>
              <td className={`${t.td} font-mono whitespace-nowrap`}>{formatLKR(s.typicalCost)}</td>
              <td className={t.td}>
                <Switch
                  checked={s.active}
                  disabled={savingIds.has(s.id)}
                  onCheckedChange={(checked) => onToggle(s, checked)}
                  aria-label={`${s.name} active`}
                />
              </td>
              <td className={t.td}>
                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => onEdit(s)}>
                    Edit
                  </Button>
                  <RowActionsMenu
                    label={`More actions for ${s.name}`}
                    title={s.name}
                    subtitle={s.active ? 'Active' : 'Turned off'}
                    actions={[
                      s.active
                        ? { label: 'Turn off', description: 'Hide from new maintenance records', icon: PowerOff, tone: 'danger', onSelect: () => onToggle(s, false) }
                        : { label: 'Turn on', description: 'Use for new maintenance records', icon: Power, onSelect: () => onToggle(s, true) },
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
