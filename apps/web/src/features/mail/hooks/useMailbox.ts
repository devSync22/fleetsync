import { useCallback, useMemo, useState } from 'react'
import { useAction } from '@/hooks/useAction'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getMailbox, saveDraft, sendMail } from '../services/mailApi'
import type { MailMessage, OutgoingMail } from '../types'

type Change = Partial<Pick<MailMessage, 'unread' | 'starred' | 'folder'>>

/** Loads the mailbox and keeps this session's reads, stars, deletes, sends and drafts on top of it. */
export function useMailbox() {
  const { state, retry } = useAsyncData(getMailbox)
  const [changes, setChanges] = useState<Record<string, Change>>({})
  const [added, setAdded] = useState<MailMessage[]>([])
  const send = useAction(sendMail)
  const draft = useAction(saveDraft)

  const messages = useMemo<MailMessage[] | null>(() => {
    if (state.status !== 'success') return null
    return [...added, ...state.data.messages].map((m) => ({ ...m, ...changes[m.id] }))
  }, [state, added, changes])

  const change = useCallback((id: string, next: Change) => {
    setChanges((previous) => ({ ...previous, [id]: { ...previous[id], ...next } }))
  }, [])

  const markRead = useCallback((id: string) => change(id, { unread: false }), [change])
  const setStarred = useCallback((id: string, starred: boolean) => change(id, { starred }), [change])
  const moveToTrash = useCallback((id: string) => change(id, { folder: 'trash' }), [change])

  /** Resolves to the new message, or undefined when it failed (see `sendError`). */
  const sendMessage = useCallback(
    async (mail: OutgoingMail) => {
      const message = await send.run(mail)
      if (message) setAdded((previous) => [message, ...previous])
      return message
    },
    [send],
  )

  const saveMessageDraft = useCallback(
    async (mail: OutgoingMail) => {
      const message = await draft.run(mail)
      if (message) setAdded((previous) => [message, ...previous])
      return message
    },
    [draft],
  )

  return {
    state,
    retry,
    messages,
    recipients: state.status === 'success' ? state.data.recipients : [],
    markRead,
    setStarred,
    moveToTrash,
    sendMessage,
    saveMessageDraft,
    sending: send.pending || draft.pending,
    sendError: send.error ?? draft.error,
  }
}
