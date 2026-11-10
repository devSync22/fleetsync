import type { Report, ReportExport, ReportType } from '../types'

/**
 * Trip summary for 1 – 18 Oct 2026 and the recent exports are from "Coordinator — Operational reports" (142:5026).
 * The frame only draws a trip summary: the other three report types are placeholders in the same shape.
 */

const days = Array.from({ length: 18 }, (_, i) => String(i + 1))

/** Per-day trips read off the frame's bars (peak 16 on 14 Oct; they add up to 186). */
const tripsPerDay = [9, 11, 8, 8, 12, 10, 13, 11, 9, 7, 9, 12, 14, 16, 13, 8, 6, 10]

export const reportContent: Record<ReportType, Omit<Report, 'title' | 'periodLabel' | 'subtitle' | 'type'>> = {
  'trip-summary': {
    stats: [
      { label: 'Trips completed', value: '186', note: '+12% vs Sep 1–18' },
      { label: 'Trips cancelled', value: '7', note: '4 by customers' },
      { label: 'Distance driven', value: '21,480 km', note: 'From odometer entries' },
      { label: 'Revenue', value: 'LKR 5.84M', note: '182 paid orders' },
    ],
    chart: { title: 'Trips completed per day', unit: 'trips', bars: days.map((label, i) => ({ label, value: tripsPerDay[i] })) },
    table: {
      columns: ['Vehicle type', 'Trips', 'Distance', 'Revenue (LKR)', 'Cancelled'],
      rows: [
        ['Heavy truck', '112', '15,920 km', '3,912,400', '3'],
        ['Medium truck', '48', '4,210 km', '1,388,600', '2'],
        ['Light truck', '26', '1,350 km', '539,000', '2'],
      ],
      total: ['Total', '186', '21,480 km', '5,840,000', '7'],
    },
  },
  // placeholder
  'vehicle-utilisation': {
    stats: [
      { label: 'Fleet utilisation', value: '68%', note: 'Days on trips ÷ available days' },
      { label: 'Days on trips', value: '587', note: 'Across 48 vehicles' },
      { label: 'Idle days', value: '211', note: 'Available, no trip' },
      { label: 'Service days', value: '66', note: '6 vehicles a day on average' },
    ],
    chart: {
      title: 'Vehicles on trips per day',
      unit: 'vehicles',
      bars: days.map((label, i) => ({ label, value: [31, 33, 29, 30, 34, 32, 36, 33, 30, 27, 31, 34, 37, 40, 36, 30, 26, 32][i] })),
    },
    table: {
      columns: ['Vehicle type', 'Vehicles', 'Days on trips', 'Idle days', 'Service days'],
      rows: [
        ['Heavy truck', '10', '142', '28', '10'],
        ['Medium truck', '16', '228', '52', '8'],
        ['Light truck', '22', '217', '131', '48'],
      ],
      total: ['Total', '48', '587', '211', '66'],
    },
  },
  // placeholder
  'driver-activity': {
    stats: [
      { label: 'Active drivers', value: '33', note: 'Of 35 on the roster' },
      { label: 'Trips per driver', value: '5.6', note: 'Average' },
      { label: 'Distance per driver', value: '651 km', note: 'Average' },
      { label: 'On-time starts', value: '94%', note: '11 late starts' },
    ],
    chart: {
      title: 'Trips per driver (top 10)',
      unit: 'trips',
      bars: ['RS', 'NH', 'AP', 'KJ', 'MR', 'SW', 'DK', 'KB', 'SJ', 'CF'].map((label, i) => ({ label, value: [11, 10, 10, 9, 9, 8, 8, 7, 7, 6][i] })),
    },
    table: {
      columns: ['Driver', 'Trips', 'Distance', 'Late starts', 'Cancelled'],
      rows: [
        ['Ruwan Silva', '11', '1,240 km', '0', '0'],
        ['Nuwan Herath', '10', '1,380 km', '1', '1'],
        ['Asanka Perera', '10', '920 km', '0', '0'],
        ['Kasun Jayasinghe', '9', '1,060 km', '2', '0'],
        ['Mohamed Rizwan', '9', '1,110 km', '0', '1'],
      ],
      total: null,
    },
  },
  // placeholder
  'orders-payments': {
    stats: [
      { label: 'Orders received', value: '214', note: '+9% vs Sep 1–18' },
      { label: 'Quotations sent', value: '201', note: 'Median 2 h 10 min to quote' },
      { label: 'Accepted', value: '189', note: '94% of quotations' },
      { label: 'Paid', value: 'LKR 5.84M', note: '182 orders · 4 awaiting' },
    ],
    chart: {
      title: 'Orders received per day',
      unit: 'orders',
      bars: days.map((label, i) => ({ label, value: [11, 13, 9, 10, 14, 12, 15, 13, 10, 8, 11, 14, 16, 18, 15, 10, 7, 12][i] })),
    },
    table: {
      columns: ['Status', 'Orders', 'Value (LKR)', 'Share'],
      rows: [
        ['Paid', '182', '5,840,000', '85%'],
        ['Awaiting payment', '4', '412,300', '2%'],
        ['Payment failed', '1', '48,500', '<1%'],
        ['Declined or expired', '12', '—', '6%'],
        ['Not quoted yet', '15', '—', '7%'],
      ],
      total: ['Total', '214', '6,300,800', '100%'],
    },
  },
}

export const recentExportsMock: ReportExport[] = [
  { id: 'e1', title: 'Trip summary · Sep 2026', format: 'PDF', by: 'Nimal Perera', dateLabel: '1 Oct' },
  { id: 'e2', title: 'Orders and payments · Sep 2026', format: 'Excel', by: 'Nimal Perera', dateLabel: '1 Oct' },
  { id: 'e3', title: 'Vehicle utilisation · Q3 2026', format: 'PDF', by: 'Idusara GT', dateLabel: '30 Sep' },
]
