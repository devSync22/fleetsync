import { useSearchParams } from 'react-router'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { ListSearchBox } from '@/components/shared/ListSearchBox'
import { PageHeader } from '@/components/shared/PageHeader'
import { PagedListCard } from '@/components/shared/PagedListCard'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { Banner } from '@/components/shared/Banner'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { downloadCsv } from '@/lib/csv'
import { ApplicationsTable } from '../components/ApplicationsTable'
import { ProcessSteps } from '../components/ProcessSteps'
import { useApplications } from '../hooks/useApplications'
import { applicantTypeLabels, applicationTabs, requestedRoleLabels } from '../labels'
import { getApplicationsForExport } from '../services/applicationsApi'
import type { ApplicationTab } from '../types'

const typeOptions = [{ id: 'all', label: 'All types' }, { id: 'staff', label: 'Staff' }, { id: 'company', label: 'Company' }]
const roleOptions = [
  { id: 'all', label: 'All roles' },
  ...Object.entries(requestedRoleLabels).map(([id, label]) => ({ id, label })),
]

/**
 * "Admin — Applications" with its Open / Approved / Rejected / All tabs (87:1645, 434:8880, 434:9500, 434:10082).
 * Staff and customer companies apply; the Fleet Administrator reviews, then approves or rejects.
 */
export function ApplicationsPage() {
  const { state, retry, query, setQuery } = useApplications()
  const [, setSearchParams] = useSearchParams()
  const exporter = useAction(getApplicationsForExport)
  const data = state.status === 'success' ? state.data : null

  const tabs = applicationTabs.map((tab) => ({ ...tab, count: data?.tabCounts[tab.id] }))

  function selectTab(tab: ApplicationTab) {
    // A new tab starts unfiltered.
    setSearchParams(tab === 'open' ? {} : { tab })
  }

  async function exportList() {
    const rows = await exporter.run({ tab: query.tab, search: query.search, type: query.type, role: query.role })
    if (!rows) return
    downloadCsv(
      `applications-${query.tab}-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Application', 'Applicant', 'Type', 'Requested role', 'Submitted', 'Status', 'Decided', 'Decided by', 'Account', 'Reason'],
      rows.map((a) => [
        a.applicationId,
        a.name,
        applicantTypeLabels[a.type],
        requestedRoleLabels[a.requestedRole],
        a.submittedAt,
        a.status,
        a.decidedAt,
        a.decidedBy,
        a.accountId,
        a.rejectReason,
      ]),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Requests for new staff and customer company accounts. Review each one, then approve and provision the account or reject it."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={exportList} disabled={exporter.pending}>
            {exporter.pending ? 'Exporting…' : 'Export'}
          </Button>
        }
      />
      <ProcessSteps />
      <StatusTabs label="Application status" tabs={tabs} activeId={query.tab} onChange={selectTab} />
      {exporter.error && <Banner tone="danger" title="Couldn’t export" message={exporter.error.message} />}

      <PagedListCard
        state={state}
        retry={retry}
        noun="applications"
        summary={query.tab === 'open' && data?.oldestWaiting ? `Oldest waiting: ${data.oldestWaiting}` : undefined}
        onPageChange={(page) => setQuery('page', String(page))}
        filters={
          <>
            <ListSearchBox value={query.search} onChange={(v) => setQuery('search', v, { replace: true })} placeholder="Search applicant or application ID" />
            <FilterSelect label="Applicant type" value={query.type} options={typeOptions} onChange={(v) => setQuery('type', v)} className="w-[200px]" />
            <FilterSelect label="Requested role" value={query.role} options={roleOptions} onChange={(v) => setQuery('role', v)} className="w-[200px]" />
          </>
        }
      >
        {(page) => <ApplicationsTable applications={page.items} tab={query.tab} />}
      </PagedListCard>
    </div>
  )
}
