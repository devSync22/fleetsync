import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { cn } from '@/lib/utils'
import type { AuditEvent } from '../types'

const timeOf = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const dayOf = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()

type AuditTableProps = {
  events: AuditEvent[]
  selectedId: string
  onSelect: (eventId: string) => void
}

/** Audit log rows (95:1894). Clicking a row (or Enter on it) shows its details on the right. */
export function AuditTable({ events, selectedId, onSelect }: AuditTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>Time</th>
            <th scope="col" className={t.th}>User</th>
            <th scope="col" className={t.th}>Event</th>
            <th scope="col" className={`${t.th} text-right`}>Result</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => {
            const selected = e.eventId === selectedId
            return (
              <tr
                key={e.eventId}
                tabIndex={0}
                aria-selected={selected}
                onClick={() => onSelect(e.eventId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onSelect(e.eventId)
                  }
                }}
                className={cn(t.row, 'cursor-pointer outline-none focus-visible:bg-secondary', selected && 'bg-brand-soft hover:bg-brand-soft')}
              >
                <td className={t.td}>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-mono text-[13px]">{timeOf(e.at)}</span>
                    {!isToday(e.at) && <span className="text-xs text-muted-foreground">{dayOf(e.at)}</span>}
                  </div>
                </td>
                <td className={t.td}>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="text-[13px] font-medium">{e.userName}</span>
                    <span className="text-xs text-muted-foreground">{e.userRole}</span>
                  </div>
                </td>
                <td className={t.td}>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13px]">{e.action}</span>
                    <span className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                      <span className="rounded bg-secondary px-1.5 py-px text-[11px] text-muted-foreground">{e.module}</span>
                      <span className="font-mono text-muted-foreground">{e.record}</span>
                    </span>
                  </div>
                </td>
                <td className={`${t.td} text-right`}>
                  <StatusBadge status={e.result} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
