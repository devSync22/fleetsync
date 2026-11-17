import { describe, expect, it } from 'vitest'
import { canMessage } from './permissions'
import type { ChatRole } from './types'

const roles: ChatRole[] = ['coordinator', 'customer', 'driver', 'mechanic']

// Use case rules (same as the mobile app).
const allowed: Record<ChatRole, ChatRole[]> = {
  coordinator: ['customer', 'driver', 'mechanic'],
  customer: ['coordinator'],
  driver: ['coordinator', 'mechanic'],
  mechanic: ['coordinator', 'driver'],
}

describe('canMessage', () => {
  for (const from of roles) {
    for (const to of roles) {
      const expected = allowed[from].includes(to)
      it(`${from} ${expected ? 'can' : 'cannot'} message ${to}`, () => {
        expect(canMessage(from, to)).toBe(expected)
      })
    }
  }

  it('nobody messages their own role', () => {
    for (const role of roles) expect(canMessage(role, role)).toBe(false)
  })
})
