import { Truck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { Banner } from '@/components/shared/Banner'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAction } from '@/hooks/useAction'
import { VehicleForm } from '../components/VehicleForm'
import { useVehicle } from '../hooks/useVehicle'
import { updateVehicle } from '../services/vehiclesApi'
import type { VehicleInput } from '../types'

/** Edit a vehicle: the Add vehicle form, filled in. There is no separate frame for it. */
export function EditVehiclePage() {
  const { plate = '' } = useParams()
  const navigate = useNavigate()
  const { state, retry } = useVehicle(plate)
  const save = useAction(updateVehicle)

  async function submit(input: VehicleInput) {
    const vehicle = await save.run(plate, input)
    if (vehicle) navigate(`/admin/vehicles?search=${encodeURIComponent(vehicle.plate)}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: 'Vehicles', to: '/admin/vehicles' }, { label: plate, mono: true }]} />
        <PageHeader title="Edit vehicle" description="Update the vehicle’s details, odometer or operating status." />
      </div>

      {state.status === 'loading' && <Skeleton className="h-[480px] rounded-xl" aria-label="Loading vehicle" />}
      {state.status === 'error' &&
        (state.error.status === 404 ? (
          <EmptyState
            icon={Truck}
            title="Vehicle not found"
            description={`There is no vehicle ${plate}.`}
            action={
              <Button asChild variant="outline">
                <Link to="/admin/vehicles">Back to vehicles</Link>
              </Button>
            }
          />
        ) : (
          <Banner
            tone="danger"
            title="Couldn’t load the vehicle"
            message={state.error.message}
            action={
              <Button type="button" variant="outline" size="sm" onClick={retry}>
                Try again
              </Button>
            }
          />
        ))}
      {state.status === 'success' && <VehicleForm vehicle={state.data} pending={save.pending} error={save.error} onSubmit={submit} />}
    </div>
  )
}
