import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { ListSearchBox } from '@/components/shared/ListSearchBox'
import { PageHeader } from '@/components/shared/PageHeader'
import { PagedListCard } from '@/components/shared/PagedListCard'
import { Button } from '@/components/ui/button'
import { useAction } from '@/hooks/useAction'
import { downloadCsv } from '@/lib/csv'
import { StatusFilterCards } from '../components/StatusFilterCards'
import { VehiclesTable } from '../components/VehiclesTable'
import { useVehicles } from '../hooks/useVehicles'
import { getAllVehicles, setVehicleStatus } from '../services/vehiclesApi'
import type { ManualVehicleStatus, Vehicle, VehicleStatus } from '../types'
import { manualStatuses, vehicleTypeLabel, vehicleTypes } from '../vehicleLabels'

const typeOptions = [{ id: 'all', label: 'All types' }, ...vehicleTypes.map((t) => ({ id: t.id, label: t.label }))]
const statusOptions = [
  { id: 'all', label: 'All statuses' },
  { id: 'available', label: 'Available' },
  { id: 'on-trip', label: 'On trip' },
  { id: 'trip-scheduled', label: 'Trip scheduled' },
  { id: 'in-maintenance', label: 'In maintenance' },
  { id: 'out-of-service', label: 'Out of service' },
]

/** "Admin — Vehicles" (110:3108): every vehicle in the fleet, filterable by status, type and search. */
export function VehiclesPage() {
  const { state, retry, query, setQuery } = useVehicles()
  const statusChange = useAction(setVehicleStatus)
  const exporter = useAction(getAllVehicles)
  const [notice, setNotice] = useState<string | null>(null)
  const counts = state.status === 'success' ? state.data.statusCounts : null

  async function changeStatus(vehicle: Vehicle, status: ManualVehicleStatus) {
    const updated = await statusChange.run(vehicle.plate, status)
    if (updated) {
      setNotice(`${updated.plate} is now marked ${manualStatuses.find((m) => m.id === status)?.label ?? status}.`)
      retry()
    }
  }

  async function exportList() {
    const rows = await exporter.run()
    if (!rows) return
    downloadCsv(
      `vehicles-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Registration', 'Model', 'Year', 'Type', 'Capacity', 'Odometer (km)', 'Status'],
      rows.map((v) => [v.plate, v.model, v.year, vehicleTypeLabel(v.type), `${v.capacity} ${v.capacityUnit}`, v.odometerKm, v.status]),
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Vehicles"
        description="Register and maintain every vehicle in the fleet. Drivers are matched to vehicles per trip by the Coordinator."
        actions={
          <>
            <Button type="button" variant="outline" onClick={exportList} disabled={exporter.pending}>
              {exporter.pending ? 'Exporting…' : 'Export'}
            </Button>
            <Button asChild>
              <Link to="/admin/vehicles/new">
                <Plus aria-hidden />
                Add vehicle
              </Link>
            </Button>
          </>
        }
      />

      <StatusFilterCards counts={counts} active={query.status} onChange={(status) => setQuery('status', status)} />

      {notice && <Banner tone="success" title="Status updated" message={notice} />}
      {(statusChange.error || exporter.error) && (
        <Banner tone="danger" title="Something went wrong" message={(statusChange.error ?? exporter.error)!.message} />
      )}

      <PagedListCard
        state={state}
        retry={retry}
        noun="vehicles"
        onPageChange={(page) => setQuery('page', String(page))}
        filters={
          <>
            <ListSearchBox value={query.search} onChange={(v) => setQuery('search', v, { replace: true })} placeholder="Search plate, model or chassis no." />
            <FilterSelect label="Vehicle type" value={query.type} options={typeOptions} onChange={(v) => setQuery('type', v)} className="w-[150px]" />
            <FilterSelect
              label="Status"
              value={query.status}
              options={statusOptions}
              onChange={(v) => setQuery('status', v as VehicleStatus | 'all')}
              className="w-[150px]"
            />
          </>
        }
      >
        {(page) => <VehiclesTable vehicles={page.items} onSetStatus={changeStatus} />}
      </PagedListCard>
    </div>
  )
}
