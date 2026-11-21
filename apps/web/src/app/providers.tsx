import type { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'

/** App-wide providers, wrapped around the router in main.tsx. */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
