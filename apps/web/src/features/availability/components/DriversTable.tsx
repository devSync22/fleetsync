import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Driver } from '../types'
import { CurrentTripLink } from './CurrentTripLink'

const cell = 'px-4 py-3'
const headCell = `${cell} text-xs font-medium whitespace-nowrap text-muted-foreground`

export function DriversTable({ drivers }: { drivers: Driver[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b">
          <tr>
            <th scope="col" className={`${headCell} pl-5`}>
              Driver
            </th>
            <th scope="col" className={headCell}>
              Licence
            </th>
            <th scope="col" className={headCell}>
              Status
            </th>
            <th scope="col" className={`${headCell} pr-5`}>
              Current trip
            </th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver.name} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={`${cell} pl-5 font-medium whitespace-nowrap`}>{driver.name}</td>
              <td className={`${cell} whitespace-nowrap text-muted-foreground`}>{driver.licence}</td>
              <td className={cell}>
                <StatusBadge status={driver.status} />
              </td>
              <td className={`${cell} pr-5`}>
                {driver.status === 'off-duty' ? (
                  <span className="text-muted-foreground">Not on shift today</span>
                ) : (
                  <CurrentTripLink tripId={driver.tripId} status={driver.status} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
