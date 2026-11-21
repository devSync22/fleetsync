import { canMessage, isRoomReadOnly } from './permissions';
import type { ChatRole } from './types';

describe('canMessage', () => {
  it.each<[ChatRole, ChatRole, boolean]>([
    ['driver', 'coordinator', true],
    ['driver', 'mechanic', true],
    ['driver', 'driver', false],
    ['driver', 'customer', false],
    ['mechanic', 'coordinator', true],
    ['mechanic', 'driver', true],
    ['mechanic', 'mechanic', false],
    ['mechanic', 'customer', false],
  ])('%s → %s: %s', (from, to, expected) => {
    expect(canMessage(from, to)).toBe(expected);
  });

  it('never lets any role message the customer on mobile', () => {
    const roles: ChatRole[] = ['driver', 'mechanic', 'coordinator', 'customer'];
    roles.forEach((role) => expect(canMessage(role, 'customer')).toBe(false));
  });
});

describe('isRoomReadOnly', () => {
  it('is read-only once the trip is Completed or Cancelled', () => {
    expect(isRoomReadOnly('Completed')).toBe(true);
    expect(isRoomReadOnly('Cancelled')).toBe(true);
  });

  it('is open while the trip is assigned or under way', () => {
    expect(isRoomReadOnly('Assigned')).toBe(false);
    expect(isRoomReadOnly('In progress')).toBe(false);
  });
});
