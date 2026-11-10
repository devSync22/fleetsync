import { Link } from 'react-router'
import { ListCell } from '@/components/shared/ListCell'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { TripListItem } from '../types'

// Mechanic and Scheduled only fit from xl (1280px) up.
const cell = 'px-3 py-3 xl:px-4'
const wideOnly = 'hidden xl:table-cell'
const headCell = `${cell} py-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground`

export function TripsTable({ trips }: { trips: TripListItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b bg-background">
          <tr>
            <th scope="col" className={`${headCell} pl-5 xl:pl-5`}>Trip</th>
            <th scope="col" className={headCell}>Route</th>
            <th scope="col" className={headCell}>Vehicle & driver</th>
            <th scope="col" className={`${headCell} ${wideOnly}`}>Mechanic</th>
            <th scope="col" className={`${headCell} ${wideOnly}`}>Scheduled</th>
            <th scope="col" className={headCell}>Started</th>
            <th scope="col" className={headCell}>Status</th>
            <th scope="col" className={`${headCell} pr-5 xl:pr-5`}><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {trips.map((trip) => (
            <tr key={trip.tripId} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={`${cell} pl-5 xl:pl-5`}>
                <ListCell mono primary={trip.tripId} secondary={trip.customerName} />
              </td>
              <td className={`${cell} text-sm whitespace-nowrap`}>{trip.route}</td>
              <td className={cell}>
                {trip.vehiclePlate ? (
                  <ListCell mono primary={trip.vehiclePlate} secondary={trip.driverName ?? ''} />
                ) : (
                  <span className="text-faint">Not assigned</span>
                )}
              </td>
              <td className={`${cell} ${wideOnly} text-sm whitespace-nowrap`}>
                {trip.mechanicName ?? <span className="text-faint">—</span>}
              </td>
              <td className={`${cell} ${wideOnly} font-mono text-sm whitespace-nowrap`}>{trip.scheduledAt}</td>
              <td className={cell}>
                {trip.startedAt ? (
                  <ListCell
                    mono
                    primary={trip.startedAt}
                    secondary={trip.startOdometerKm ? `${trip.startOdometerKm.toLocaleString('en-LK')} km` : ''}
                  />
                ) : (
                  <span className="text-faint">—</span>
                )}
              </td>
              <td className={cell}>
                {trip.notStartedOnTime ? (
                  <StatusBadge tone="danger">Not started</StatusBadge>
                ) : (
                  <StatusBadge status={trip.status} />
                )}
              </td>
              <td className={`${cell} pr-5 text-right xl:pr-5`}>
                <Button asChild variant="outline" size="sm">
                  <Link to={`/coordinator/trips/${trip.tripId}`}>View</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
