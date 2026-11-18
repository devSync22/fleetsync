import { ArrowRight, File } from 'lucide-react'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { cn, initialsOf } from '@/lib/utils'
import type { ChangeRequest } from '../types'
import { ValueBox } from './ValueBox'

type ChangeRequestCardProps = {
  request: ChangeRequest
  /** Opened from a dashboard "Review" link: outlined so it's easy to find. */
  highlighted: boolean
  approving: boolean
  onApprove: () => void
  onReject: () => void
  onViewProof: () => void
}

/** One request on Change approvals (91:2138): who, which fields change from what to what, why, and any proof. */
export function ChangeRequestCard({ request: r, highlighted, approving, onApprove, onReject, onViewProof }: ChangeRequestCardProps) {
  const pending = r.status === 'pending'
  const needsProofCheck = pending && r.proof !== null && !r.proof.checked

  return (
    <article
      id={r.requestId}
      aria-label={`${r.userName}, ${r.requestId}`}
      className={cn('scroll-mt-6 overflow-hidden rounded-xl border bg-card', highlighted && 'border-brand ring-3 ring-ring/30')}
    >
      <header className="flex flex-wrap items-center gap-3 border-b px-5 py-3.5">
        <InitialsAvatar initials={initialsOf(r.userName)} tone={r.isCompany ? 'neutral' : 'accent'} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{r.userName}</span>
            <StatusBadge tone="neutral">{r.roleLabel}</StatusBadge>
          </div>
          <span className="text-xs text-muted-foreground">
            <span className="font-mono">{r.requestId}</span> · {r.submittedAt}
          </span>
        </div>
        {pending ? (
          <div className="flex items-center gap-2">
            {needsProofCheck && <StatusBadge tone="pending">Check document</StatusBadge>}
            <Button type="button" variant="outline" size="sm" onClick={onReject} disabled={approving}>
              Reject
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={onApprove}
              disabled={approving}
              title={needsProofCheck ? 'Opens the attached document first' : undefined}
            >
              {approving ? 'Approving…' : 'Approve'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <StatusBadge status={r.status} />
            <span className="text-xs text-muted-foreground">
              by {r.decidedBy} · {r.decidedAt}
            </span>
          </div>
        )}
      </header>

      <dl className="flex flex-col gap-3 px-5 py-4 text-[13px]">
        {r.changes.map((change) => (
          <div key={change.field} className="grid items-center gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <dt className="font-medium">{change.field}</dt>
            <dd className="flex items-center gap-3">
              <ValueBox label="Current" value={change.current} tone="old" mono={change.mono} />
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-label="changes to" />
              <ValueBox label="New" value={change.proposed} tone="new" mono={change.mono} />
            </dd>
          </div>
        ))}
        <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
          <dt className="font-medium">Reason given</dt>
          <dd className="text-muted-foreground">“{r.reason}”</dd>
        </div>
        {r.proof && (
          <div className="grid items-center gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <dt className="font-medium">Proof attached</dt>
            <dd>
              <div className="flex w-fit items-center gap-3 rounded-[10px] border px-3 py-2">
                <File className="size-4 text-muted-foreground" aria-hidden />
                <div className="flex flex-col">
                  <span className="text-[13px] font-medium">{r.proof.fileName}</span>
                  <span className="text-xs text-muted-foreground">{r.proof.meta}</span>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={onViewProof}>
                  View
                </Button>
              </div>
            </dd>
          </div>
        )}
        {r.rejectReason && (
          <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
            <dt className="font-medium">Rejection reason</dt>
            <dd>{r.rejectReason}</dd>
          </div>
        )}
      </dl>
    </article>
  )
}
