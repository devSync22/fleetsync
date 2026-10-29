import {
  Activity,
  Box,
  ChartColumn,
  LayoutGrid,
  Mail,
  MessageCircle,
  Truck,
  User,
} from 'lucide-react'
import { Outlet } from 'react-router'
import { AppSidebar, type SidebarNavItem } from '@/components/shared/AppSidebar'
import { TopBar } from '@/components/shared/TopBar'

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', to: '/coordinator', icon: LayoutGrid, end: true },
  { label: 'Submitted orders', to: '/coordinator/orders', icon: Box },
  { label: 'Trips', to: '/coordinator/trips', icon: Activity },
  { label: 'Availability', to: '/coordinator/availability', icon: Truck },
  { label: 'Chat', to: '/coordinator/chat', icon: MessageCircle },
  { label: 'Mail', to: '/coordinator/mail', icon: Mail },
  { label: 'Reports', to: '/coordinator/reports', icon: ChartColumn },
]

const footerItems: SidebarNavItem[] = [{ label: 'Profile', to: '/coordinator/profile', icon: User }]

// TODO: read from AuthContext once sign-in exists
const currentUser = { name: 'Nimal Perera', initials: 'NP', role: 'Operational Coordinator' }

export function CoordinatorLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        roleLabel="Coordinator"
        items={navItems}
        footerItems={footerItems}
        onLogout={() => {
          // TODO: sign out through AuthContext
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          userName={currentUser.name}
          userRole={currentUser.role}
          initials={currentUser.initials}
          searchPlaceholder="Search orders, trips, vehicles…"
          hasUnreadNotifications
        />
        <main className="flex-1 px-8 pt-7 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
