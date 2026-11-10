import { Link } from 'react-router'

type CurrentTripLinkProps = {
  tripId: string | null
  status: string
}

/** "On TRP-…" / "Assigned to TRP-…", linking to the trip; a dash when idle. */
export function CurrentTripLink({ tripId, status }: CurrentTripLinkProps) {
  if (!tripId) return <span className="text-faint">—</span>
  return (
    <span className="whitespace-nowrap text-muted-foreground">
      {status === 'on-trip' ? 'On ' : 'Assigned to '}
      <Link to={`/coordinator/trips/${tripId}`} className="font-mono font-medium text-brand hover:underline">
        {tripId}
      </Link>
    </span>
  )
}
