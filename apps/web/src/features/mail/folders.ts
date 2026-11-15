import { FileText, Inbox, Send, Star, Trash2, type LucideIcon } from 'lucide-react'
import type { MailFolder, MailMessage } from './types'

export const folders: { id: MailFolder; label: string; icon: LucideIcon }[] = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

export function inFolder(messages: MailMessage[], folder: MailFolder) {
  if (folder === 'starred') return messages.filter((m) => m.starred && m.folder !== 'trash')
  return messages.filter((m) => m.folder === folder)
}

/** Inbox shows unread, Drafts shows how many; the rest show nothing. */
export function folderCount(messages: MailMessage[], folder: MailFolder) {
  if (folder === 'inbox') return inFolder(messages, 'inbox').filter((m) => m.unread).length
  if (folder === 'drafts') return inFolder(messages, 'drafts').length
  return 0
}

export function matchesMail(message: MailMessage, query: string) {
  const needle = query.trim().toLowerCase()
  return (
    !needle ||
    [message.subject, message.from.name, message.body, ...message.to].some((f) => f.toLowerCase().includes(needle))
  )
}
