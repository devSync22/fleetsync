import { Link } from 'react-router'
import { SectionCard } from '@/components/shared/SectionCard'
import type { PendingChangeRequest } from '../types'

/** "Profile change requests": who changed what, each with a Review link into Change approvals. */
export function ChangeRequestsCard({ requests }: { requests: PendingChangeRequest[] }) {
  return (
    <SectionCard
      title="Profile change requests"
      subtitle={requests.length > 0 ? `${requests.length} waiting for approval` : 'Nothing waiting'}
    >
      <ul>
        {requests.map((request) => (
          <li key={request.requestId} className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0">
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate text-[13px] font-medium">{request.who}</p>
              <p className="truncate text-xs text-muted-foreground">Changed: {request.field}</p>
            </div>
            <Link
              to={`/admin/change-approvals?request=${request.requestId}`}
              className="shrink-0 text-[13px] font-semibold text-brand hover:underline"
            >
              Review
            </Link>
          </li>
        ))}
        {requests.length === 0 && (
          <li className="px-5 py-4 text-[13px] text-muted-foreground">Profile changes users ask for appear here.</li>
        )}
      </ul>
    </SectionCard>
  )
}
