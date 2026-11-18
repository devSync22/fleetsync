import { Banner } from '@/components/shared/Banner'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { useDriverList } from '../hooks/useDriverList'
import type { DriverRow } from '../types'
import { DriversTable } from './DriversTable'
import { ListCard } from './ListCard'
import { SearchBox } from './SearchBox'

const classOptions = [
  { id: 'all', label: 'All licence classes' },
  { id: 'Light (B)', label: 'Light (B)' },
  { id: 'Heavy (C)', label: 'Heavy (C)' },
  { id: 'Heavy (CE)', label: 'Heavy (CE)' },
]
const statusOptions = [
  { id: 'all', label: 'All statuses' },
  { id: 'available', label: 'Available' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'on-trip', label: 'On trip' },
  { id: 'off-duty', label: 'Off duty' },
  { id: 'blocked', label: 'Blocked' },
]

/** "Rasika Silva’s licence expires in 14 days and Chathura Weerasinghe’s has expired." */
function attentionMessage(drivers: DriverRow[]) {
  const parts = drivers.map((d) =>
    d.licenceStatus === 'expiring' ? `${d.name}’s licence expires in ${d.expiresInDays} days` : `${d.name}’s has expired`,
  )
  const sentence = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0]
  return `${sentence}. Drivers with an expired licence cannot be assigned to trips.`
}

type DriversTabProps = {
  onView: (userId: string) => void
  onChangeRole: (userId: string) => void
  onDeactivate: (userId: string) => void
}

/** "Drivers" tab (65:1185): licence warnings banner, filters and the drivers table. */
export function DriversTab({ onView, onChangeRole, onDeactivate }: DriversTabProps) {
  const { state, retry, query, setQuery } = useDriverList()
  const attention = state.status === 'success' ? state.data.attention : []

  return (
    <div className="flex flex-col gap-5">
      {attention.length > 0 && (
        <Banner
          tone="pending"
          title={`${attention.length} driver ${attention.length === 1 ? 'licence needs' : 'licences need'} attention`}
          message={attentionMessage(attention)}
        />
      )}
      <ListCard
        state={state}
        retry={retry}
        noun="drivers"
        onPageChange={(page) => setQuery('page', String(page))}
        filters={
          <>
            <SearchBox value={query.search} onChange={(v) => setQuery('search', v, { replace: true })} placeholder="Search name, phone or licence no." />
            <FilterSelect label="Licence class" value={query.licenceClass} options={classOptions} onChange={(v) => setQuery('licenceClass', v)} className="w-[200px]" />
            <FilterSelect label="Status" value={query.status} options={statusOptions} onChange={(v) => setQuery('status', v)} className="w-[200px]" />
          </>
        }
      >
        {(data) => <DriversTable drivers={data.items} onView={onView} onChangeRole={onChangeRole} onDeactivate={onDeactivate} />}
      </ListCard>
    </div>
  )
}
