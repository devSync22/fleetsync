import { useState, type ReactNode } from 'react'
import { Search, Truck, Users, Wrench } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { KpiCard } from '@/components/shared/KpiCard'
import { KpiCardSkeleton } from '@/components/shared/KpiCardSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { StatusTabs } from '@/components/shared/StatusTabs'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { statusMeta } from '@/components/shared/statusTones'
import { Button } from '@/components/ui/button'
import {
  DEFAULT_STATUS_FILTER,
  matchesQuery,
  parseResource,
  parseStatusFilter,
  resources,
  withStatus,
  type StatusFilter,
} from '../availabilityFilters'
import { DriversTable } from '../components/DriversTable'
import { MechanicsTable } from '../components/MechanicsTable'
import { StatusFilterChips } from '../components/StatusFilterChips'
import { VehiclesTable } from '../components/VehiclesTable'
import { useAvailability } from '../hooks/useAvailability'
import type { Availability, ResourceKind } from '../types'

function count<T extends { status: string }>(rows: T[], status: string) {
  return rows.filter((row) => row.status === status).length
}

export function AvailabilityPage() {
  const { state, retry } = useAvailability()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const resource = parseResource(searchParams.get('resource'))
  const status = parseStatusFilter(searchParams.get('status'), resource)

  function updateParams(changes: Record<string, string | null>) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      for (const [key, value] of Object.entries(changes)) {
        if (value === null) next.delete(key)
        else next.set(key, value)
      }
      return next
    })
  }

  // Each resource has its own statuses, so switching resource resets the status filter.
  const selectResource = (id: ResourceKind) => updateParams({ resource: id === 'vehicles' ? null : id, status: null })
  const selectStatus = (id: StatusFilter) => updateParams({ status: id === DEFAULT_STATUS_FILTER ? null : id })

  const data = state.status === 'success' ? state.data : null
  const rows: { status: string }[] = data ? data[resource.id] : []
  const tabs = resources.map((r) => ({ id: r.id, label: r.label, count: data ? data[r.id].length : undefined }))
  const chips = [
    { id: 'all' as StatusFilter, label: 'All', count: rows.length },
    ...resource.statuses.map((s) => ({ id: s as StatusFilter, label: statusMeta[s].label, count: count(rows, s) })),
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Availability"
        description="Vehicles, drivers and mechanics free today. Check here before you assign a trip."
        actions={
          <SearchInput value={query} onChange={setQuery} placeholder={resource.searchPlaceholder} label={`Search ${resource.label.toLowerCase()}`} />
        }
      />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading availability" className="flex flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={6} />
        </div>
      )}

      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load availability"
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
          <div className="grid gap-4 md:grid-cols-3">
            <KpiCard
              icon={Truck}
              label="Vehicles available"
              value={count(data.vehicles, 'available')}
              meta={`of ${data.vehicles.length} · ${count(data.vehicles, 'in-maintenance')} in maintenance`}
            />
            <KpiCard
              icon={Users}
              tone="success"
              label="Drivers available"
              value={count(data.drivers, 'available')}
              meta={`of ${data.drivers.length} · ${count(data.drivers, 'off-duty')} off duty`}
            />
            <KpiCard
              icon={Wrench}
              tone="info"
              label="Mechanics on shift"
              value={count(data.mechanics, 'available')}
              meta={`of ${data.mechanics.length} · ${count(data.mechanics, 'off-duty')} off duty`}
            />
          </div>

          <div className="flex flex-col gap-4">
            <StatusTabs label="Resource" tabs={tabs} activeId={resource.id} onChange={selectResource} />
            <StatusFilterChips options={chips} active={status} onChange={selectStatus} />
            <ResourceTable
              data={data}
              kind={resource.id}
              status={status}
              query={query}
              onClearSearch={() => setQuery('')}
            />
          </div>
        </>
      )}
    </div>
  )
}

type ResourceTableProps = {
  data: Availability
  kind: ResourceKind
  status: StatusFilter
  query: string
  onClearSearch: () => void
}

function ResourceTable({ data, kind, status, query, onClearSearch }: ResourceTableProps) {
  let table: ReactNode = null
  if (kind === 'vehicles') {
    const vehicles = withStatus(data.vehicles, status).filter((v) => matchesQuery([v.plate, v.type], query))
    if (vehicles.length > 0) table = <VehiclesTable vehicles={vehicles} />
  } else if (kind === 'drivers') {
    const drivers = withStatus(data.drivers, status).filter((d) => matchesQuery([d.name, d.licence], query))
    if (drivers.length > 0) table = <DriversTable drivers={drivers} />
  } else {
    const mechanics = withStatus(data.mechanics, status).filter((m) => matchesQuery([m.name, m.speciality], query))
    if (mechanics.length > 0) table = <MechanicsTable mechanics={mechanics} />
  }
  if (table) return table

  const noun = kind
  if (query.trim()) {
    return (
      <EmptyState
        icon={Search}
        tone="accent"
        title={`No matching ${noun}`}
        description={`No ${noun} match “${query.trim()}” with this filter.`}
        action={
          <Button type="button" variant="outline" onClick={onClearSearch}>
            Clear search
          </Button>
        }
      />
    )
  }
  const icon = kind === 'vehicles' ? Truck : kind === 'drivers' ? Users : Wrench
  if (status === 'all' || data[kind].length === 0) {
    return (
      <EmptyState
        icon={icon}
        title={`No ${noun} yet`}
        description={`${resources.find((r) => r.id === kind)?.label} the Fleet Administrator adds will appear here.`}
      />
    )
  }
  return (
    <EmptyState
      icon={icon}
      title={`No ${statusMeta[status].label.toLowerCase()} ${noun}`}
      description={
        status === 'available'
          ? 'Everything is busy right now. Check again when a trip finishes.'
          : 'Try another status filter.'
      }
    />
  )
}
