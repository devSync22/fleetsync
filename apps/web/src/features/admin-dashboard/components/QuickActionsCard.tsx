import { Building2, SlidersHorizontal, Truck, UserPlus, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

type QuickAction = { label: string; hint: string; to: string; icon: LucideIcon }

/** Shortcuts from the "Quick actions" card of the Admin dashboard. */
const actions: QuickAction[] = [
  { label: 'Create user account', hint: 'Add staff with a role', to: '/admin/users/new', icon: UserPlus },
  { label: 'Add vehicle', hint: 'Register plate, type and odometer', to: '/admin/vehicles/new', icon: Truck },
  // No "Add company" frame exists yet, so this opens the Customer companies tab where companies are managed.
  { label: 'Add customer company', hint: 'Billing and contact details', to: '/admin/users?tab=companies', icon: Building2 },
  { label: 'Manage service types', hint: 'Intervals used for alerts', to: '/admin/reference-data', icon: SlidersHorizontal },
]

export function QuickActionsCard() {
  return (
    <section className="flex flex-col rounded-xl border bg-card">
      <h2 className="px-5 pt-4 pb-1 text-base leading-6 font-semibold">Quick actions</h2>
      <div className="grid gap-3 px-5 pt-3 pb-5 sm:grid-cols-2">
        {actions.map(({ label, hint, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 rounded-[10px] border px-3.5 py-3 transition-colors hover:bg-secondary/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
              <Icon className="size-[18px]" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[13px] font-semibold">{label}</span>
              <span className="truncate text-xs text-muted-foreground">{hint}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
