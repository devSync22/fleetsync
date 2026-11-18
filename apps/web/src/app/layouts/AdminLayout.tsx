import {
  History,
  LayoutGrid,
  Mail,
  SlidersHorizontal,
  SquareCheckBig,
  Truck,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { Outlet } from 'react-router'
import { AppSidebar, type SidebarNavItem } from '@/components/shared/AppSidebar'
import { TopBar } from '@/components/shared/TopBar'
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell'

/** Fleet Administrator sidebar, in the order of the "Admin — Dashboard" frame (37:478). */
const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutGrid, end: true },
  { label: 'User accounts', to: '/admin/users', icon: Users },
  { label: 'Applications', to: '/admin/applications', icon: UserPlus },
  { label: 'Vehicles', to: '/admin/vehicles', icon: Truck },
  { label: 'Reference data', to: '/admin/reference-data', icon: SlidersHorizontal },
  { label: 'Change approvals', to: '/admin/change-approvals', icon: SquareCheckBig },
  { label: 'Mail', to: '/admin/mail', icon: Mail },
  { label: 'Audit log', to: '/admin/audit-log', icon: History },
]

const footerItems: SidebarNavItem[] = [{ label: 'Profile', to: '/admin/profile', icon: User }]

// TODO: read from AuthContext once the role layouts use the signed-in user (KAN-229)
const currentUser = { name: 'Ayesha Silva', initials: 'AS', role: 'Fleet Administrator' }

/** Shell for every /admin/* page: Administrator sidebar, top bar with the admin's notifications. */
export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        roleLabel="Administrator"
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
          searchPlaceholder="Search users, vehicles, audit records…"
          notifications={<NotificationsBell role="admin" />}
        />
        <main className="flex-1 px-8 pt-7 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
