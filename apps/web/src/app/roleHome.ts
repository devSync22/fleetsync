import type { AuthUser, UserRole } from '@/services/sessionApi'

/**
 * Where each role lands after sign-in. Roles without a web area yet (owner,
 * fleet administrator) and the mobile-only roles (driver, mechanic) go to "/",
 * the signed-in page, until their screens exist.
 */
const roleHomes: Partial<Record<UserRole, string>> = {
  coordinator: '/coordinator',
  customer: '/customer',
}

/** Readable role names, for the top bar and the signed-in page. */
export const roleLabels: Record<UserRole, string> = {
  owner: 'Fleet Owner',
  'fleet-administrator': 'Fleet Administrator',
  coordinator: 'Operational Coordinator',
  customer: 'Customer',
  driver: 'Driver',
  mechanic: 'Mechanic',
}

/** The user's home page. Each account has exactly one role (enforced by the API). */
export function homePathFor(user: AuthUser | null): string {
  const role = user?.roles[0]
  return (role && roleHomes[role]) ?? '/'
}

/** True when the user has at least one of `roles`. */
export function hasAnyRole(user: AuthUser | null, roles: readonly UserRole[]): boolean {
  return !!user && user.roles.some((role) => roles.includes(role))
}

/** "Nimal Perera" → "NP", for the avatar in the top bar. */
export function initialsOf(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}
