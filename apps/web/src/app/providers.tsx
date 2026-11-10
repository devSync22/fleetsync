import type { ReactNode } from 'react'

/** App-wide providers. AuthContext and similar global providers go here. */
export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</>
}
