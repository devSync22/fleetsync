import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { SectionCard } from '@/components/shared/SectionCard'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { parseTripTab, sortTrips, tripSortOptions, tripTabs, type TripSort } from '../tripTabs'
import type { TripListItem, TripStatus } from '../types'
import { FilterSelect } from './FilterSelect'
import { TripsTable } from './TripsTable'

export function AllTripsCard({ trips }: { trips: TripListItem[] }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState<TripSort>('scheduled')
  const activeTab = parseTripTab(searchParams.get('status'))

  function selectTab(tab: TripStatus) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      if (tab === tripTabs[0].id) next.delete('status')
      else next.set('status', tab)
      return next
    })
  }

  const tabs = tripTabs.map((tab) => ({
    id: tab.id,
    label: tab.label,
    count: trips.filter((trip) => trip.status === tab.id).length,
  }))
  const visible = sortTrips(
    trips.filter((trip) => trip.status === activeTab.id),
    sort,
  )

  return (
    <SectionCard
      title="All trips"
      subtitle="Open a trip to see its details and manage it"
      action={<FilterSelect label="Sort trips" value={sort} options={tripSortOptions} onChange={setSort} />}
    >
      <div className="px-5 pt-3">
        <StatusTabs label="Trip status" tabs={tabs} activeId={activeTab.id} onChange={selectTab} />
      </div>
      {visible.length > 0 ? (
        <TripsTable trips={visible} />
      ) : (
        <EmptyState bare icon={activeTab.empty.icon} title={activeTab.empty.title} description={activeTab.empty.description} />
      )}
    </SectionCard>
  )
}
