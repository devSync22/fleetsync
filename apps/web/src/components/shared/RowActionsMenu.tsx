import type { LucideIcon } from 'lucide-react'
import { EllipsisVertical } from 'lucide-react'
import { Fragment } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type RowAction = {
  label: string
  /** Muted second line, e.g. "Pick a new role for this user". */
  description?: string
  icon: LucideIcon
  /** Danger actions (deactivate, delete) are red and sit after a divider. */
  tone?: 'default' | 'danger'
  onSelect: () => void
}

type RowActionsMenuProps = {
  /** Accessible name of the ⋯ button, e.g. "More actions for Nimal Perera". */
  label: string
  /** Optional header: who / what the menu acts on. */
  title?: string
  subtitle?: string
  actions: RowAction[]
}

/** The ⋯ button in a table's Actions column and its menu (Admin → User accounts / Row actions). */
export function RowActionsMenu({ label, title, subtitle, actions }: RowActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className="flex size-8 items-center justify-center rounded-md border border-line bg-card text-foreground transition-colors outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:border-foreground"
      >
        <EllipsisVertical className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5">
        {title && (
          <div className="px-2.5 pt-1.5 pb-2">
            <p className="text-xs font-semibold">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        {actions.map((action, i) => {
          const Icon = action.icon
          const danger = action.tone === 'danger'
          // A divider separates the first danger action from the safe ones above it.
          const needsDivider = danger && i > 0 && actions[i - 1].tone !== 'danger'
          return (
            <Fragment key={action.label}>
              {needsDivider && <DropdownMenuSeparator />}
              <DropdownMenuItem onSelect={action.onSelect} className="items-start gap-2.5 px-2.5 py-2">
                <Icon className={cn('mt-0.5 size-4', danger && 'text-danger')} aria-hidden />
                <span className="flex flex-col">
                  <span className={cn('text-[13px] font-medium', danger && 'text-danger')}>{action.label}</span>
                  {action.description && <span className="text-xs text-muted-foreground">{action.description}</span>}
                </span>
              </DropdownMenuItem>
            </Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
