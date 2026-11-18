import type { MailContact, MailMessage, Recipient } from '../types'

/**
 * From "Admin — Mail / Inbox" (227:6969) and "Admin — Mail / Compose" (229:7069).
 * Only the holiday roster email is drawn in full; the other bodies are short placeholders.
 */

export const adminMe: MailContact = { name: 'Ayesha Silva', initials: 'AS', email: 'ayesha.s@fleetms.lk', role: 'Fleet Administrator' }

const nimal: MailContact = { name: 'Nimal Perera', initials: 'NP', email: 'nimal.p@fleetms.lk', role: 'Operational Coordinator' }
const sanduni: MailContact = { name: 'Sanduni Jayawardena', initials: 'SJ', email: 'sanduni.j@fleetms.lk', role: 'Coordinator · Colombo depot' }
const ravi: MailContact = { name: 'Ravi Fernando', initials: 'RF', email: 'ravi.f@fleetms.lk', role: 'Coordinator · Kurunegala' }

/** The administrator writes to coordinators, one by one or as a group. */
export const adminRecipientsMock: Recipient[] = [
  { id: 'nimal', name: 'Nimal Perera', initials: 'NP', detail: 'Coordinator · Colombo depot', isGroup: false },
  { id: 'sanduni', name: 'Sanduni Jayawardena', initials: 'SJ', detail: 'Coordinator · Colombo depot', isGroup: false },
  { id: 'ravi', name: 'Ravi Fernando', initials: 'RF', detail: 'Coordinator · Kurunegala', isGroup: false },
  { id: 'dilan', name: 'Dilan Wickramasinghe', initials: 'DW', detail: 'Coordinator · Galle depot', isGroup: false },
  { id: 'all-coordinators', name: 'All coordinators', initials: '', detail: 'Group · 4 people', isGroup: true },
  { id: 'colombo-depot', name: 'Colombo depot', initials: '', detail: 'Group · 2 people', isGroup: true },
]

export const adminMailMock: MailMessage[] = [
  {
    id: 'a1',
    folder: 'inbox',
    from: nimal,
    to: ['Ayesha Silva', 'Sanduni Jayawardena', 'Ravi Fernando'],
    subject: 'Re: Holiday roster for Deepavali week',
    body: [
      'Hi Ayesha,',
      '',
      'Thanks for the roster. Colombo depot can cover 21 and 22 Oct with four drivers on each day. Kasun and Saman are on leave on the 20th, so I have moved their trips to Wednesday.',
      '',
      'I have updated the attached sheet with our depot’s names. Please let me know if you need anything else.',
      '',
      'Thanks,',
      'Nimal',
      '',
      '— On 18 Oct, Ayesha Silva wrote to 4 coordinators:',
      'Please find the holiday roster for Deepavali week attached. Add your depot’s drivers by Monday.',
    ].join('\n'),
    listLabel: '10:42',
    dateLabel: 'Today, 10:42',
    unread: true,
    starred: false,
    attachments: [{ name: 'Holiday_roster_Colombo.xlsx', size: '38 KB', kind: 'xls' }],
    note: null,
  },
  {
    id: 'a2',
    folder: 'inbox',
    from: sanduni,
    to: ['Ayesha Silva'],
    subject: 'Licence renewals due in November',
    body: 'Hi Ayesha,\n\nThree drivers at Kandy depot have licences expiring in November. The list is attached so their renewals can be checked before then.\n\nSanduni',
    listLabel: '09:15',
    dateLabel: 'Today, 09:15',
    unread: true,
    starred: false,
    attachments: [{ name: 'Licence_renewals_Nov.pdf', size: '120 KB', kind: 'pdf' }],
    note: null,
  },
  {
    id: 'a3',
    folder: 'inbox',
    from: ravi,
    to: ['Ayesha Silva'],
    subject: 'Request: two more heavy trucks for Kurunegala',
    body: 'Hi Ayesha,\n\nHayleys Freight orders have doubled this month and we are short of heavy trucks at Kurunegala. Could two more be registered for our depot?\n\nRavi',
    listLabel: 'Yesterday',
    dateLabel: 'Yesterday, 16:20',
    unread: true,
    starred: false,
    attachments: [],
    note: null,
  },
  {
    id: 'a4',
    folder: 'inbox',
    from: nimal,
    to: ['Ayesha Silva'],
    subject: 'Weekly trip summary · 13–19 Oct',
    body: '186 trips completed, 7 cancelled. Report attached.\n\nNimal',
    listLabel: 'Sat',
    dateLabel: 'Sat, 18:05',
    unread: false,
    starred: false,
    attachments: [{ name: 'Trip_summary_13-19_Oct.pdf', size: '310 KB', kind: 'pdf' }],
    note: null,
  },
  {
    id: 'a5',
    folder: 'inbox',
    from: sanduni,
    to: ['Ayesha Silva'],
    subject: 'Re: New customer company approvals',
    body: 'Done, both companies are approved now.\n\nSanduni',
    listLabel: 'Fri',
    dateLabel: 'Fri, 11:40',
    unread: false,
    starred: false,
    attachments: [],
    note: null,
  },
  {
    id: 'a6',
    folder: 'sent',
    from: adminMe,
    to: ['All coordinators'],
    subject: 'Holiday roster for Deepavali week',
    body: 'Please find the holiday roster for Deepavali week attached. Add your depot’s drivers by Monday.\n\nThanks,\nAyesha',
    listLabel: '18 Oct',
    dateLabel: '18 Oct, 09:30',
    unread: false,
    starred: false,
    attachments: [{ name: 'Holiday_roster_Deepavali.xlsx', size: '34 KB', kind: 'xls' }],
    note: 'Sent to all coordinators as separate emails. Replies go only to you.',
  },
  {
    id: 'a7',
    folder: 'drafts',
    from: adminMe,
    to: ['Ravi Fernando'],
    subject: 'Re: Request: two more heavy trucks for Kurunegala',
    body: 'Hi Ravi,\n\nI can register two trucks next week. ',
    listLabel: 'Draft',
    dateLabel: 'Draft',
    unread: false,
    starred: false,
    attachments: [],
    note: null,
  },
]
