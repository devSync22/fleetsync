import { Activity, Plus, TrendingUp, Truck, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { KpiCard } from '@/components/shared/KpiCard'
import { KpiCardSkeleton } from '@/components/shared/KpiCardSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { ChangeRequestsCard } from '../components/ChangeRequestsCard'
import { PendingApplicationsCard } from '../components/PendingApplicationsCard'
import { QuickActionsCard } from '../components/QuickActionsCard'
import { RecentAuditCard } from '../components/RecentAuditCard'
import { UsersByRoleCard } from '../components/UsersByRoleCard'
import { WhatsNewTicker } from '../components/WhatsNewTicker'
import { useAdminDashboard } from '../hooks/useAdminDashboard'

/** "Good morning" / "Good afternoon" / "Good evening" from the local clock. */
function greeting(now = new Date()) {
  const hour = now.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`
}

/** "Admin — Dashboard" (37:478): what is waiting for the administrator, users by role and recent audit events. */
export function AdminDashboardPage() {
  const { state, retry } = useAdminDashboard()
  const data = state.status === 'success' ? state.data : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={data ? `${greeting()}, ${data.adminFirstName}` : 'Dashboard'}
        description={
          data && (
            <div className="flex flex-col gap-2">
              <span>
                {data.pendingApplications.length + data.changeRequests.length === 0
                  ? 'Nothing is waiting for your review.'
                  : `${plural(data.pendingApplications.length, 'account application', 'account applications')} and ${plural(
                      data.changeRequests.length,
                      'profile change',
                      'profile changes',
                    )} are waiting for your review.`}
              </span>
              <WhatsNewTicker messages={data.whatsNew} />
            </div>
          )
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link to="/admin/audit-log?export=1">Export audit log</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/users/new">
                <Plus aria-hidden />
                Create user
              </Link>
            </Button>
          </>
        }
      />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading dashboard" className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={4} />
        </div>
      )}

      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load the dashboard"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KpiCard
              icon={Truck}
              label="Active users"
              value={data.activeUsers}
              meta={`${data.usersByRole.length} roles · ${data.deactivatedUsers} deactivated`}
            />
            <KpiCard
              icon={Wrench}
              tone="pending"
              label="Pending applications"
              value={data.pendingApplications.length}
              meta={data.pendingApplications.length ? `Oldest waiting ${data.oldestApplicationWait}` : 'All reviewed'}
            />
            <KpiCard
              icon={Activity}
              tone="info"
              label="Profile change requests"
              value={data.changeRequests.length}
              meta="Awaiting your approval"
            />
            <KpiCard
              icon={TrendingUp}
              tone="accent"
              label="Audit events today"
              value={data.auditEventsToday.toLocaleString('en-LK')}
              meta={data.auditEventsToday ? `Last event at ${data.lastAuditEventAt}` : 'No events yet'}
            />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex min-w-0 flex-col gap-6">
              <PendingApplicationsCard applications={data.pendingApplications} />
              <QuickActionsCard />
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              <UsersByRoleCard roles={data.usersByRole} total={data.activeUsers} />
              <ChangeRequestsCard requests={data.changeRequests} />
            </div>
          </div>

          <RecentAuditCard events={data.recentAudit} />
        </>
      )}
    </div>
  )
}
