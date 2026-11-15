import type { Booking, ScheduledPerson, ScheduledVehicle } from '../types'

/**
 * "Coordinator — Availability" (141:4873) for Wed, 22 Oct 2026. The 8 vehicles, 5 drivers and 3 mechanics the
 * frame draws are copied from it; the rest are generated placeholders so the totals match its KPIs at
 * 08:00 – 14:00: 21 of 48 vehicles free, 21 busy, 6 in maintenance; 12 of 35 drivers and 4 of 7 mechanics free.
 */

const trip = (label: string, start: string, end: string): Booking => ({ kind: 'trip', label, start, end })
const service = (start: string, end: string): Booking => ({ kind: 'service', label: 'Service', start, end })

const frameVehicles: ScheduledVehicle[] = [
  { plate: 'WP LB-4521', model: 'Isuzu Forward', capacityTonnes: 16, bookings: [trip('TRP-2207', '07:00', '12:30')] },
  { plate: 'WP LC-1188', model: 'Tata 1615', capacityTonnes: 15, bookings: [trip('TRP-2211', '15:00', '18:30')] },
  { plate: 'NW LE-7730', model: 'Ashok Leyland Ecomet', capacityTonnes: 14, bookings: [service('08:00', '12:00')] },
  { plate: 'WP LD-3302', model: 'Mitsubishi Fuso Fighter', capacityTonnes: 12, bookings: [] },
  { plate: 'CP LF-2210', model: 'Ashok Leyland Ecomet', capacityTonnes: 14, bookings: [trip('TRP-2212', '06:30', '09:30')] },
  { plate: 'WP LA-9087', model: 'Isuzu NPR', capacityTonnes: 5, bookings: [] },
  { plate: 'WP LC-4410', model: 'Tata Ultra', capacityTonnes: 9, bookings: [trip('TRP-2213', '14:30', '19:00')] },
  { plate: 'SP LG-5521', model: 'Isuzu Forward', capacityTonnes: 12, bookings: [trip('TRP-2214', '10:00', '16:00')] },
]

const models: [string, number][] = [
  ['Isuzu Elf', 3.5],
  ['Tata Ace', 1],
  ['Mitsubishi Canter', 4.5],
  ['Isuzu Forward', 12],
  ['Tata 1615', 15],
  ['Ashok Leyland Dost', 1.5],
  ['Isuzu NPR', 5],
  ['Mitsubishi Fuso Fighter', 12],
]
const provinces = ['WP', 'CP', 'NW', 'SP', 'SG']
const freeTimes: [string, string][] = [['14:30', '18:00'], ['06:00', '07:45'], ['15:00', '19:30']]
const busyTimes: [string, string][] = [['07:30', '11:00'], ['09:00', '15:00'], ['11:30', '17:00'], ['06:30', '09:00'], ['12:30', '16:30']]
const serviceTimes: [string, string][] = [['08:00', '12:00'], ['10:00', '15:00'], ['06:00', '20:00']]

let nextTrip = 2215
const generatedVehicles: ScheduledVehicle[] = Array.from({ length: 40 }, (_, i) => {
  const [model, capacityTonnes] = models[i % models.length]
  const plate = `${provinces[i % provinces.length]} L${String.fromCharCode(65 + ((i * 7) % 26))}-${1100 + i * 197}`
  let bookings: Booking[]
  if (i < 17) {
    // free in 08:00 – 14:00 (some have trips outside it)
    bookings = i % 4 === 0 ? [] : [trip(`TRP-${nextTrip++}`, ...freeTimes[i % freeTimes.length])]
  } else if (i < 35) {
    bookings = [trip(`TRP-${nextTrip++}`, ...busyTimes[i % busyTimes.length])]
  } else {
    bookings = [service(...serviceTimes[i % serviceTimes.length])]
  }
  return { plate, model, capacityTonnes, bookings }
})

export const vehiclesMock: ScheduledVehicle[] = [...frameVehicles, ...generatedVehicles]

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const person = (name: string, detail: string, bookings: [string, string][] = []): ScheduledPerson => ({
  name,
  initials: initials(name),
  detail,
  bookings: bookings.map(([start, end]) => ({ start, end })),
})

const generatedDriverNames = [
  'Kasun Jayasinghe', 'Nuwan Herath', 'Chathura Samarasinghe', 'Lahiru Weerasinghe', 'Buddhika Herath',
  'Gayan Abeysekara', 'Isuru Karunaratne', 'Upul Senanayake', 'Janaka Wickramasinghe', 'Roshan Gunawardena',
  'Tharindu Wijesinghe', 'Dilshan Rathnayake', 'Kamal Pathirana', 'Lalith Gamage', 'Malinda Peiris',
  'Nimesh Cooray', 'Prasad Wimalasena', 'Ravindu Hettiarachchi', 'Sachith Munasinghe', 'Tharaka Alwis',
  'Viraj Kodikara', 'Amila Jayawardena', 'Harsha Liyanage', 'Chaminda Bandara', 'Sunil Jayasinghe',
  'Pradeep Kumara', 'Mahesh Dissanayake', 'Saman Ekanayake', 'Wasantha Ranasinghe', 'Yasith Premadasa',
]

export const driversMock: ScheduledPerson[] = [
  person('Ruwan Silva', 'Heavy · DRV-022'),
  person('Asanka Perera', 'Heavy · DRV-027'),
  person('Mohamed Rizwan', 'Heavy · DRV-031', [['15:00', '19:00']]),
  person('Dinesh Kumara', 'Light · DRV-009'),
  person('Saman Wijesinghe', 'Heavy · DRV-012', [['14:30', '18:00']]),
  // 23 busy in the window, then 7 free
  ...generatedDriverNames.map((name, i) =>
    person(
      name,
      `${i % 3 === 0 ? 'Light' : 'Heavy'} · DRV-${String(40 + i).padStart(3, '0')}`,
      i < 23 ? [busyTimes[i % busyTimes.length]] : i % 2 === 0 ? [] : [['16:00', '19:00']],
    ),
  ),
]

export const mechanicsMock: ScheduledPerson[] = [
  person('Chaminda Fernando', 'Heavy vehicle · Kurunegala'),
  person('Ishara Bandara', 'General · Colombo depot'),
  person('Sampath Kumara', 'Engine · Kurunegala', [['06:00', '10:00']]),
  person('Lahiru Gunasekara', 'Electrical · Colombo depot'),
  person('Mohan Rathnayake', 'Tyres · Kandy', [['15:00', '17:00']]),
  person('Dinesh Silva', 'Brakes · Kurunegala', [['09:00', '13:00']]),
  person('Kavinda Jayalath', 'Refrigeration · Colombo depot', [['11:00', '16:00']]),
]
