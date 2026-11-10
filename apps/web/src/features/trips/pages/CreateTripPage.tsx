import { useState, type ReactNode } from 'react'
import { PackageX } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { EmptyState } from '@/components/shared/EmptyState'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/hooks/useAction'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { ChoiceCard } from '../components/ChoiceCard'
import { ChooseOrderDialog } from '../components/ChooseOrderDialog'
import { FilterSelect } from '../components/FilterSelect'
import { OrderSummaryStrip } from '../components/OrderSummaryStrip'
import { TripSummaryCard } from '../components/TripSummaryCard'
import { useCreateTripData } from '../hooks/useCreateTripData'
import { createTrip } from '../services/tripsApi'
import type { DriverCandidate, MechanicCandidate, ReadyOrder, TripCandidates, VehicleCandidate } from '../types'

const TRIPS_PATH = '/coordinator/trips'

/** "Create trip" (124:4326). Without `?order=` it first asks which paid order to use (518:11998). */
export function CreateTripPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const orderId = searchParams.get('order')
  const { state, retry } = useCreateTripData()

  const header = (
    <PageHeader
      title="Create trip"
      description="Pick an available vehicle, driver and mechanic for this order. Only those free for the whole trip window are shown."
    />
  )

  if (state.status === 'loading') {
    return (
      <div aria-busy="true" aria-label="Loading create trip" className="flex flex-col gap-6">
        {header}
        <Skeleton className="h-[72px] w-full rounded-xl" />
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Banner
          tone="danger"
          title="Couldn’t load free vehicles and staff"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      </div>
    )
  }

  const { orders, candidates } = state.data

  if (!orderId) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <ChooseOrderDialog
          open
          orders={orders}
          onClose={() => navigate(TRIPS_PATH)}
          onContinue={(id) => setSearchParams({ order: id })}
        />
      </div>
    )
  }

  const order = orders.find((o) => o.orderId === orderId)
  if (!order) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <EmptyState
          className="mx-auto w-[380px]"
          icon={PackageX}
          tone="pending"
          title={`${orderId} can’t be turned into a trip`}
          description="Only paid orders without a trip can be used. It may already have a trip, or still be waiting for payment."
          action={
            <Button asChild variant="outline">
              <Link to={`${TRIPS_PATH}/new`}>Choose another order</Link>
            </Button>
          }
        />
      </div>
    )
  }

  return <CreateTripForm key={order.orderId} order={order} candidates={candidates} header={header} />
}

type CreateTripFormProps = {
  order: ReadyOrder
  candidates: TripCandidates
  header: ReactNode
}

function CreateTripForm({ order, candidates, header }: CreateTripFormProps) {
  const navigate = useNavigate()
  const origin = order.route.split(' → ')[0]
  const [vehicleFilter, setVehicleFilter] = useState<'fits' | 'all'>('fits')
  const [driverFilter, setDriverFilter] = useState<'heavy' | 'all'>(order.weightTonnes > 3.5 ? 'heavy' : 'all')
  const [mechanicOrder, setMechanicOrder] = useState<'base' | 'all'>('base')
  const [vehiclePlate, setVehiclePlate] = useState<string | null>(null)
  const [driverCode, setDriverCode] = useState<string | null>(null)
  const [mechanicCode, setMechanicCode] = useState<string | null>(null)
  const { run, pending, error } = useAction(createTrip)

  const vehicles = candidates.vehicles.filter((v) => vehicleFilter === 'all' || v.capacityTonnes >= order.weightTonnes)
  const drivers = candidates.drivers.filter((d) => driverFilter === 'all' || d.licence === 'Heavy')
  const atBase = (m: MechanicCandidate) => m.workshop.startsWith(origin)
  const mechanics =
    mechanicOrder === 'base'
      ? [...candidates.mechanics].sort((a, b) => Number(atBase(b)) - Number(atBase(a)))
      : candidates.mechanics

  const vehicle = candidates.vehicles.find((v) => v.plate === vehiclePlate) ?? null
  const driver = candidates.drivers.find((d) => d.code === driverCode) ?? null
  const mechanic = candidates.mechanics.find((m) => m.code === mechanicCode) ?? null

  async function create() {
    if (!vehiclePlate || !driverCode || !mechanicCode) return
    const result = await run({ orderId: order.orderId, vehiclePlate, driverCode, mechanicCode })
    if (result) navigate(`${TRIPS_PATH}/${result.tripId}/created`)
  }

  return (
    <div className="flex flex-col gap-6">
      <Breadcrumbs
        items={[
          { label: 'Submitted orders', to: '/coordinator/orders' },
          { label: order.orderId, mono: true },
          { label: 'Create trip' },
        ]}
      />
      {header}
      <OrderSummaryStrip order={order} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <ChoiceCard<VehicleCandidate>
            title="1. Choose a vehicle"
            subtitle={
              vehicleFilter === 'fits'
                ? `${vehicles.length} of ${candidates.totalVehicles} vehicles are free and can carry ${order.weightTonnes} t`
                : `${vehicles.length} of ${candidates.totalVehicles} vehicles are free`
            }
            filter={
              <FilterSelect
                label="Filter vehicles"
                value={vehicleFilter}
                onChange={setVehicleFilter}
                options={[
                  { id: 'fits', label: `Capacity ≥ ${order.weightTonnes} t` },
                  { id: 'all', label: 'All free vehicles' },
                ]}
              />
            }
            name="vehicle"
            mainHeader="Vehicle"
            renderMain={(v) => (
              <div className="flex flex-col gap-px">
                <span className="font-mono text-sm font-medium">{v.plate}</span>
                <span className="text-xs text-muted-foreground">{v.model}</span>
              </div>
            )}
            columns={[
              { header: 'Capacity', width: 'w-16', render: (v) => <span className="font-mono text-sm">{v.capacityTonnes} t</span> },
              { header: 'Home base', width: 'w-[120px]', render: (v) => v.homeBase },
              {
                header: 'Next service',
                width: 'w-24',
                render: (v) => <span className="text-muted-foreground">in {v.nextServiceKm.toLocaleString('en-LK')} km</span>,
              },
              { header: 'Status', width: 'w-[110px]', render: (v) => <StatusBadge status={v.status} /> },
            ]}
            rows={vehicles}
            getKey={(v) => v.plate}
            selected={vehiclePlate}
            onSelect={setVehiclePlate}
            footnote="Vehicles on another trip or in maintenance during this window are hidden."
            emptyText="No free vehicle can carry this load in the trip window. Try All free vehicles."
          />

          <ChoiceCard<DriverCandidate>
            title="2. Choose a driver"
            subtitle={
              driverFilter === 'heavy'
                ? `${drivers.length} drivers are free with a heavy vehicle licence`
                : `${drivers.length} drivers are free`
            }
            filter={
              <FilterSelect
                label="Filter drivers"
                value={driverFilter}
                onChange={setDriverFilter}
                options={[
                  { id: 'heavy', label: 'Licence: heavy vehicle' },
                  { id: 'all', label: 'Licence: any' },
                ]}
              />
            }
            name="driver"
            mainHeader="Driver"
            renderMain={(d) => (
              <div className="flex items-center gap-2.5">
                <InitialsAvatar initials={d.initials} size={32} tone="surface" />
                <div className="flex flex-col gap-px">
                  <span className="text-sm font-medium">{d.name}</span>
                  <span className="text-xs text-muted-foreground">{d.code}</span>
                </div>
              </div>
            )}
            columns={[
              { header: 'Licence', width: 'w-16', render: (d) => d.licence },
              { header: 'Last trip ended', width: 'w-[120px]', render: (d) => d.lastTripEnded },
              {
                header: 'Trips this week',
                width: 'w-24',
                render: (d) => <span className="text-muted-foreground">{d.tripsThisWeek} {d.tripsThisWeek === 1 ? 'trip' : 'trips'}</span>,
              },
              { header: 'Status', width: 'w-[110px]', render: () => <StatusBadge status="available" /> },
            ]}
            rows={drivers}
            getKey={(d) => d.code}
            selected={driverCode}
            onSelect={setDriverCode}
            emptyText="No driver with this licence is free in the trip window."
          />

          <ChoiceCard<MechanicCandidate>
            title="3. Choose a mechanic"
            subtitle="Covers breakdowns and repairs on this route during the trip"
            filter={
              <FilterSelect
                label="Order mechanics"
                value={mechanicOrder}
                onChange={setMechanicOrder}
                options={[
                  { id: 'base', label: `Base: ${origin}` },
                  { id: 'all', label: 'Any workshop' },
                ]}
              />
            }
            name="mechanic"
            mainHeader="Mechanic"
            renderMain={(m) => (
              <div className="flex items-center gap-2.5">
                <InitialsAvatar initials={m.initials} size={32} tone="surface" />
                <div className="flex flex-col gap-px">
                  <span className="text-sm font-medium">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.code}</span>
                </div>
              </div>
            )}
            columns={[
              { header: 'Speciality', width: 'w-28', render: (m) => m.speciality },
              { header: 'Workshop', width: 'w-[104px]', render: (m) => m.workshop },
              {
                header: 'Open jobs',
                width: 'w-[70px]',
                render: (m) => <span className="text-muted-foreground">{m.openJobs} {m.openJobs === 1 ? 'job' : 'jobs'}</span>,
              },
              { header: 'Status', width: 'w-[110px]', render: () => <StatusBadge status="available" /> },
            ]}
            rows={mechanics}
            getKey={(m) => m.code}
            selected={mechanicCode}
            onSelect={setMechanicCode}
            emptyText="No mechanic is free in the trip window."
          />
        </div>

        <div className="xl:sticky xl:top-6">
          <TripSummaryCard
            tripId={candidates.nextTripId}
            order={order}
            vehicle={vehicle}
            driver={driver}
            mechanic={mechanic}
            pending={pending}
            error={error}
            onCreate={create}
            onCancel={() => navigate('/coordinator/orders?status=ready-for-trip')}
          />
        </div>
      </div>
    </div>
  )
}
