import { Link } from 'react-router'
import { ListCell } from '@/components/shared/ListCell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import type { AuditEvent } from '../types'

/** "Recent audit activity": the last few audit events, with a shortcut to the full audit log. */
export function RecentAuditCard({ events }: { events: AuditEvent[] }) {
  return (
    <section className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base leading-6 font-semibold">Recent audit activity</h2>
          <p className="text-xs text-muted-foreground">Every create, update, delete and sign-in is recorded</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Opens the audit log already filtered to the same window. */}
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/audit-log?period=24h">Last 24 hours</Link>
          </Button>
          <Link to="/admin/audit-log" className="text-[13px] font-semibold text-brand hover:underline">
            Open audit log
          </Link>
        </div>
      </header>
      {events.length === 0 ? (
        <p className="px-5 py-6 text-[13px] text-muted-foreground">No activity in the last 24 hours.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className={t.table}>
            <thead className={t.headRow}>
              <tr>
                <th scope="col" className={t.th}>Time</th>
                <th scope="col" className={t.th}>User</th>
                <th scope="col" className={t.th}>Action</th>
                <th scope="col" className={t.th}>Record</th>
                <th scope="col" className={`${t.th} text-right`}>Result</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.eventId} className={t.row}>
                  <td className={`${t.td} font-mono`}>{event.time}</td>
                  <td className={t.td}>
                    <ListCell primary={event.userName} secondary={event.userRole} />
                  </td>
                  <td className={`${t.td} whitespace-nowrap`}>{event.action}</td>
                  <td className={`${t.td} font-mono text-xs whitespace-nowrap text-muted-foreground`}>{event.record}</td>
                  <td className={`${t.td} text-right`}>
                    <StatusBadge status={event.result} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
