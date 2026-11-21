import type { ReactNode } from 'react'
import { Search } from 'lucide-react'

type TopBarProps = {
  userName: string
  userRole: string
  initials: string
  searchPlaceholder: string
  /** The notifications bell and its panel, supplied by the role layout. */
  notifications?: ReactNode
}

/** Style Guide → Top bar: search, notifications bell and the signed-in user. */
export function TopBar({ userName, userRole, initials, searchPlaceholder, notifications }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-6">
      <label className="flex w-80 items-center gap-2 rounded-lg bg-secondary px-3 py-[9px]">
        <Search className="size-4 shrink-0 text-faint" aria-hidden />
        <input
          type="search"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
        />
      </label>

      <div className="flex-1" />

      {notifications}

      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand">
          {initials}
        </div>
        <div className="flex flex-col whitespace-nowrap">
          <p className="text-[13px] leading-[18px] font-semibold">{userName}</p>
          <p className="text-xs leading-4 text-muted-foreground">{userRole}</p>
        </div>
      </div>
    </header>
  )
}
