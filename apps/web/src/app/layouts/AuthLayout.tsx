import { CircleCheck } from 'lucide-react'
import { Outlet } from 'react-router'
import logoIcon from '@/assets/logo-icon.svg'

const highlights = [
  'Real-time vehicle and driver availability',
  'Preventive service alerts from odometer readings',
  'Role-based dashboards for every team member',
]

/**
 * Two-column shell for every /auth/* screen (Figma "Login", "Auth — …" frames):
 * the dark FleetSync brand panel on the left, the screen's form on the right.
 * Child routes render in the <Outlet />.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-svh bg-card">
      {/* 600px panel at 1440px; narrower on small laptops, hidden on phones. */}
      <aside className="hidden w-[440px] shrink-0 flex-col overflow-hidden bg-foreground px-10 py-12 md:flex xl:w-[600px] xl:px-16 xl:py-14">
        <div className="flex items-center gap-3">
          <img src={logoIcon} width={40} height={40} alt="" />
          <span className="text-base font-semibold text-card">
            {/* The logo's green is used only here, inside the wordmark. */}
            Fleet<span className="text-logo-green">Sync</span>
          </span>
        </div>

        {/* Equal auto margins centre the pitch in the space below the logo. */}
        <div className="my-auto flex flex-col gap-4">
          <h2 className="max-w-[472px] text-4xl leading-[44px] font-bold tracking-[-0.72px] text-card">
            Every vehicle, trip and service — in one place.
          </h2>
          <p className="max-w-[440px] text-[15px] leading-6 text-faint">
            Plan trips, assign drivers, track maintenance and see fleet performance without spreadsheets or phone
            calls.
          </p>
          <ul className="flex flex-col gap-3 pt-4">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-2.5 text-sm text-line">
                <CircleCheck aria-hidden="true" className="size-[18px] text-line" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col items-center justify-center px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
