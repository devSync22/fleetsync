import { cn } from '@/lib/utils'
import { folderCount, folders } from '../folders'
import type { MailFolder, MailMessage, Recipient } from '../types'

type FolderListProps = {
  messages: MailMessage[]
  active: MailFolder
  onSelect: (folder: MailFolder) => void
  /** Recipient groups listed under GROUPS (Admin frame); empty hides the section. */
  groups?: Recipient[]
  onPickGroup?: (group: Recipient) => void
}

/** Left column: Inbox, Starred, Sent, Drafts, Trash (and groups). Hidden below xl, where the list header has a picker. */
export function FolderList({ messages, active, onSelect, groups = [], onPickGroup }: FolderListProps) {
  return (
    <nav aria-label="Mail folders" className="hidden h-full w-[200px] shrink-0 flex-col gap-0.5 border-r px-2.5 pt-3.5 xl:flex">
      {folders.map(({ id, label, icon: Icon }) => {
        const selected = id === active
        const count = folderCount(messages, id)
        return (
          <button
            key={id}
            type="button"
            aria-current={selected ? 'page' : undefined}
            onClick={() => onSelect(id)}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
              selected ? 'bg-brand-soft font-semibold text-brand' : 'font-medium hover:bg-secondary',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">{label}</span>
            {count > 0 && (
              <span className={cn('text-xs font-semibold', selected ? 'text-brand' : 'text-muted-foreground')}>{count}</span>
            )}
          </button>
        )
      })}

      {groups.length > 0 && (
        <div className="flex flex-col gap-1 px-2.5 pt-5">
          <p className="pb-1 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground">GROUPS</p>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => onPickGroup?.(group)}
              title={`Write to ${group.name}`}
              className="flex items-center gap-2 py-0.5 text-left text-[13px] hover:text-brand"
            >
              {group.name}
              {/* "Group · 4 people" → 4 */}
              <span className="text-xs text-muted-foreground">{group.detail.match(/\d+/)?.[0]}</span>
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
