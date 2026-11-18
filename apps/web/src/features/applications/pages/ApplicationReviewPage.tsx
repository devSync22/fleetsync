import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { FileQuestion } from 'lucide-react'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { initialsOf } from '@/lib/utils'
import { ApplicantDetailsCard } from '../components/ApplicantDetailsCard'
import { ApproveDialog } from '../components/ApproveDialog'
import { ChecksCard } from '../components/ChecksCard'
import { DocumentsCard } from '../components/DocumentsCard'
import { DrivingLicenceCard } from '../components/DrivingLicenceCard'
import { InternalNoteCard } from '../components/InternalNoteCard'
import { RejectDialog } from '../components/RejectDialog'
import { TimelineCard } from '../components/TimelineCard'
import { useApplication } from '../hooks/useApplication'
import { useApprovalOptions } from '../hooks/useApprovalOptions'
import { applicantTypeLabels, requestedRoleLabels } from '../labels'
import { expiryProblem } from '../licenceRules'
import type { ApplicationDetail, ApprovalOptions, LicenceDetails } from '../types'

type ReviewProps = {
  application: ApplicationDetail
  options: ApprovalOptions | null
  onUpdated: (application: ApplicationDetail) => void
}

/** The loaded Review page. Kept separate so the licence form starts from the application's saved values. */
function Review({ application: a, options, onUpdated }: ReviewProps) {
  const isDriver = a.requestedRole === 'driver'
  const open = a.status === 'pending-review'
  const [licence, setLicence] = useState<LicenceDetails>(
    () => a.licence ?? { licenceClass: options?.licenceClasses[1] ?? 'Heavy vehicle (C)', licenceNumber: '', licenceExpiry: '' },
  )
  const [showLicenceErrors, setShowLicenceErrors] = useState(false)
  const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
  const [outcome, setOutcome] = useState<string | null>(null)

  const licenceReady = !isDriver || (licence.licenceNumber.trim() !== '' && expiryProblem(licence.licenceExpiry) === null)

  function startApprove() {
    // Drivers can't be approved until the licence details are entered and valid.
    if (!licenceReady) {
      setShowLicenceErrors(true)
      return
    }
    setDialog('approve')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: 'Applications', to: '/admin/applications' }, { label: a.applicationId, mono: true }]} />
        <div className="flex flex-wrap items-center gap-4">
          <div
            aria-hidden
            className={
              a.type === 'company'
                ? 'flex size-14 shrink-0 items-center justify-center rounded-full bg-secondary text-lg font-semibold text-muted-foreground'
                : 'flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand'
            }
          >
            {initialsOf(a.name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[28px] leading-9 font-bold tracking-[-0.01em]">{a.name}</h1>
              <StatusBadge status={a.status} />
            </div>
            <p className="text-[13px] text-muted-foreground">
              {applicantTypeLabels[a.type]} account · Requested role: {requestedRoleLabels[a.requestedRole]} · Submitted {a.submittedAt}
            </p>
          </div>
          {open && (
            <div className="flex shrink-0 gap-2">
              <Button type="button" variant="destructive" onClick={() => setDialog('reject')}>
                Reject
              </Button>
              <Button type="button" onClick={startApprove} disabled={!options}>
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      {outcome && <Banner tone={a.status === 'approved' ? 'success' : 'info'} title={a.status === 'approved' ? 'Account created' : 'Application rejected'} message={outcome} action={<Button asChild variant="outline" size="sm"><Link to="/admin/applications">Back to applications</Link></Button>} />}
      {!outcome && a.status === 'approved' && (
        <Banner tone="success" title="Approved" message={`Approved by ${a.decidedBy} on ${a.decidedAt}. Account ${a.accountId}.`} />
      )}
      {!outcome && a.status === 'rejected' && (
        <Banner tone="info" title="Rejected" message={`Rejected by ${a.decidedBy} on ${a.decidedAt}: ${a.rejectReason}.`} />
      )}
      {showLicenceErrors && !licenceReady && (
        <Banner tone="danger" title="Licence details needed" message="Enter a licence number and an expiry date more than 6 months away before approving." />
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <ApplicantDetailsCard application={a} />
          {isDriver && (
            <DrivingLicenceCard
              application={a}
              licence={licence}
              onChange={setLicence}
              licenceClasses={options?.licenceClasses ?? [licence.licenceClass]}
              showErrors={showLicenceErrors}
              readOnly={!open}
            />
          )}
          <DocumentsCard application={a} onUpdated={onUpdated} />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <ChecksCard checks={a.checks} />
          <TimelineCard entries={a.timeline} />
          <InternalNoteCard application={a} onUpdated={onUpdated} />
        </div>
      </div>

      {dialog === 'approve' && options && (
        <ApproveDialog
          application={a}
          options={options}
          licence={isDriver ? licence : null}
          onClose={() => setDialog(null)}
          onApproved={(updated) => {
            setDialog(null)
            setOutcome(`Account ${updated.accountId} was created for ${updated.name}. The sign-in details were emailed.`)
            onUpdated(updated)
          }}
        />
      )}
      {dialog === 'reject' && (
        <RejectDialog
          application={a}
          onClose={() => setDialog(null)}
          onRejected={(updated) => {
            setDialog(null)
            setOutcome(`${updated.name} was emailed the reason. No account was created.`)
            onUpdated(updated)
          }}
        />
      )}
    </div>
  )
}

/** "Admin — Applications / Review" (89:1770) with Approve (90:1892) and Reject (90:2149). */
export function ApplicationReviewPage() {
  const { applicationId = '' } = useParams()
  const { state, retry, application, replace } = useApplication(applicationId)
  const options = useApprovalOptions(applicationId)

  if (state.status === 'loading') {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading application">
        <Skeleton className="h-16 w-96 rounded-xl" />
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-[480px] rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    if (state.error.status === 404) {
      return (
        <div className="flex justify-center py-16">
          <EmptyState
            icon={FileQuestion}
            title="Application not found"
            description={`There is no application ${applicationId}. It may have been removed.`}
            action={
              <Button asChild variant="outline">
                <Link to="/admin/applications">Back to applications</Link>
              </Button>
            }
          />
        </div>
      )
    }
    return (
      <Banner
        tone="danger"
        title="Couldn’t load the application"
        message={state.error.message}
        action={
          <Button type="button" variant="outline" size="sm" onClick={retry}>
            Try again
          </Button>
        }
      />
    )
  }

  if (!application) return null
  return (
    <Review
      key={application.applicationId}
      application={application}
      options={options.state.status === 'success' ? options.state.data : null}
      onUpdated={replace}
    />
  )
}
