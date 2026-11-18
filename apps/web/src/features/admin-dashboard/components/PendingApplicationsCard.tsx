import { CircleCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import type { PendingApplication } from '../types'

/** "Account applications" card: the newest requests waiting for review. A row opens the review page. */
export function PendingApplicationsCard({ applications }: { applications: PendingApplication[] }) {
  const navigate = useNavigate()

  return (
    <SectionCard
      title="Account applications"
      subtitle="Review, approve or reject requests for new accounts"
      link={{ label: 'View all', to: '/admin/applications' }}
    >
      {applications.length === 0 ? (
        <EmptyState bare icon={CircleCheck} title="No applications waiting" description="New account requests show up here." />
      ) : (
        <div className="overflow-x-auto">
          <table className={t.table}>
            <thead className={t.headRow}>
              <tr>
                <th scope="col" className={t.th}>Applicant</th>
                <th scope="col" className={t.th}>Type</th>
                <th scope="col" className={t.th}>Requested role</th>
                <th scope="col" className={t.th}>Submitted</th>
                <th scope="col" className={`${t.th} text-right`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr
                  key={app.applicationId}
                  // The whole row opens the review; the name is also a real link for keyboard users.
                  onClick={() => navigate(`/admin/applications/${app.applicationId}`)}
                  className={`${t.row} cursor-pointer`}
                >
                  <td className={t.td}>
                    <div className="flex flex-col gap-0.5 whitespace-nowrap">
                      <Link
                        to={`/admin/applications/${app.applicationId}`}
                        onClick={(event) => event.stopPropagation()}
                        className="text-[13px] leading-[18px] font-medium hover:underline"
                      >
                        {app.name}
                      </Link>
                      <span className="text-xs text-muted-foreground">{app.email}</span>
                    </div>
                  </td>
                  <td className={t.td}>{app.type}</td>
                  <td className={`${t.td} whitespace-nowrap`}>{app.requestedRole}</td>
                  <td className={`${t.td} whitespace-nowrap text-muted-foreground`}>{app.submittedLabel}</td>
                  <td className={`${t.td} text-right`}>
                    <StatusBadge status="pending-review" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}
