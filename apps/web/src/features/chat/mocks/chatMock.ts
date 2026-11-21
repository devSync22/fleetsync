import type { DomainStatus } from '@/components/shared/statusTones'
import type { ChatMessage, ChatPerson } from '../types'

/*
 * From "Coordinator — Chat" (145:5122) and "Customer — Chat" (164:7038), as one dataset so both views agree.
 * The frames are snapshots at different times, so ORD-1049 follows the later Customer frame (quoted).
 * Customer contacts for ORD-1043, ORD-1047 and ORD-1046 are placeholders.
 */

/** ISO time `daysAgo` days before today at `hhmm`, so "Today" and "Yesterday" stay true. */
function at(daysAgo: number, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(h, m, 0, 0)
  return date.toISOString()
}

const people: ChatPerson[] = [
  { id: 'co-nimal', role: 'coordinator', name: 'Nimal Perera', initials: 'NP', detail: 'Coordinator', phone: null },
  { id: 'cu-ravindu', role: 'customer', name: 'Ravindu Silva', initials: 'RS', detail: 'Customer · Kandy Builders', phone: '071 448 2210' },
  { id: 'dr-nuwan', role: 'driver', name: 'Nuwan Herath', initials: 'NH', detail: 'Driver · CP LF-2210', phone: '077 318 5521' },
  { id: 'me-sampath', role: 'mechanic', name: 'Sampath Kumara', initials: 'SK', detail: 'Mechanic · MEC-009', phone: null },
  { id: 'cu-shehan', role: 'customer', name: 'Shehan Fonseka', initials: 'SF', detail: 'Customer · Hayleys Freight', phone: '077 902 3341' },
  { id: 'dr-kasun', role: 'driver', name: 'Kasun Jayasinghe', initials: 'KJ', detail: 'Driver · WP LB-4521', phone: null },
  { id: 'me-chaminda', role: 'mechanic', name: 'Chaminda Fernando', initials: 'CF', detail: 'Mechanic · MEC-005', phone: null },
  { id: 'cu-nadeesha', role: 'customer', name: 'Nadeesha Gunawardena', initials: 'NG', detail: 'Customer · Colombo Pharma', phone: null },
  { id: 'dr-ruwan', role: 'driver', name: 'Ruwan Silva', initials: 'RS', detail: 'Driver · WP LD-3302', phone: null },
  { id: 'me-ishara', role: 'mechanic', name: 'Ishara Bandara', initials: 'IB', detail: 'Mechanic · MEC-012', phone: null },
  { id: 'cu-pradeep', role: 'customer', name: 'Pradeep Senanayake', initials: 'PS', detail: 'Customer · Southern Fisheries', phone: null },
  { id: 'dr-asanka', role: 'driver', name: 'Asanka Perera', initials: 'AP', detail: 'Driver · SP LG-5521', phone: null },
  { id: 'cu-thilini', role: 'customer', name: 'Thilini Ekanayake', initials: 'TE', detail: 'Customer · Ceylon Agro', phone: null },
  { id: 'dr-rizwan', role: 'driver', name: 'Mohamed Rizwan', initials: 'MR', detail: 'Driver · WP LC-1188', phone: null },
  { id: 'cu-dilini', role: 'customer', name: 'Dilini Perera', initials: 'DP', detail: 'Customer · Lanka Tiles PLC', phone: null },
  { id: 'dr-saman', role: 'driver', name: 'Saman Wijesinghe', initials: 'SW', detail: 'Driver · WP LC-4410', phone: null },
]

export const chatPeopleMock: Record<string, ChatPerson> = Object.fromEntries(people.map((p) => [p.id, p]))

export interface MockRoom {
  orderId: string
  tripId: string | null
  customerName: string
  route: string
  status: DomainStatus
  statusNote?: string
  memberIds: string[]
}

export const chatRoomsMock: MockRoom[] = [
  { orderId: 'ORD-1041', tripId: 'TRP-2203', customerName: 'Kandy Builders', route: 'Kandy → Colombo 03', status: 'in-progress', memberIds: ['co-nimal', 'cu-ravindu', 'dr-nuwan', 'me-sampath'] },
  { orderId: 'ORD-1045', tripId: 'TRP-2207', customerName: 'Hayleys Freight', route: 'Kurunegala → Colombo 10', status: 'assigned', memberIds: ['co-nimal', 'cu-shehan', 'dr-kasun', 'me-chaminda'] },
  { orderId: 'ORD-1043', tripId: 'TRP-2201', customerName: 'Colombo Pharma', route: 'Colombo → Galle', status: 'in-progress', memberIds: ['co-nimal', 'cu-nadeesha', 'dr-ruwan', 'me-ishara'] },
  { orderId: 'ORD-1047', tripId: 'TRP-2204', customerName: 'Southern Fisheries', route: 'Matara → Colombo 15', status: 'in-progress', memberIds: ['co-nimal', 'cu-pradeep', 'dr-asanka', 'me-ishara'] },
  { orderId: 'ORD-1046', tripId: 'TRP-2205', customerName: 'Ceylon Agro', route: 'Dambulla → Kandy', status: 'in-progress', memberIds: ['co-nimal', 'cu-thilini', 'dr-rizwan', 'me-chaminda'] },
  { orderId: 'ORD-1040', tripId: 'TRP-2202', customerName: 'Lanka Tiles PLC', route: 'Colombo → Kurunegala', status: 'trip-in-progress', statusNote: 'Trip in progress · started 08:15', memberIds: ['co-nimal', 'cu-dilini', 'dr-saman'] },
  { orderId: 'ORD-1049', tripId: null, customerName: 'Lanka Tiles PLC', route: 'Nugegoda → Kurunegala', status: 'quoted', statusNote: 'Quoted · valid until 20 Oct, 18:00', memberIds: ['co-nimal', 'cu-dilini'] },
  { orderId: 'ORD-1051', tripId: null, customerName: 'Lanka Tiles PLC', route: 'Colombo 15 → Matara', status: 'pending-review', statusNote: 'Waiting for a fare quotation', memberIds: ['co-nimal', 'cu-dilini'] },
  { orderId: 'ORD-1035', tripId: 'TRP-2188', customerName: 'Lanka Tiles PLC', route: 'Colombo → Galle', status: 'completed', statusNote: 'Completed on 12 Oct', memberIds: ['co-nimal', 'cu-dilini'] },
]

export type MockMessage = ChatMessage & { orderId: string; toId: string }

const msg = (orderId: string, senderId: string, toId: string, sentAt: string, text: string, status: ChatMessage['status'] = 'seen'): MockMessage => ({
  id: `${orderId}-${senderId}-${sentAt}`,
  orderId,
  senderId,
  toId,
  sentAt,
  text,
  status,
})

export const chatMessagesMock: MockMessage[] = [
  // Coordinator frame — ORD-1041, Nimal ↔ Nuwan, drawn in full
  msg('ORD-1041', 'co-nimal', 'dr-nuwan', at(0, '08:12'), 'Good morning Nuwan. Site crew unloads after 11:00, please call Ravindu at the gate when you reach.'),
  msg('ORD-1041', 'dr-nuwan', 'co-nimal', at(0, '08:20'), 'Ok sir, noted.'),
  msg('ORD-1041', 'dr-nuwan', 'co-nimal', at(0, '08:41'), 'Loaded all 230 bags at Kandy. Starting the trip now.'),
  msg('ORD-1041', 'co-nimal', 'dr-nuwan', at(0, '08:44'), 'Thanks. If anything happens with the truck, Sampath is the mechanic on this trip.'),
  msg('ORD-1041', 'dr-nuwan', 'co-nimal', at(0, '10:02'), 'Small queue at the weighbridge. Will message when I leave.'),
  msg('ORD-1045', 'cu-shehan', 'co-nimal', at(0, '09:40'), 'Can the truck come at 06:30?', 'sent'),
  msg('ORD-1043', 'co-nimal', 'dr-ruwan', at(0, '09:25'), 'Please keep the boxes upright.', 'sent'),
  msg('ORD-1047', 'dr-asanka', 'co-nimal', at(0, '08:57'), 'Ice boxes loaded.'),
  msg('ORD-1046', 'dr-rizwan', 'co-nimal', at(0, '08:50'), 'Waiting for the forklift.'),
  // Customer frame — Dilini ↔ Nimal
  msg('ORD-1040', 'cu-dilini', 'co-nimal', at(0, '08:02'), 'Good morning. Is our tiles order still leaving at 8?'),
  msg('ORD-1040', 'co-nimal', 'cu-dilini', at(0, '08:20'), 'Yes. Saman started the trip at 08:15 with WP LC-4410.'),
  msg('ORD-1040', 'cu-dilini', 'co-nimal', at(0, '09:55'), 'Great. Chamara will receive it at the showroom in Kurunegala.'),
  msg('ORD-1040', 'co-nimal', 'cu-dilini', at(0, '10:12'), 'Noted. The driver will call Chamara when he reaches the showroom gate.'),
  msg('ORD-1040', 'cu-dilini', 'co-nimal', at(0, '10:13'), 'Thank you!'),
  msg('ORD-1049', 'cu-dilini', 'co-nimal', at(1, '17:30'), 'When will I get the quote?'),
  msg('ORD-1049', 'co-nimal', 'cu-dilini', at(0, '11:20'), 'Quotation sent, valid until 20 Oct, 18:00.', 'sent'),
  msg('ORD-1051', 'cu-dilini', 'co-nimal', at(0, '09:12'), 'Order submitted.', 'sent'),
  msg('ORD-1035', 'co-nimal', 'cu-dilini', new Date(2026, 9, 12, 15, 40).toISOString(), 'Delivered and signed for.'),
]
