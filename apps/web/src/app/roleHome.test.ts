import { describe, expect, it } from 'vitest'
import type { AuthUser, UserRole } from '@/services/sessionApi'
import { hasAnyRole, homePathFor, initialsOf } from './roleHome'

/** A signed-in user with one role, as the API returns it. */
function userWith(role: UserRole): AuthUser {
  return { id: '1', email: `${role}@fleetsync.local`, fullName: 'Nimal Perera', roles: [role] }
}

describe('homePathFor', () => {
  it('sends coordinators and customers to their own area', () => {
    expect(homePathFor(userWith('coordinator'))).toBe('/coordinator')
    expect(homePathFor(userWith('customer'))).toBe('/customer')
  })

  it('sends roles without a web area to the signed-in page', () => {
    for (const role of ['owner', 'fleet-administrator', 'driver', 'mechanic'] as const) {
      expect(homePathFor(userWith(role))).toBe('/')
    }
  })

  it('handles a missing user', () => {
    expect(homePathFor(null)).toBe('/')
  })
})

describe('hasAnyRole', () => {
  it('matches only the listed roles', () => {
    expect(hasAnyRole(userWith('customer'), ['customer'])).toBe(true)
    expect(hasAnyRole(userWith('customer'), ['coordinator'])).toBe(false)
    expect(hasAnyRole(null, ['customer'])).toBe(false)
  })
})

describe('initialsOf', () => {
  it('uses the first and last name', () => {
    expect(initialsOf('Nimal Perera')).toBe('NP')
    expect(initialsOf('Test Fleet Owner')).toBe('TO')
    expect(initialsOf('Kasun')).toBe('K')
    expect(initialsOf('')).toBe('')
  })
})
