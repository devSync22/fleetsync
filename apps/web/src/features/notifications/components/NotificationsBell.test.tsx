import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { notificationsMock } from '../mocks/notificationsMock'
import { resetNotificationsMockForTests } from '../services/notificationsApi'
import type { NotificationKind, NotificationRole } from '../types'
import { NotificationsBell } from './NotificationsBell'

// TypeScript fails here if a kind is added to NotificationKind but not to this list.
const allKinds = Object.keys({
  'new-order': true,
  payment: true,
  'vehicle-issue': true,
  'trip-update': true,
  mail: true,
  quotation: true,
  'trip-started': true,
  message: true,
  'payment-received': true,
  'account-application': true,
  'profile-change': true,
  'licence-expiring': true,
  'document-uploaded': true,
  security: true,
  'service-overdue': true,
  'payment-overdue': true,
  'trip-cancelled': true,
  utilisation: true,
} satisfies Record<NotificationKind, true>)

const roles: NotificationRole[] = ['coordinator', 'customer', 'admin', 'owner']
const coordinator = notificationsMock.coordinator
const coordinatorUnread = coordinator.filter((n) => n.unread).length

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="Current location">{location.pathname + location.search}</output>
}

function renderBell(role: NotificationRole = 'coordinator') {
  const user = userEvent.setup()
  render(
    <MemoryRouter initialEntries={['/start']}>
      <NotificationsBell role={role} />
      <CurrentLocation />
    </MemoryRouter>,
  )
  return user
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: /^Notifications/ }))
  const panel = await screen.findByRole('dialog', { name: 'Notifications' })
  await within(panel).findAllByRole('listitem')
  return panel
}

beforeEach(() => resetNotificationsMockForTests())
afterEach(() => window.history.replaceState(null, '', '/'))

describe('NotificationsBell', () => {
  it('has mock data for every notification kind', () => {
    const used = new Set(roles.flatMap((role) => notificationsMock[role].map((n) => n.kind)))
    expect([...used].sort()).toEqual([...allKinds].sort())
  })

  for (const role of roles) {
    it(`shows an icon with a tone for every ${role} notification`, async () => {
      const user = renderBell(role)
      const panel = await openPanel(user)
      const rows = within(panel).getAllByRole('listitem')
      expect(rows).toHaveLength(notificationsMock[role].length)
      for (const row of rows) {
        const chip = row.querySelector('button > span:first-child')
        expect(chip?.querySelector('svg')).not.toBeNull()
        expect(chip?.className).toMatch(/bg-(brand|info|success|pending|danger)-soft|bg-secondary/)
      }
    })
  }

  it('shows the unread state on the bell', async () => {
    renderBell()
    expect(await screen.findByRole('button', { name: `Notifications, ${coordinatorUnread} unread` })).toBeInTheDocument()
  })

  it('lists the items grouped under Today and Earlier', async () => {
    const user = renderBell()
    const panel = await openPanel(user)
    for (const group of ['today', 'earlier'] as const) {
      const section = within(panel).getByRole('region', { name: group })
      const titles = within(section).getAllByRole('listitem').map((li) => li.querySelector('.font-semibold')?.textContent)
      expect(titles).toEqual(coordinator.filter((n) => n.group === group).map((n) => n.title))
    }
  })

  it('filters with the All and Unread tabs', async () => {
    const user = renderBell()
    const panel = await openPanel(user)
    expect(within(panel).getByRole('tab', { name: 'All' })).toHaveAttribute('aria-selected', 'true')

    await user.click(within(panel).getByRole('tab', { name: `Unread (${coordinatorUnread})` }))
    expect(within(panel).getAllByRole('listitem')).toHaveLength(coordinatorUnread)
    // Earlier has no unread items, so its heading goes away.
    expect(within(panel).queryByRole('region', { name: 'earlier' })).not.toBeInTheDocument()

    await user.click(within(panel).getByRole('tab', { name: 'All' }))
    expect(within(panel).getAllByRole('listitem')).toHaveLength(coordinator.length)
  })

  it('marks an item read and navigates when it is clicked', async () => {
    const user = renderBell()
    const panel = await openPanel(user)
    const item = coordinator.find((n) => n.unread)!

    await user.click(within(panel).getByRole('button', { name: new RegExp(item.title) }))

    expect(screen.getByRole('status', { name: 'Current location' })).toHaveTextContent(item.to)
    expect(screen.getByRole('button', { name: `Notifications, ${coordinatorUnread - 1} unread` })).toBeInTheDocument()
  })

  it('marks everything read with "Mark all as read"', async () => {
    const user = renderBell()
    const panel = await openPanel(user)

    await user.click(within(panel).getByRole('button', { name: 'Mark all as read' }))

    expect(within(panel).queryByText(/new$/)).not.toBeInTheDocument()
    expect(within(panel).queryByText('Unread')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument()
    await user.click(within(panel).getByRole('tab', { name: 'Unread (0)' }))
    expect(within(panel).getByText('No unread notifications.')).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    window.history.replaceState(null, '', '/?mock=empty')
    const user = renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(await screen.findByText('No notifications yet.')).toBeInTheDocument()
  })

  it('shows the error state and retries', async () => {
    window.history.replaceState(null, '', '/?mock=error')
    const user = renderBell()
    await user.click(screen.getByRole('button', { name: 'Notifications' }))
    expect(await screen.findByText('Couldn’t load notifications. Try again.')).toBeInTheDocument()

    window.history.replaceState(null, '', '/')
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(coordinator.length))
  })
})
