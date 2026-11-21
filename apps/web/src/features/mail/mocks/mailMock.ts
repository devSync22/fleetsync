import type { MailContact, MailMessage, Recipient } from '../types'

/**
 * From "Coordinator — Mail / Inbox" (229:10801); recipients from "Admin — Mail / Compose" (229:7069).
 * Only the fuel card email is drawn in full — the other bodies, Sent and Drafts are placeholders.
 */

export const me: MailContact = {
  name: 'Nimal Perera',
  initials: 'NP',
  email: 'nimal.p@fleetms.lk',
  role: 'Operational Coordinator',
}

const ayesha: MailContact = { name: 'Ayesha Silva', initials: 'AS', email: 'ayesha.s@fleetms.lk', role: 'Fleet Administrator' }
const sanduni: MailContact = { name: 'Sanduni Jayawardena', initials: 'SJ', email: 'sanduni.j@fleetms.lk', role: 'Coordinator · Colombo depot' }
const ravi: MailContact = { name: 'Ravi Fernando', initials: 'RF', email: 'ravi.f@fleetms.lk', role: 'Coordinator · Kurunegala' }

export const recipientsMock: Recipient[] = [
  { id: 'ayesha', name: 'Ayesha Silva', initials: 'AS', detail: 'Fleet Administrator', isGroup: false },
  { id: 'sanduni', name: 'Sanduni Jayawardena', initials: 'SJ', detail: 'Coordinator · Colombo depot', isGroup: false },
  { id: 'ravi', name: 'Ravi Fernando', initials: 'RF', detail: 'Coordinator · Kurunegala', isGroup: false },
  { id: 'dilan', name: 'Dilan Wickramasinghe', initials: 'DW', detail: 'Coordinator · Galle depot', isGroup: false },
  { id: 'all-coordinators', name: 'All coordinators', initials: '', detail: 'Group · 4 people', isGroup: true },
  { id: 'colombo-depot', name: 'Colombo depot', initials: '', detail: 'Group · 2 people', isGroup: true },
]

export const mailMock: MailMessage[] = [
  {
    id: 'm1',
    folder: 'inbox',
    from: ayesha,
    to: ['Nimal Perera'],
    subject: 'Fuel card policy from 1 November',
    body: [
      'Hi all,',
      '',
      'From 1 November every vehicle uses the new fuel card. Monthly limits per depot are in the attached sheet. Please make sure your drivers:',
      '•  collect their new card from the depot office by 31 October,',
      '•  keep fuel receipts with the trip and',
      '•  report a lost card to you on the same day.',
      '',
      'Reply to this email if anything is unclear.',
      '',
      'Thanks,',
      'Ayesha',
    ].join('\n'),
    listLabel: '10:58',
    dateLabel: 'Today, 10:58',
    unread: true,
    starred: false,
    attachments: [
      { name: 'Fuel_card_policy_Nov2026.pdf', size: '420 KB', kind: 'pdf' },
      { name: 'Card_limits_by_depot.xlsx', size: '26 KB', kind: 'xls' },
    ],
    note: 'Sent to all coordinators as separate emails. Replies go only to Ayesha.',
  },
  {
    id: 'm2',
    folder: 'inbox',
    from: ayesha,
    to: ['Nimal Perera'],
    subject: 'Holiday roster for Deepavali week',
    body: 'Hi Nimal,\n\nPlease find the holiday roster for Deepavali week attached. Check the Kurunegala drivers and let me know of any changes by Friday.\n\nThanks,\nAyesha',
    listLabel: '18 Oct',
    dateLabel: '18 Oct, 14:20',
    unread: false,
    starred: false,
    attachments: [{ name: 'Deepavali_roster.xlsx', size: '31 KB', kind: 'xls' }],
    note: null,
  },
  {
    id: 'm3',
    folder: 'inbox',
    from: sanduni,
    to: ['Nimal Perera'],
    subject: 'Swap: TRP-2214 driver on Friday',
    body: 'Hi Nimal,\n\nCould Colombo lend us a heavy-licence driver for TRP-2214 on Friday? Asanka is on leave and we have no one free with a heavy licence that morning.\n\nThanks,\nSanduni',
    listLabel: 'Yesterday',
    dateLabel: 'Yesterday, 16:05',
    unread: true,
    starred: false,
    attachments: [],
    note: null,
  },
  {
    id: 'm4',
    folder: 'inbox',
    from: ayesha,
    to: ['All coordinators'],
    subject: 'New customer companies approved',
    body: 'Hi all,\n\nBoth companies are approved and can now place orders: Nova Electricals (Pvt) Ltd and Southern Fisheries. Their first orders will come in as Pending review.\n\nThanks,\nAyesha',
    listLabel: 'Fri',
    dateLabel: 'Fri, 09:12',
    unread: false,
    starred: true,
    attachments: [],
    note: null,
  },
  {
    id: 'm5',
    folder: 'inbox',
    from: ravi,
    to: ['Nimal Perera'],
    subject: 'Re: Weekly trip summary',
    body: 'Thanks, Kurunegala numbers look right.\n\nRavi',
    listLabel: 'Thu',
    dateLabel: 'Thu, 17:40',
    unread: false,
    starred: false,
    attachments: [],
    note: null,
  },
  {
    id: 's1',
    folder: 'sent',
    from: me,
    to: ['Ravi Fernando'],
    subject: 'Weekly trip summary',
    body: 'Hi Ravi,\n\nAttached is the trip summary for last week. Please check the Kurunegala numbers.\n\nThanks,\nNimal',
    listLabel: 'Thu',
    dateLabel: 'Thu, 16:10',
    unread: false,
    starred: false,
    attachments: [{ name: 'Trip_summary_week42.pdf', size: '180 KB', kind: 'pdf' }],
    note: null,
  },
  {
    id: 'd1',
    folder: 'drafts',
    from: me,
    to: ['Sanduni Jayawardena'],
    subject: 'Re: Swap: TRP-2214 driver on Friday',
    body: 'Hi Sanduni,\n\nRuwan Silva is free on Friday morning',
    listLabel: 'Draft',
    dateLabel: 'Draft',
    unread: false,
    starred: false,
    attachments: [],
    note: null,
  },
]
