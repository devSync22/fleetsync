import type { ReactNode } from 'react'
import { Truck } from 'lucide-react'
import { InfoNote } from '@/components/shared/InfoNote'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { SectionCard } from '@/components/shared/SectionCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { TripDetail } from '../types'

type RowProps = {
  media: ReactNode
  title: string | null
  subtitle: string
  mono?: boolean
  canChange: boolean
}

function AssignmentRow({ media, title, subtitle, mono, canChange }: RowProps) {
  return (
    <li className="flex items-center gap-3 border-b px-5 py-3">
      {media}
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        {title ? (
          <p className={cn('text-sm font-medium', mono && 'font-mono')}>{title}</p>
        ) : (
          <p className="text-sm text-faint">Not assigned yet</p>
        )}
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {canChange && title && (
        // TODO: open the change-assignment flow once it is designed
        <Button type="button" variant="outline" size="sm">
          Change
        </Button>
      )}
    </li>
  )
}

const join = (...parts: (string | null | undefined)[]) => parts.filter(Boolean).join(' · ')

/** Vehicle, driver and mechanic on the trip, each changeable while the trip is still running. */
export function AssignmentCard({ trip }: { trip: TripDetail }) {
  const canChange = trip.status === 'assigned' || trip.status === 'in-progress'
  return (
    <SectionCard
      title="Assignment"
      subtitle="Change the vehicle, driver or mechanic if something goes wrong on the trip"
    >
      <ul>
        <AssignmentRow
          media={
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Truck className="size-[18px]" aria-hidden />
            </span>
          }
          title={trip.vehicle?.plate ?? null}
          subtitle={join('Vehicle', trip.vehicle?.description)}
          mono
          canChange={canChange}
        />
        <AssignmentRow
          media={<InitialsAvatar initials={trip.driver?.initials ?? '—'} />}
          title={trip.driver?.name ?? null}
          subtitle={join('Driver', trip.driver?.code, trip.driver?.licence)}
          canChange={canChange}
        />
        <AssignmentRow
          media={<InitialsAvatar initials={trip.mechanic?.initials ?? '—'} />}
          title={trip.mechanic?.name ?? null}
          subtitle={join('Mechanic', trip.mechanic?.code, trip.mechanic?.workshop)}
          canChange={canChange}
        />
      </ul>
      <InfoNote className="px-5 py-3">Only free vehicles and staff are offered. The new person gets a push notification.</InfoNote>
    </SectionCard>
  )
}
