import { useNavigate } from 'react-router'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAction } from '@/hooks/useAction'
import { VehicleForm } from '../components/VehicleForm'
import { createVehicle } from '../services/vehiclesApi'
import type { VehicleInput } from '../types'

/** "Admin — Vehicles / Add vehicle" (378:7357). */
export function AddVehiclePage() {
  const navigate = useNavigate()
  const { run, pending, error } = useAction(createVehicle)

  async function save(input: VehicleInput) {
    const vehicle = await run(input)
    // Back to the list, searched to the new plate so it's easy to spot.
    if (vehicle) navigate(`/admin/vehicles?search=${encodeURIComponent(vehicle.plate)}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Breadcrumbs items={[{ label: 'Vehicles', to: '/admin/vehicles' }, { label: 'Add vehicle' }]} />
        <PageHeader
          title="Add vehicle"
          description="Register a vehicle so coordinators can assign it to trips. Drivers are matched to vehicles per trip."
        />
      </div>
      <VehicleForm pending={pending} error={error} onSubmit={save} />
    </div>
  )
}
