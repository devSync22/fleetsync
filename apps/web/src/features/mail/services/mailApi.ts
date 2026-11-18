import { ApiError } from '@/services/apiClient'
import { adminMailMock, adminMe, adminRecipientsMock } from '../mocks/adminMailMock'
import { mailMock, me, recipientsMock } from '../mocks/mailMock'
import type { MailContact, MailMessage, MailRole, OutgoingMail, Recipient } from '../types'

/*
 * Mocked until the mail endpoints exist:
 *   getMailbox → apiClient.get<{ messages: MailMessage[]; recipients: Recipient[] }>('/mail')
 *   sendMail   → apiClient.post<MailMessage>('/mail/send', mail)
 *   saveDraft  → apiClient.post<MailMessage>('/mail/drafts', mail)
 * Reading, starring and deleting are kept in the page for now (apiClient.patch(`/mail/${id}`) later).
 * `role` picks the mock mailbox; the real endpoints use the signed-in user, so it goes away then.
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */

function scenario() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
}

const mailboxes: Record<MailRole, { me: MailContact; messages: MailMessage[]; recipients: Recipient[] }> = {
  coordinator: { me, messages: mailMock, recipients: recipientsMock },
  admin: { me: adminMe, messages: adminMailMock, recipients: adminRecipientsMock },
}

export type Mailbox = { me: MailContact; messages: MailMessage[]; recipients: Recipient[] }

export async function getMailbox(role: MailRole): Promise<Mailbox> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  if (scenario() === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  const box = mailboxes[role]
  return { me: box.me, messages: scenario() === 'empty' ? [] : box.messages, recipients: box.recipients }
}

let nextId = 1

function outgoing(role: MailRole, mail: OutgoingMail, folder: 'sent' | 'drafts'): MailMessage {
  const time = new Date().toTimeString().slice(0, 5)
  return {
    id: `${folder}-${nextId++}`,
    folder,
    from: mailboxes[role].me,
    to: mail.to.map((r) => r.name),
    subject: mail.subject.trim() || '(no subject)',
    body: mail.body,
    listLabel: folder === 'drafts' ? 'Draft' : time,
    dateLabel: folder === 'drafts' ? 'Draft' : `Today, ${time}`,
    unread: false,
    starred: mail.important,
    attachments: mail.attachments,
    note: mail.separateEmails && mail.to.length > 1 ? 'Sent as separate emails. Replies come only to you.' : null,
  }
}

export async function sendMail(role: MailRole, mail: OutgoingMail): Promise<MailMessage> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (mail.to.length === 0) throw new ApiError('Add at least one recipient.', 400)
  if (!mail.subject.trim() && !mail.body.trim()) throw new ApiError('Write a subject or a message before sending.', 400)
  return outgoing(role, mail, 'sent')
}

export async function saveDraft(role: MailRole, mail: OutgoingMail): Promise<MailMessage> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return outgoing(role, mail, 'drafts')
}
