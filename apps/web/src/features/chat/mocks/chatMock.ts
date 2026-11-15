import type { ChatRoom } from '../types'

/**
 * From the "Coordinator — Chat" frame (145:5122). Only the ORD-1041 conversation with Nuwan Herath is drawn in
 * full; the other rooms hold just the last message the frame shows. Customer contacts for ORD-1043, ORD-1047 and
 * ORD-1046, and Dilini's surname, are placeholders.
 */
export const chatRoomsMock: ChatRoom[] = [
  {
    orderId: 'ORD-1041',
    tripId: 'TRP-2203',
    customerName: 'Kandy Builders',
    route: 'Kandy → Colombo 03',
    status: 'in-progress',
    lastActivity: '10:02',
    unread: 0,
    people: [
      { role: 'customer', name: 'Ravindu Silva', initials: 'RS', detail: 'Customer · Kandy Builders', phone: '071 448 2210' },
      { role: 'driver', name: 'Nuwan Herath', initials: 'NH', detail: 'Driver · CP LF-2210', phone: '077 318 5521' },
      { role: 'mechanic', name: 'Sampath Kumara', initials: 'SK', detail: 'Mechanic · MEC-009', phone: null },
    ],
    messages: {
      driver: [
        { id: 'm1', from: 'me', day: 'Today', time: '08:12', text: 'Good morning Nuwan. Site crew unloads after 11:00, please call Ravindu at the gate when you reach.' },
        { id: 'm2', from: 'them', day: 'Today', time: '08:20', text: 'Ok sir, noted.' },
        { id: 'm3', from: 'them', day: 'Today', time: '08:41', text: 'Loaded all 230 bags at Kandy. Starting the trip now.' },
        { id: 'm4', from: 'me', day: 'Today', time: '08:44', text: 'Thanks. If anything happens with the truck, Sampath is the mechanic on this trip.', seen: true },
        { id: 'm5', from: 'them', day: 'Today', time: '10:02', text: 'Small queue at the weighbridge. Will message when I leave.' },
      ],
    },
  },
  {
    orderId: 'ORD-1045',
    tripId: 'TRP-2207',
    customerName: 'Hayleys Freight',
    route: 'Kurunegala → Colombo 10',
    status: 'assigned',
    lastActivity: '09:40',
    unread: 1,
    people: [
      { role: 'customer', name: 'Shehan Fonseka', initials: 'SF', detail: 'Customer · Hayleys Freight', phone: '077 902 3341' },
      { role: 'driver', name: 'Kasun Jayasinghe', initials: 'KJ', detail: 'Driver · WP LB-4521', phone: null },
      { role: 'mechanic', name: 'Chaminda Fernando', initials: 'CF', detail: 'Mechanic · MEC-005', phone: null },
    ],
    messages: {
      customer: [{ id: 'm6', from: 'them', day: 'Today', time: '09:40', text: 'Can the truck come at 06:30?' }],
    },
  },
  {
    orderId: 'ORD-1043',
    tripId: 'TRP-2201',
    customerName: 'Colombo Pharma',
    route: 'Colombo → Galle',
    status: 'in-progress',
    lastActivity: '09:25',
    unread: 0,
    people: [
      { role: 'customer', name: 'Nadeesha Gunawardena', initials: 'NG', detail: 'Customer · Colombo Pharma', phone: null },
      { role: 'driver', name: 'Ruwan Silva', initials: 'RS', detail: 'Driver · WP LD-3302', phone: null },
      { role: 'mechanic', name: 'Ishara Bandara', initials: 'IB', detail: 'Mechanic · MEC-012', phone: null },
    ],
    messages: {
      driver: [{ id: 'm7', from: 'me', day: 'Today', time: '09:25', text: 'Please keep the boxes upright.' }],
    },
  },
  {
    orderId: 'ORD-1047',
    tripId: 'TRP-2204',
    customerName: 'Southern Fisheries',
    route: 'Matara → Colombo 15',
    status: 'in-progress',
    lastActivity: '08:57',
    unread: 0,
    people: [
      { role: 'customer', name: 'Pradeep Senanayake', initials: 'PS', detail: 'Customer · Southern Fisheries', phone: null },
      { role: 'driver', name: 'Asanka Perera', initials: 'AP', detail: 'Driver · SP LG-5521', phone: null },
      { role: 'mechanic', name: 'Ishara Bandara', initials: 'IB', detail: 'Mechanic · MEC-012', phone: null },
    ],
    messages: {
      driver: [{ id: 'm8', from: 'them', day: 'Today', time: '08:57', text: 'Ice boxes loaded.' }],
    },
  },
  {
    orderId: 'ORD-1046',
    tripId: 'TRP-2205',
    customerName: 'Ceylon Agro',
    route: 'Dambulla → Kandy',
    status: 'in-progress',
    lastActivity: '08:50',
    unread: 0,
    people: [
      { role: 'customer', name: 'Thilini Ekanayake', initials: 'TE', detail: 'Customer · Ceylon Agro', phone: null },
      { role: 'driver', name: 'Mohamed Rizwan', initials: 'MR', detail: 'Driver · WP LC-1188', phone: null },
      { role: 'mechanic', name: 'Chaminda Fernando', initials: 'CF', detail: 'Mechanic · MEC-005', phone: null },
    ],
    messages: {
      driver: [{ id: 'm9', from: 'them', day: 'Today', time: '08:50', text: 'Waiting for the forklift.' }],
    },
  },
  {
    orderId: 'ORD-1049',
    tripId: null,
    customerName: 'Lanka Tiles PLC',
    route: 'Colombo → Kurunegala',
    status: 'pending-review',
    lastActivity: 'Yesterday',
    unread: 0,
    people: [
      { role: 'customer', name: 'Dilini Jayawardena', initials: 'DJ', detail: 'Customer · Lanka Tiles PLC', phone: null },
    ],
    messages: {
      customer: [{ id: 'm10', from: 'them', day: 'Yesterday', time: '17:30', text: 'When will I get the quote?' }],
    },
  },
]
