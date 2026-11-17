import {
  deliverByText,
  formatDayMonth,
  formatNumber,
  fullAddress,
  handlingText,
  parseDate,
  parseNumber,
} from '../newOrderFormat'
import { packingTypes } from '../newOrderOptions'
import type { CustomerOrderDetail, NewOrderDraft } from '../types'
import { MOCK_TODAY, type MyOrderRecord } from './myOrdersMock'

// TODO: read the signed-in customer's name from AuthContext once sign-in exists
const SUBMITTED_BY = 'Dilini Perera'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * What the backend will hold after a customer submits a draft: the My orders row and the
 * Order details record, both "pending review". Mock only — the real endpoint builds these.
 */
export function buildSubmittedOrder(orderId: string, draft: NewOrderDraft, now: Date) {
  const { pickup, destination, cargo } = draft
  const placedLabel = `Today, ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const weightKg = parseNumber(cargo.weightKg)
  const tonnes = formatNumber(weightKg / 1000)
  const pickupDay = parseDate(pickup.date)
  const pickupWhen = pickupDay ? `${formatDayMonth(pickupDay)}, ${pickup.time}` : '—'
  const packing = cargo.packing ? packingTypes[cargo.packing] : null

  const row: MyOrderRecord = {
    orderId,
    // Placed "today" in the mock calendar, so it lands at the top of My orders.
    placedOn: MOCK_TODAY,
    placedLabel,
    route: `${pickup.city} → ${destination.city}`,
    cargo: `${cargo.cargoType} · ${tonnes} t`,
    pickupLabel: pickupWhen,
    amount: null,
    status: 'pending-review',
  }

  const detail: CustomerOrderDetail = {
    orderId,
    status: 'pending-review',
    placedLabel,
    route: row.route,
    cargoSummary: `${tonnes} t ${cargo.cargoType.toLowerCase()}`,
    amount: null,
    progress: [
      { id: 'submitted', label: 'Submitted', state: 'done', caption: placedLabel },
      { id: 'quoted', label: 'Quoted', state: 'current', caption: 'Awaiting quote' },
      { id: 'paid', label: 'Paid', state: 'upcoming', caption: '—' },
      { id: 'trip-scheduled', label: 'Trip scheduled', state: 'upcoming', caption: '—' },
      { id: 'in-progress', label: 'In progress', state: 'upcoming', caption: '—' },
      { id: 'completed', label: 'Completed', state: 'upcoming', caption: '—' },
    ],
    trip: null,
    updates: [{ title: 'Order submitted', detail: `By ${SUBMITTED_BY}`, when: placedLabel, tone: 'neutral' }],
    pickup: {
      address: fullAddress(pickup.address, pickup.city),
      when: pickupWhen,
      contact: `${pickup.contactName.trim()} · ${pickup.contactPhone.trim()}`,
    },
    destination: {
      address: fullAddress(destination.address, destination.city),
      when: deliverByText(destination, pickup.date, true) || 'Any time',
      contact: `${destination.receiverName.trim()} · ${destination.receiverPhone.trim()}`,
    },
    cargo: {
      type: cargo.cargoType,
      weightKg,
      unitsLabel: packing ? packing.unit[1].replace(/^\w/, (c) => c.toUpperCase()) : 'Units',
      unitsCount: parseNumber(cargo.quantity),
      handling: handlingText(cargo.handling),
    },
    payment: null,
  }

  return { row, detail }
}
