export type MailFolder = 'inbox' | 'starred' | 'sent' | 'drafts' | 'trash'

export interface MailContact {
  name: string
  initials: string
  email: string
  role: string
}

export interface MailAttachment {
  name: string
  size: string
  kind: 'pdf' | 'xls' | 'doc'
}

export interface MailMessage {
  id: string
  /** Where it lives; "starred" is a flag, not a folder. */
  folder: Exclude<MailFolder, 'starred'>
  from: MailContact
  to: string[]
  subject: string
  body: string
  /** "10:58", "Yesterday", "18 Oct" — shown in the list. */
  listLabel: string
  /** "Today, 10:58" — shown above the message. */
  dateLabel: string
  unread: boolean
  starred: boolean
  attachments: MailAttachment[]
  /** Grey note under the header, e.g. how a group email was sent. */
  note: string | null
}

/** A person or group that can be picked in the To field. */
export interface Recipient {
  id: string
  name: string
  initials: string
  detail: string
  isGroup: boolean
}

export interface OutgoingMail {
  to: Recipient[]
  subject: string
  body: string
  attachments: MailAttachment[]
  separateEmails: boolean
  important: boolean
}
