import { ApiError } from '@/services/apiClient'
import { mailMock, me, recipientsMock } from '../mocks/mailMock'
import type { MailMessage, OutgoingMail, Recipient } from '../types'

/*
 * Mocked until the mail endpoints exist:
 *   getMailbox → apiClient.get<{ messages: MailMessage[]; recipients: Recipient[] }>('/mail')
 *   sendMail   → apiClient.post<MailMessage>('/mail/send', mail)
 *   saveDraft  → apiClient.post<MailMessage>('/mail/drafts', mail)
 * Reading, starring and deleting are kept in the page for now (apiClient.patch(`/mail/${id}`) later).
 * In dev, add `mock=empty` or `mock=error` to the URL query to preview those states.
 */

function scenario() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('mock') : null
}

export async function getMailbox(): Promise<{ messages: MailMessage[]; recipients: Recipient[] }> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  if (scenario() === 'error') {
    throw new ApiError('Check your connection and try again. If it keeps happening, contact support.')
  }
  return { messages: scenario() === 'empty' ? [] : mailMock, recipients: recipientsMock }
}

let nextId = 1

function outgoing(mail: OutgoingMail, folder: 'sent' | 'drafts'): MailMessage {
  const time = new Date().toTimeString().slice(0, 5)
  return {
    id: `${folder}-${nextId++}`,
    folder,
    from: me,
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

export async function sendMail(mail: OutgoingMail): Promise<MailMessage> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  if (mail.to.length === 0) throw new ApiError('Add at least one recipient.', 400)
  if (!mail.subject.trim() && !mail.body.trim()) throw new ApiError('Write a subject or a message before sending.', 400)
  return outgoing(mail, 'sent')
}

export async function saveDraft(mail: OutgoingMail): Promise<MailMessage> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return outgoing(mail, 'drafts')
}
