import { cn } from '@/lib/utils'
import { timelinePercent } from '../schedule'
import type { Booking, TimeWindow } from '../types'

const gridHours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00']

/** Hour labels above the timeline column. */
export function TimelineHours() {
  return (
    <div className="relative h-4 w-[400px] shrink-0 font-mono text-[11px]" aria-hidden>
      {gridHours.map((hour) => (
        <span key={hour} className="absolute top-0 -translate-x-1/2" style={{ left: `${timelinePercent(hour)}%` }}>
          {hour}
        </span>
      ))}
    </div>
  )
}

type TimelineProps = {
  bookings: Booking[]
  window: TimeWindow
}

/** One vehicle's day from 06:00 to 20:00: grid lines, the chosen window (shaded) and its bookings. */
export function Timeline({ bookings, window }: TimelineProps) {
  const windowLeft = timelinePercent(window.start)
  const windowWidth = timelinePercent(window.end) - windowLeft
  return (
    <div
      className="relative h-7 w-[400px] shrink-0 overflow-hidden rounded-md bg-secondary"
      role="img"
      aria-label={
        bookings.length === 0
          ? 'No bookings'
          : bookings.map((b) => `${b.label} ${b.start} to ${b.end}`).join(', ')
      }
    >
      {gridHours.map((hour) => (
        <span key={hour} className="absolute inset-y-0 w-px bg-border" style={{ left: `${timelinePercent(hour)}%` }} />
      ))}
      <span
        className="absolute inset-y-0 border-x-[1.5px] border-info bg-info-soft/70"
        style={{ left: `${windowLeft}%`, width: `${windowWidth}%` }}
      />
      {bookings.map((booking) => {
        const left = timelinePercent(booking.start)
        return (
          <span
            key={`${booking.label}-${booking.start}`}
            title={`${booking.label} · ${booking.start}–${booking.end}`}
            className={cn(
              'absolute top-[3px] flex h-[22px] items-center overflow-hidden rounded-[5px] border pl-2 text-[11px] font-medium whitespace-nowrap',
              booking.kind === 'trip'
                ? 'border-brand bg-brand-soft font-mono text-brand'
                : 'border-pending bg-pending-soft text-pending',
            )}
            style={{ left: `${left}%`, width: `${timelinePercent(booking.end) - left}%` }}
          >
            {booking.label}
          </span>
        )
      })}
    </div>
  )
}
