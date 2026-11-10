import { StatusBadge } from '@/components/shared/StatusBadge'
import type { Mechanic } from '../types'

const cell = 'px-4 py-3'
const headCell = `${cell} text-xs font-medium whitespace-nowrap text-muted-foreground`

export function MechanicsTable({ mechanics }: { mechanics: Mechanic[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-card">
      <table className="w-full text-left text-[13px]">
        <thead className="border-b">
          <tr>
            <th scope="col" className={`${headCell} pl-5`}>
              Mechanic
            </th>
            <th scope="col" className={headCell}>
              Speciality
            </th>
            <th scope="col" className={headCell}>
              Status
            </th>
            <th scope="col" className={`${headCell} pr-5`}>
              Matched trips
            </th>
          </tr>
        </thead>
        <tbody>
          {mechanics.map((mechanic) => (
            <tr key={mechanic.name} className="border-b transition-colors last:border-b-0 hover:bg-secondary/50">
              <td className={`${cell} pl-5 font-medium whitespace-nowrap`}>{mechanic.name}</td>
              <td className={`${cell} whitespace-nowrap text-muted-foreground`}>{mechanic.speciality}</td>
              <td className={cell}>
                <StatusBadge status={mechanic.status} />
              </td>
              <td className={`${cell} pr-5 whitespace-nowrap text-muted-foreground`}>
                {mechanic.status === 'off-duty'
                  ? 'Not on shift today'
                  : mechanic.activeTripCount === 0
                    ? 'No active trips'
                    : `${mechanic.activeTripCount} active ${mechanic.activeTripCount === 1 ? 'trip' : 'trips'}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
