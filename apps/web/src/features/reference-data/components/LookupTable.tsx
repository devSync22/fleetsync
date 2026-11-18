import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { LookupItem } from '../types'

type LookupTableProps = {
  items: LookupItem[]
  nameHeader: string
  detailHeader: string
  onEdit: (item: LookupItem) => void
  onToggle: (item: LookupItem, active: boolean) => void
  savingIds: Set<string>
}

/**
 * Table for the simple reference lists (vehicle types, cargo types, depots, licence classes).
 * These tabs have no frame of their own, so they reuse the Service types table style.
 */
export function LookupTable({ items, nameHeader, detailHeader, onEdit, onToggle, savingIds }: LookupTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>{nameHeader}</th>
            <th scope="col" className={t.th}>{detailHeader}</th>
            <th scope="col" className={t.th}>Active</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={cn(t.row, !item.active && 'text-muted-foreground')}>
              <td className={`${t.td} font-medium whitespace-nowrap`}>{item.name}</td>
              <td className={t.td}>{item.detail}</td>
              <td className={t.td}>
                <Switch
                  checked={item.active}
                  disabled={savingIds.has(item.id)}
                  onCheckedChange={(checked) => onToggle(item, checked)}
                  aria-label={`${item.name} active`}
                />
              </td>
              <td className={`${t.td} text-right`}>
                <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item)}>
                  Edit
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
