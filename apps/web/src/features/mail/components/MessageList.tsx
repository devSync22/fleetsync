import { useState } from 'react'
import { Paperclip, Search } from 'lucide-react'
import { FilterSelect } from '@/components/shared/FilterSelect'
import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { cn } from '@/lib/utils'
import { folders, matchesMail } from '../folders'
import type { MailFolder, MailMessage } from '../types'

type MessageListProps = {
  folder: MailFolder
  messages: MailMessage[]
  selectedId: string | null
  onSelect: (id: string) => void
  onFolderChange: (folder: MailFolder) => void
}

/** Middle column: search, folder title and the messages in it, newest first. */
export function MessageList({ folder, messages, selectedId, onSelect, onFolderChange }: MessageListProps) {
  const [query, setQuery] = useState('')
  const visible = messages.filter((m) => matchesMail(m, query))
  const unread = messages.filter((m) => m.unread).length
  const label = folders.find((f) => f.id === folder)?.label ?? ''

  return (
    <div className="flex h-full w-[300px] shrink-0 flex-col border-r xl:w-[340px]">
      <div className="flex flex-col gap-2.5 border-b px-3.5 pt-3.5 pb-3">
        <label className="flex items-center gap-2 rounded-lg bg-background px-2.5 py-2">
          <Search className="size-3.5 shrink-0 text-faint" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search mail"
            aria-label="Search mail"
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
          />
        </label>
        <div className="flex items-center gap-2">
          <h2 className="hidden flex-1 text-sm font-semibold xl:block">{label}</h2>
          <FilterSelect
            label="Folder"
            value={folder}
            onChange={onFolderChange}
            options={folders.map((f) => ({ id: f.id, label: f.label }))}
            className="w-[150px] xl:hidden"
          />
          <span className="ml-auto text-xs text-muted-foreground">
            {unread > 0 ? `${unread} unread` : `${messages.length} ${messages.length === 1 ? 'message' : 'messages'}`}
          </span>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto" aria-label={`${label} messages`}>
        {visible.length === 0 && (
          <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">
            {query.trim() ? `No mail matches “${query.trim()}”.` : `${label} is empty.`}
          </li>
        )}
        {visible.map((m) => {
          const selected = m.id === selectedId
          const person = folder === 'sent' || folder === 'drafts' ? { name: `To: ${m.to.join(', ')}`, initials: m.to[0]?.slice(0, 2).toUpperCase() ?? '' } : m.from
          return (
            <li key={m.id}>
              <button
                type="button"
                aria-current={selected ? 'true' : undefined}
                onClick={() => onSelect(m.id)}
                className={cn(
                  'flex w-full gap-2.5 border-b px-3.5 py-3 text-left transition-colors',
                  selected ? 'bg-brand-soft' : 'hover:bg-secondary/60',
                )}
              >
                <InitialsAvatar
                  initials={person.initials}
                  size={32}
                  tone={selected ? 'surface' : 'neutral'}
                  className={cn('text-[11px]', selected && 'text-brand')}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center gap-1.5">
                    <span className={cn('min-w-0 flex-1 truncate text-[13px]', m.unread ? 'font-semibold' : 'font-medium')}>
                      {person.name}
                    </span>
                    {m.attachments.length > 0 && <Paperclip className="size-3 shrink-0 text-faint" aria-label="Has attachments" />}
                    <span className={cn('shrink-0 text-[11px]', m.unread ? 'font-semibold text-brand' : 'text-faint')}>
                      {m.listLabel}
                    </span>
                  </span>
                  <span className={cn('truncate text-[13px]', m.unread && 'font-semibold')}>{m.subject}</span>
                  <span className="truncate text-xs text-muted-foreground">{m.body.replace(/\s+/g, ' ')}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
