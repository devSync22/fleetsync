import type { ReactNode } from 'react'

type AuthFormHeaderProps = {
  /** Page title (Figma "Page title": 28 / Bold). */
  title: string
  /** Muted line under the title. */
  subtitle?: ReactNode
}

/** Title + subtitle block at the top of every auth form. */
export function AuthFormHeader({ title, subtitle }: AuthFormHeaderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="text-[28px] leading-9 font-bold tracking-[-0.28px] text-foreground">{title}</h1>
      {subtitle && <p className="text-sm leading-[22px] break-words text-muted-foreground">{subtitle}</p>}
    </div>
  )
}

/** Accent text-link style used for "Sign in", "Forgot password?", "terms of service"… */
export const authLinkClass = 'font-semibold text-brand no-underline hover:underline'

/** Small caps-style group heading ("Company", "Contact person", "Documents"). */
export function AuthSectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="pt-1 text-[11px] font-semibold tracking-[0.66px] text-muted-foreground uppercase">{children}</h2>
  )
}
