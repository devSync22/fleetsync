import { SectionCard } from '@/components/shared/SectionCard'
import type { RoleCount } from '../types'

/** "Users by role": one bar per role, scaled against the largest role. */
export function UsersByRoleCard({ roles, total }: { roles: RoleCount[]; total: number }) {
  const max = Math.max(1, ...roles.map((role) => role.count))

  return (
    <SectionCard title="Users by role" subtitle={`${total} active accounts`}>
      <ul className="flex flex-col gap-3.5 px-5 py-[18px]">
        {roles.map((role) => (
          <li key={role.label} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[13px]">
              <span>{role.label}</span>
              <span className="font-mono font-medium">{role.count}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[3px] bg-secondary" aria-hidden>
              <div className="h-full rounded-[3px] bg-brand" style={{ width: `${(role.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}
