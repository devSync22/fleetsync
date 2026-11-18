import { Copy, Eye, FileText } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { RowActionsMenu } from '@/components/shared/RowActionsMenu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import { cn, initialsOf } from '@/lib/utils'
import { applicantTypeLabels, requestedRoleLabels } from '../labels'
import type { ApplicationSummary, ApplicationTab } from '../types'

/** Two-line cell: value, muted detail. */
function TwoLine({ primary, secondary, mono = false }: { primary: string; secondary: string; mono?: boolean }) {
  return (
    <div className="flex flex-col whitespace-nowrap">
      <span className={cn('text-[13px]', mono && 'font-mono')}>{primary}</span>
      <span className="text-xs text-muted-foreground">{secondary}</span>
    </div>
  )
}

/**
 * Applications table. Columns follow the tab: Open / All show submitted + documents, Approved shows
 * the new account, Rejected shows the reason. An open application with every document gets a dark
 * "Review" button; one still missing documents only gets "View".
 */
export function ApplicationsTable({ applications, tab }: { applications: ApplicationSummary[]; tab: ApplicationTab }) {
  const navigate = useNavigate()
  const decided = tab === 'approved' || tab === 'rejected'

  return (
    <div className="overflow-x-auto">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>Applicant</th>
            <th scope="col" className={t.th}>Type</th>
            <th scope="col" className={t.th}>Requested role</th>
            <th scope="col" className={t.th}>{tab === 'approved' ? 'Approved' : tab === 'rejected' ? 'Rejected' : 'Submitted'}</th>
            <th scope="col" className={t.th}>{tab === 'approved' ? 'Account' : tab === 'rejected' ? 'Reason' : 'Documents'}</th>
            <th scope="col" className={t.th}>Status</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const reviewPath = `/admin/applications/${app.applicationId}`
            const complete = app.documentsUploaded >= app.documentsRequired
            const canReview = app.status === 'pending-review' && complete
            return (
              <tr key={app.applicationId} className={t.row}>
                <td className={t.td}>
                  <div className="flex items-center gap-3">
                    <InitialsAvatar initials={initialsOf(app.name)} tone={app.type === 'company' ? 'neutral' : 'accent'} />
                    <div className="flex flex-col whitespace-nowrap">
                      <Link to={reviewPath} className="text-[13px] font-medium hover:underline">
                        {app.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">{app.applicationId}</span>
                    </div>
                  </div>
                </td>
                <td className={t.td}>{applicantTypeLabels[app.type]}</td>
                <td className={`${t.td} whitespace-nowrap`}>{requestedRoleLabels[app.requestedRole]}</td>
                <td className={t.td}>
                  {decided ? (
                    <TwoLine primary={app.decidedAt ?? '—'} secondary={`by ${app.decidedBy ?? '—'}`} />
                  ) : (
                    <TwoLine primary={app.submittedLabel} secondary={app.submittedAt} />
                  )}
                </td>
                <td className={t.td}>
                  {tab === 'approved' ? (
                    <span className="font-mono">{app.accountId}</span>
                  ) : tab === 'rejected' ? (
                    <span className="whitespace-nowrap">{app.rejectReason}</span>
                  ) : (
                    <span className={cn('flex items-center gap-1.5 whitespace-nowrap', !complete && 'text-pending')}>
                      <FileText className="size-4" aria-hidden />
                      {app.documentsUploaded} of {app.documentsRequired}
                      <span className="sr-only">documents{complete ? '' : ', some missing'}</span>
                    </span>
                  )}
                </td>
                <td className={t.td}>
                  <StatusBadge status={app.status} />
                </td>
                <td className={t.td}>
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild size="sm" variant={canReview ? 'default' : 'outline'}>
                      <Link to={reviewPath}>{canReview ? 'Review' : 'View'}</Link>
                    </Button>
                    <RowActionsMenu
                      label={`More actions for ${app.name}`}
                      title={app.name}
                      subtitle={app.applicationId}
                      actions={[
                        { label: 'Open application', description: 'Details, documents and checks', icon: Eye, onSelect: () => navigate(reviewPath) },
                        {
                          label: 'Copy application ID',
                          description: app.applicationId,
                          icon: Copy,
                          onSelect: () => void navigator.clipboard?.writeText(app.applicationId),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
