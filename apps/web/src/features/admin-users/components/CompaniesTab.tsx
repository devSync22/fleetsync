import { useState } from 'react'
import { Banner } from '@/components/shared/Banner'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { useAction } from '@/hooks/useAction'
import { formatLKR } from '@/lib/utils'
import { useCompanyList } from '../hooks/useCompanyList'
import { reactivateCompany } from '../services/adminUsersApi'
import type { CustomerCompany } from '../types'
import { CompaniesTable } from './CompaniesTable'
import { CompanySheet } from './CompanySheet'
import { ListCard } from './ListCard'
import { SearchBox } from './SearchBox'

const statusOptions = [
  { id: 'all', label: 'All statuses' },
  { id: 'active', label: 'Active' },
  { id: 'pending-review', label: 'Pending review' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'suspended', label: 'Suspended' },
]
const balanceOptions = [
  { id: 'any', label: 'Any balance' },
  { id: 'outstanding', label: 'Has outstanding' },
  { id: 'overdue', label: 'Overdue' },
]

/** "Southern Fisheries Co. is 12 days overdue. Matale Spice Exports is suspended and …" */
function overdueMessage(companies: CustomerCompany[]) {
  return companies
    .map((c) =>
      c.status === 'suspended'
        ? `${c.name} is suspended and cannot place new orders until its balance is settled.`
        : `${c.name} is ${c.balanceFlag?.label.replace('Overdue ', '')} overdue.`,
    )
    .join(' ')
}

/** "Customer companies" tab (69:1216): overdue banner, filters and the companies table. */
export function CompaniesTab() {
  const { state, retry, query, setQuery } = useCompanyList()
  const reactivate = useAction(reactivateCompany)
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)
  const [viewing, setViewing] = useState<CustomerCompany | null>(null)
  const overdue = state.status === 'success' ? state.data.overdue : []
  const overdueTotal = overdue.reduce((sum, c) => sum + (c.outstanding ?? 0), 0)

  async function handleReactivate(company: CustomerCompany) {
    setReactivatingId(company.companyId)
    const updated = await reactivate.run(company.companyId)
    setReactivatingId(null)
    if (updated) retry()
  }

  return (
    <div className="flex flex-col gap-5">
      {overdue.length > 0 && (
        <Banner
          tone="danger"
          title={`${formatLKR(overdueTotal)} overdue across ${overdue.length} ${overdue.length === 1 ? 'company' : 'companies'}`}
          message={overdueMessage(overdue)}
        />
      )}
      {reactivate.error && <Banner tone="danger" title="Couldn’t reactivate the company" message={reactivate.error.message} />}
      <ListCard
        state={state}
        retry={retry}
        noun="companies"
        onPageChange={(page) => setQuery('page', String(page))}
        filters={
          <>
            <SearchBox value={query.search} onChange={(v) => setQuery('search', v, { replace: true })} placeholder="Search company, BR no. or contact" />
            <FilterSelect label="Status" value={query.status} options={statusOptions} onChange={(v) => setQuery('status', v)} className="w-[200px]" />
            <FilterSelect label="Balance" value={query.balance} options={balanceOptions} onChange={(v) => setQuery('balance', v)} className="w-[200px]" />
          </>
        }
      >
        {(data) => (
          <CompaniesTable companies={data.items} onView={setViewing} onReactivate={handleReactivate} reactivatingId={reactivatingId} />
        )}
      </ListCard>
      {viewing && <CompanySheet company={viewing} onClose={() => setViewing(null)} />}
    </div>
  )
}
