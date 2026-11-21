import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { fieldLabels } from '../profileFields'
import type { ChangeRequest } from '../types'

export function ChangeRequestsCard({ requests }: { requests: ChangeRequest[] }) {
  return (
    <SectionCard title="Your change requests">
      {requests.length === 0 ? (
        <p className="px-6 py-5 text-[13px] text-muted-foreground">Changes you send for approval are listed here.</p>
      ) : (
        <ul className="flex flex-col gap-3 px-6 py-5">
          {requests.map((request) => (
            <li key={request.id} className="flex flex-col gap-1 rounded-lg border px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold">{fieldLabels[request.field]}</span>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-xs break-words">New value: {request.newValue}</p>
              <p className="text-xs text-muted-foreground">
                {request.id} · {request.note}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  )
}
