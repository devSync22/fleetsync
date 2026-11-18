import { CircleCheck, CircleOff, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { RowActionsMenu, type RowAction } from '@/components/shared/RowActionsMenu'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { tableStyles as t } from '@/components/shared/tableStyles'
import { Button } from '@/components/ui/button'
import { vehicleTypeLabel } from '../vehicleLabels'
import type { ManualVehicleStatus, Vehicle } from '../types'
import { NextServiceCell } from './NextServiceCell'

type VehiclesTableProps = {
  vehicles: Vehicle[]
  onSetStatus: (vehicle: Vehicle, status: ManualVehicleStatus) => void
}

/** The ⋯ menu offers the manual statuses the vehicle isn't in; vehicles with a trip get none. */
function statusActions(vehicle: Vehicle, onSetStatus: VehiclesTableProps['onSetStatus']): RowAction[] {
  if (vehicle.status === 'on-trip' || vehicle.status === 'trip-scheduled') return []
  const all: (RowAction & { status: ManualVehicleStatus })[] = [
    { status: 'available', label: 'Mark available', description: 'Can be assigned to trips', icon: CircleCheck, onSelect: () => onSetStatus(vehicle, 'available') },
    { status: 'in-maintenance', label: 'Send to maintenance', description: 'Hidden from trips until ready', icon: Wrench, onSelect: () => onSetStatus(vehicle, 'in-maintenance') },
    { status: 'out-of-service', label: 'Take out of service', description: 'Off the road or retired', icon: CircleOff, tone: 'danger', onSelect: () => onSetStatus(vehicle, 'out-of-service') },
  ]
  return all.filter((action) => action.status !== vehicle.status)
}

/** Vehicles table (110:3108): plate and model, type, capacity, odometer, next service, status. */
export function VehiclesTable({ vehicles, onSetStatus }: VehiclesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={t.table}>
        <thead className={t.headRow}>
          <tr>
            <th scope="col" className={t.th}>Vehicle</th>
            <th scope="col" className={t.th}>Type</th>
            <th scope="col" className={t.th}>Capacity</th>
            <th scope="col" className={t.th}>Odometer</th>
            <th scope="col" className={t.th}>Next service</th>
            <th scope="col" className={t.th}>Status</th>
            <th scope="col" className={`${t.th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => {
            const actions = statusActions(vehicle, onSetStatus)
            const editPath = `/admin/vehicles/${encodeURIComponent(vehicle.plate)}/edit`
            return (
              <tr key={vehicle.plate} className={t.row}>
                <td className={t.td}>
                  <div className="flex flex-col whitespace-nowrap">
                    <span className="font-mono text-[13px] font-medium">{vehicle.plate}</span>
                    <span className="text-xs text-muted-foreground">
                      {vehicle.model} · {vehicle.year}
                    </span>
                  </div>
                </td>
                <td className={`${t.td} whitespace-nowrap`}>{vehicleTypeLabel(vehicle.type)}</td>
                <td className={`${t.td} whitespace-nowrap`}>
                  {vehicle.capacity} {vehicle.capacityUnit}
                </td>
                <td className={`${t.td} font-mono whitespace-nowrap`}>{vehicle.odometerKm.toLocaleString('en-LK')} km</td>
                <td className={t.td}>
                  <NextServiceCell next={vehicle.nextService} />
                </td>
                <td className={t.td}>
                  <StatusBadge status={vehicle.status} />
                </td>
                <td className={t.td}>
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={editPath}>Edit</Link>
                    </Button>
                    <RowActionsMenu
                      label={`More actions for ${vehicle.plate}`}
                      title={vehicle.plate}
                      subtitle={actions.length ? `${vehicle.model} · ${vehicle.year}` : 'Status follows its trip'}
                      actions={actions}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
