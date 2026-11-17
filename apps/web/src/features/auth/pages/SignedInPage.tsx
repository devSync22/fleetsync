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

/**
 * Temporary landing page after sign-in, until the role dashboards exist
 * (coordinator-dashboard, owner-dashboard, …). It only confirms who is signed
 * in and offers sign-out. Not a Figma screen: replace it with the role layouts.
 */
export function SignedInPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    void navigate('/auth/login', { replace: true })
  }

  const roles = user?.roles.map((role) => roleLabels[role] ?? role).join(', ')

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <section className="flex w-full max-w-[400px] flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-semibold text-foreground">You’re signed in</h1>
        <p className="text-sm text-muted-foreground">
          {user?.fullName} · {roles}
          <br />
          <span className="font-mono text-[13px]">{user?.email}</span>
        </p>
        <p className="text-sm text-muted-foreground">Your dashboard is not available yet.</p>
        <Button variant="outline" className="w-full" onClick={() => void handleSignOut()}>
          <LogOut aria-hidden="true" />
          Sign out
        </Button>
      </section>
    </main>
  )
}
