import { Bell, Search } from 'lucide-react'

type TopBarProps = {
  userName: string
  userRole: string
  initials: string
  searchPlaceholder: string
  hasUnreadNotifications?: boolean
}

/** Style Guide → Top bar: search, notifications bell and the signed-in user. */
export function TopBar({ userName, userRole, initials, searchPlaceholder, hasUnreadNotifications = false }: TopBarProps) {
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

      <button
        type="button"
        aria-label={hasUnreadNotifications ? 'Notifications (unread)' : 'Notifications'}
        className="relative flex size-9 items-center justify-center rounded-full border hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Bell className="size-[18px]" strokeWidth={1.5} aria-hidden />
        {hasUnreadNotifications && <span className="absolute top-[7px] right-[6px] size-2 rounded-full bg-danger" />}
      </button>

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
