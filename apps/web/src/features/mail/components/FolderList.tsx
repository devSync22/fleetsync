import { cn } from '@/lib/utils'
import { folderCount, folders } from '../folders'
import type { MailFolder, MailMessage } from '../types'

type FolderListProps = {
  messages: MailMessage[]
  active: MailFolder
  onSelect: (folder: MailFolder) => void
}

/** Left column: Inbox, Starred, Sent, Drafts, Trash. Hidden below xl, where the list header has a picker. */
export function FolderList({ messages, active, onSelect }: FolderListProps) {
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
    </nav>
  )
}
