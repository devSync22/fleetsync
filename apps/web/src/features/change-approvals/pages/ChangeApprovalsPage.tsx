import { useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { ChangeRequestCard } from '../components/ChangeRequestCard'
import { ProofDialog } from '../components/ProofDialog'
import { RejectChangeDialog } from '../components/RejectChangeDialog'
import { useChangeRequests } from '../hooks/useChangeRequests'
import { approveChangeRequest } from '../services/changeApprovalsApi'
import type { ChangeRequest, ChangeRequestStatus } from '../types'

const tabs: { id: ChangeRequestStatus; label: string }[] = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]
const isStatus = (value: string | null): value is ChangeRequestStatus => tabs.some((t) => t.id === value)

const emptyCopy: Record<ChangeRequestStatus, { title: string; description: string }> = {
  pending: { title: 'Nothing to review', description: 'When users ask to change their profile details, the requests appear here.' },
  approved: { title: 'No approved changes', description: 'Changes you approve are listed here.' },
  rejected: { title: 'No rejected changes', description: 'Changes you reject are listed here with the reason.' },
}

/**
 * "Admin — Change approvals" (91:2138). Users ask to change their own details; the administrator
 * approves or rejects. `?request=CR-2026-0309` (from the dashboard) scrolls to and outlines one request.
 */
export function ChangeApprovalsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')
  const status: ChangeRequestStatus = isStatus(statusParam) ? statusParam : 'pending'
  const highlightId = searchParams.get('request')

  const { state, retry } = useChangeRequests(status)
  const approve = useAction(approveChangeRequest)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<ChangeRequest | null>(null)
  const [viewingProof, setViewingProof] = useState<ChangeRequest | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const data = state.status === 'success' ? state.data : null

  // Bring the linked request into view once the list has loaded.
  useEffect(() => {
    if (data && highlightId) document.getElementById(highlightId)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  }, [data, highlightId])

  async function onApprove(request: ChangeRequest) {
    // A change with unchecked proof (e.g. a renewed licence) shows the document first.
    if (request.proof && !request.proof.checked) {
      setViewingProof(request)
      return
    }
    setApprovingId(request.requestId)
    const updated = await approve.run(request.requestId)
    setApprovingId(null)
    if (updated) {
      setNotice(`${updated.userName}’s profile was updated. They were told by email.`)
      retry()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Change approvals"
        description="Users ask to update their own profile details. Check the change, then approve it or reject it with a reason."
      />
      <StatusTabs
        label="Change request status"
        tabs={tabs.map((t) => ({ ...t, count: data?.counts[t.id] }))}
        activeId={status}
        onChange={(id) => setSearchParams(id === 'pending' ? {} : { status: id })}
      />

      {notice && <Banner tone="success" title="Done" message={notice} />}
      {approve.error && <Banner tone="danger" title="Couldn’t approve the change" message={approve.error.message} />}

      {state.status === 'loading' && <TableSkeleton rows={4} />}
      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load change requests"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}

      {data && data.requests.length === 0 && <EmptyState icon={CircleCheck} tone="accent" {...emptyCopy[status]} />}
      {data && (
        <div className="flex flex-col gap-5">
          {data.requests.map((request) => (
            <ChangeRequestCard
              key={request.requestId}
              request={request}
              highlighted={request.requestId === highlightId}
              approving={approvingId === request.requestId}
              onApprove={() => onApprove(request)}
              onReject={() => setRejecting(request)}
              onViewProof={() => setViewingProof(request)}
            />
          ))}
        </div>
      )}

      {rejecting && (
        <RejectChangeDialog
          request={rejecting}
          onClose={() => setRejecting(null)}
          onRejected={(updated) => {
            setRejecting(null)
            setNotice(`${updated.userName}’s change was rejected. They were told the reason.`)
            retry()
          }}
        />
      )}
      {viewingProof && (
        <ProofDialog
          request={viewingProof}
          onClose={() => setViewingProof(null)}
          onChecked={() => {
            setViewingProof(null)
            retry()
          }}
        />
      )}
    </div>
  )
}
