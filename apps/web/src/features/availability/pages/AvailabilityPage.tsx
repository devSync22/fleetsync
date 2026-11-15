import { TrendingUp, Truck, Users, Wrench } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { KpiCard } from '@/components/shared/KpiCard'
import { KpiCardSkeleton } from '@/components/shared/KpiCardSkeleton'
import { PageHeader } from '@/components/shared/PageHeader'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { PeopleFreeCard } from '../components/PeopleFreeCard'
import { VehicleScheduleCard } from '../components/VehicleScheduleCard'
import { useDaySchedule } from '../hooks/useDaySchedule'
import { DEFAULT_WINDOW, isPersonFree, scheduleDates, timeWindows, vehicleStatus } from '../schedule'

/** "Coordinator — Availability" (141:4873). Day and time window live in the URL (`?date=&window=`). */
export function AvailabilityPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const date = scheduleDates.find((d) => d.id === searchParams.get('date'))?.id ?? scheduleDates[0].id
  const window = timeWindows.find((w) => w.id === searchParams.get('window')) ?? DEFAULT_WINDOW
  const { state, retry } = useDaySchedule(date)

  function setParam(key: 'date' | 'window', value: string) {
    setSearchParams((params) => {
      const next = new URLSearchParams(params)
      next.set(key, value)
      return next
    })
  }

  const data = state.status === 'success' ? state.data : null
  const vehiclesFree = data ? data.vehicles.filter((v) => vehicleStatus(v, window) === 'free').length : 0
  const inService = data ? data.vehicles.filter((v) => v.bookings.some((b) => b.kind === 'service')).length : 0
  const driversFree = data ? data.drivers.filter((p) => isPersonFree(p, window)).length : 0
  const mechanicsFree = data ? data.mechanics.filter((p) => isPersonFree(p, window)).length : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Availability"
        description="Check which vehicles, drivers and mechanics are free for a day and time window before you create a trip."
        actions={
          <>
            <FilterSelect label="Day" value={date} onChange={(v) => setParam('date', v)} options={scheduleDates} className="w-[190px]" />
            <FilterSelect
              label="Time window"
              value={window.id}
              onChange={(v) => setParam('window', v)}
              options={timeWindows.map((w) => ({ id: w.id, label: w.label }))}
              className="w-[160px]"
            />
          </>
        }
      />

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label="Loading availability" className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={8} />
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
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <KpiCard icon={Truck} label="Vehicles free" value={vehiclesFree} meta={`of ${data.vehicles.length} for ${window.label}`} />
            <KpiCard icon={Users} tone="success" label="Drivers free" value={driversFree} meta={`of ${data.drivers.length} on shift that day`} />
            <KpiCard icon={TrendingUp} tone="accent" label="Mechanics free" value={mechanicsFree} meta={`of ${data.mechanics.length} mechanics`} />
            <KpiCard icon={Wrench} tone="pending" label="In maintenance" value={inService} meta="vehicles booked for service" />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <VehicleScheduleCard vehicles={data.vehicles} window={window} />
            <div className="flex flex-col gap-5">
              <PeopleFreeCard
                title="Drivers free"
                subtitle={`${driversFree} drivers are free ${window.label}`}
                noun="drivers"
                people={data.drivers}
                window={window}
                initialCount={5}
              />
              <PeopleFreeCard
                title="Mechanics free"
                subtitle={`${mechanicsFree} of ${data.mechanics.length} are free ${window.label}`}
                noun="mechanics"
                people={data.mechanics}
                window={window}
                initialCount={3}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
