import { LogOut } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

/** Readable role names for the welcome line. */
const roleLabels: Record<string, string> = {
  owner: 'Fleet Owner',
  'fleet-administrator': 'Fleet Administrator',
  coordinator: 'Operational Coordinator',
  customer: 'Customer',
  driver: 'Driver',
  mechanic: 'Mechanic',
}

/** Roles that use the mobile app instead of the website. */
const mobileRoles = new Set(['driver', 'mechanic'])

/**
 * Landing page for roles that have no web area yet (Fleet Owner, Fleet
 * Administrator) and for drivers and mechanics, who use the mobile app.
 * Coordinators and customers never see it: "/" sends them to their own area.
 * It only confirms who is signed in and offers sign-out. Not a Figma screen.
 */
export function SignedInPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    void navigate('/auth/login', { replace: true })
  }

  const roles = user?.roles.map((role) => roleLabels[role] ?? role).join(', ')
  const usesMobileApp = user?.roles.some((role) => mobileRoles.has(role)) ?? false

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <section className="flex w-full max-w-[400px] flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-foreground">You’re signed in</h1>
        <p className="text-sm text-muted-foreground">
          {user?.fullName} · {roles}
          <br />
          <span className="font-mono text-[13px]">{user?.email}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          {usesMobileApp
            ? 'Drivers and mechanics use the FleetSync mobile app. Sign in there to see your trips and jobs.'
            : 'Your dashboard is not available yet.'}
        </p>
        <Button variant="outline" className="w-full" onClick={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </section>
    </main>
  )
}
