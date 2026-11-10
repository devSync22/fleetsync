import { ListCell } from '@/components/shared/ListCell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Vehicle } from '../types'
import { CurrentTripLink } from './CurrentTripLink'

const numberFormatter = new Intl.NumberFormat('en-LK')

const cell = 'px-4 py-3'
const headCell = `${cell} text-xs font-medium whitespace-nowrap text-muted-foreground`

export function VehiclesTable({ vehicles }: { vehicles: Vehicle[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b">
          <tr>
            <th scope="col" className={`${headCell} pl-5`}>
              Vehicle
            </th>
            <th scope="col" className={`${headCell} text-right`}>
              Capacity
            </th>
            <th scope="col" className={`${headCell} text-right`}>
              Odometer
            </th>
            <th scope="col" className={headCell}>
              Status
            </th>
            <th scope="col" className={`${headCell} pr-5`}>
              Current work
            </th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.plate} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={`${cell} pl-5`}>
                <ListCell mono primary={vehicle.plate} secondary={vehicle.type} />
              </td>
              <td className={`${cell} text-right whitespace-nowrap`}>{numberFormatter.format(vehicle.capacityKg)} kg</td>
              <td className={`${cell} text-right font-mono whitespace-nowrap`}>
                {numberFormatter.format(vehicle.odometerKm)} km
              </td>
              <td className={cell}>
                <StatusBadge status={vehicle.status} />
              </td>
              <td className={`${cell} pr-5`}>
                {vehicle.note ? (
                  <span className="text-muted-foreground">{vehicle.note}</span>
                ) : (
                  <CurrentTripLink tripId={vehicle.tripId} status={vehicle.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
