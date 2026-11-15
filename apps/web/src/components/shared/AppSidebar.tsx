import { LogOut, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router'
import logoIcon from '@/assets/logo-icon.svg'
import { cn } from '@/lib/utils'

export type SidebarNavItem = {
  label: string
  to: string
  icon: LucideIcon
  /** Match the path exactly (for the role's index route). */
  end?: boolean
}

type AppSidebarProps = {
  roleLabel: string
  items: SidebarNavItem[]
  footerItems: SidebarNavItem[]
  onLogout: () => void
}

const itemClasses = 'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-[9px] text-sm leading-[17px] font-medium transition-colors'

function SidebarLink({ item }: { item: SidebarNavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        cn(itemClasses, isActive ? 'bg-brand-soft font-semibold text-brand' : 'hover:bg-secondary')
      }
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      {item.label}
    </NavLink>
  )
}

/** Style Guide → role sidebar: brand, MENU items, and profile / logout pinned to the bottom. */
export function AppSidebar({ roleLabel, items, footerItems, onLogout }: AppSidebarProps) {
  return (
    <aside className="sticky top-0 flex h-screen w-62 shrink-0 flex-col gap-0.5 border-r bg-card px-3 py-4">
      <div className="flex items-center gap-2.5 px-2 pb-5">
        <img src={logoIcon} alt="" width={32} height={32} className="size-8 shrink-0" />
        <div className="flex flex-col whitespace-nowrap">
          <p className="text-sm leading-5 font-semibold">
            Fleet<span className="text-logo-green">Sync</span>
          </p>
          <p className="text-xs leading-4 text-muted-foreground">{roleLabel}</p>
        </div>
      </div>

      <p className="pb-1.5 pl-2.5 text-[11px] font-semibold tracking-[0.06em] text-faint">MENU</p>
      <nav aria-label="Main" className="flex flex-col gap-0.5">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>

      <div className="flex-1" />
      <div className="h-px w-full bg-border" />

      {footerItems.map((item) => (
        <SidebarLink key={item.to} item={item} />
      ))}
      <button type="button" onClick={onLogout} className={cn(itemClasses, 'hover:bg-secondary')}>
        <LogOut className="size-[18px] shrink-0" aria-hidden />
        Logout
      </button>
    </aside>
  )
}
