import { Box, CreditCard, FileText, LayoutGrid, MessageCircle, SquarePlus, User } from 'lucide-react'
import { Outlet } from 'react-router'
import { AppSidebar, type SidebarNavItem } from '@/components/shared/AppSidebar'
import { TopBar } from '@/components/shared/TopBar'
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell'

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', to: '/customer', icon: LayoutGrid, end: true },
  { label: 'My orders', to: '/customer/orders', icon: Box },
  { label: 'New order', to: '/customer/new-order', icon: SquarePlus },
  { label: 'Quotations', to: '/customer/quotations', icon: FileText },
  { label: 'Payments', to: '/customer/payments', icon: CreditCard },
  { label: 'Chat', to: '/customer/chat', icon: MessageCircle },
]

const footerItems: SidebarNavItem[] = [{ label: 'Profile', to: '/customer/profile', icon: User }]

// TODO: read from AuthContext once sign-in exists
const currentUser = { name: 'Dilini Perera', initials: 'DP', role: 'Customer · Lanka Tiles PLC' }

export function CustomerLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        roleLabel="Customer"
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
          searchPlaceholder="Search your orders…"
          notifications={<NotificationsBell />}
        />
        <main className="flex-1 px-8 pt-7 pb-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
