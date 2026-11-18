import type { ReactNode } from 'react'
import { ArrowDown, Lock } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuditEvent } from '../hooks/useAuditEvent'
import { moduleLongNames } from '../labels'

function Row({ label, children, mono = false }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3 text-[13px]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('break-words', mono && 'font-mono')}>{children}</dd>
    </div>
  )
}

type EventDetailsPanelProps = {
  eventId: string
  /** "All events for this record": searches the log for the record. */
  onShowRecordEvents: (record: string) => void
}

/** "Event details" side panel: the full, read-only record of one audit event. */
export function EventDetailsPanel({ eventId, onShowRecordEvents }: EventDetailsPanelProps) {
  const { state } = useAuditEvent(eventId)
  const e = state.status === 'success' ? state.data : null

  return (
    <section className="overflow-hidden rounded-xl border bg-card" aria-label="Event details">
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base leading-6 font-semibold">Event details</h2>
          <span className="font-mono text-xs text-muted-foreground">{eventId}</span>
        </div>
        <span className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          Read only
        </span>
      </header>

      {state.status === 'loading' && (
        <div className="flex flex-col gap-3 p-5" aria-busy="true" aria-label="Loading event">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}
      {state.status === 'error' && (
        <div className="p-5">
          <Banner tone="danger" title="Couldn’t load the event" message={state.error.message} />
        </div>
      )}

      {e && (
        <div className="flex flex-col gap-4 px-5 py-5">
          <div className="flex flex-col items-start gap-2">
            <h3 className="text-base font-semibold">{e.action}</h3>
            <StatusBadge status={e.result} />
          </div>
          <dl className="flex flex-col gap-3">
            <Row label="When">{new Date(e.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Row>
            <Row label="Done by">{e.userName === 'System' ? `System (${e.userRole})` : `${e.userName} (${e.userRole})`}</Row>
            <Row label="Record" mono>
              {e.recordLabel ? `${e.record} · ${e.recordLabel}` : e.record}
            </Row>
            <Row label="Module">{moduleLongNames[e.module] ?? e.module}</Row>
          </dl>

          {e.changes.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">Changes</h4>
              {e.changes.map((c) => (
                // Before in grey, after on accent-soft; the old value is never struck through.
                <div key={c.field} className="flex flex-col gap-1">
                  <div className="rounded-lg bg-secondary px-2.5 py-1.5">
                    <span className="text-[11px] text-muted-foreground">{c.field} · before</span>
                    <p className="text-[13px] text-muted-foreground">{c.before}</p>
                  </div>
                  <ArrowDown className="ml-2 size-3.5 text-muted-foreground" aria-label="changed to" />
                  <div className="rounded-lg bg-brand-soft px-2.5 py-1.5">
                    <span className="text-[11px] text-brand">{c.field} · after</span>
                    <p className="text-[13px] font-medium">{c.after}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <dl className="flex flex-col gap-3">
            {e.reason && <Row label="Reason">{e.reason}</Row>}
            <Row label="IP address" mono>
              {e.ipAddress}
            </Row>
            <Row label="Device">{e.device}</Row>
            <Row label="Session" mono>
              {e.sessionId}
            </Row>
          </dl>

          <div className="flex flex-wrap gap-4 text-[13px] font-semibold text-brand">
            {(e.recordUserId ?? e.userId) && (
              <Link to={`/admin/users?user=${e.recordUserId ?? e.userId}`} className="hover:underline">
                View user
              </Link>
            )}
            <button type="button" onClick={() => onShowRecordEvents(e.record)} className="hover:underline">
              All events for this record
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
