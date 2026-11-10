import { SectionCard } from '@/components/shared/SectionCard'
import type { TripDetail } from '../types'
import { KeyValueRow } from './KeyValueRow'

const km = (value: number) => `${value.toLocaleString('en-LK')} km`

export function OdometerCard({ trip }: { trip: TripDetail }) {
  const { startKm, endKm } = trip.odometer
  const awaitingEnd = startKm !== null && endKm === null && (trip.status === 'in-progress' || trip.status === 'completed')
  return (
    <SectionCard title="Odometer" subtitle="Entered by the driver in the Driver app">
      <dl className="flex flex-col gap-3.5 px-5 py-[18px]">
        <KeyValueRow label="Start" mono={startKm !== null}>
          {startKm === null ? '—' : km(startKm)}
        </KeyValueRow>
        <KeyValueRow label="End" mono={endKm !== null}>
          {endKm !== null ? km(endKm) : awaitingEnd ? 'Not entered yet' : '—'}
        </KeyValueRow>
        <KeyValueRow label="Distance driven" mono={startKm !== null && endKm !== null}>
          {startKm !== null && endKm !== null ? km(endKm - startKm) : '—'}
        </KeyValueRow>
      </dl>
    </SectionCard>
  )
}
