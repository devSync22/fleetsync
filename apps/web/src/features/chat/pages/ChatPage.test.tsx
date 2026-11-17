import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { chatPeopleMock, chatRoomsMock } from '../mocks/chatMock'
import { createMockChatService, resetChatMockForTests } from '../services/chatApi'
import { ChatPage } from './ChatPage'

type Viewer = 'coordinator' | 'customer'

const viewerIds: Record<Viewer, string> = { coordinator: 'co-nimal', customer: 'cu-dilini' }
const roomsOf = (viewer: Viewer) => chatRoomsMock.filter((room) => room.memberIds.includes(viewerIds[viewer]))

function CurrentLocation() {
  const location = useLocation()
  return <output aria-label="Current location">{location.pathname + location.search}</output>
}

function renderChat(viewer: Viewer, path = `/${viewer}/chat`) {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path={`/${viewer}/chat/:orderId?`}
          element={
            <>
              <ChatPage viewer={viewer} />
              <CurrentLocation />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
  return user
}

const roomList = () => screen.findByRole('list', { name: 'Order rooms' })
const roomButton = async (orderId: string) =>
  within(await roomList()).getByRole('button', { name: new RegExp(orderId) })
const location = () => screen.getByRole('status', { name: 'Current location' })
const peoplePanel = () => screen.getByText('PEOPLE ON THIS ORDER').parentElement!

beforeEach(() => {
  resetChatMockForTests()
  // Real time keeps moving (so findBy works); fake timers let us drop the mock's 2 s / 4 s "other side" timers.
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  window.history.replaceState(null, '', '/')
})

describe('ChatPage', () => {
  it('lists the coordinator’s rooms and filters them with search', async () => {
    const user = renderChat('coordinator')
    const list = await roomList()
    expect(within(list).getAllByRole('button')).toHaveLength(roomsOf('coordinator').length)

    await user.type(screen.getByRole('searchbox', { name: 'Search order rooms' }), 'Hayleys')
    expect(within(list).getAllByRole('button')).toHaveLength(1)
    expect(within(list).getByRole('button', { name: /ORD-1045/ })).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Search order rooms' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search order rooms' }), 'TRP-2201')
    expect(within(list).getByRole('button', { name: /ORD-1043/ })).toBeInTheDocument()

    await user.clear(screen.getByRole('searchbox', { name: 'Search order rooms' }))
    await user.type(screen.getByRole('searchbox', { name: 'Search order rooms' }), 'zzz')
    expect(within(list).queryAllByRole('button')).toHaveLength(0)
    expect(within(list).getByText('No rooms match “zzz”.')).toBeInTheDocument()
  })

  it('puts the selected room and person in the URL', async () => {
    const user = renderChat('coordinator')

    await user.click(await roomButton('ORD-1041'))
    expect(location()).toHaveTextContent(/^\/coordinator\/chat\/ORD-1041$/)
    expect(await roomButton('ORD-1041')).toHaveAttribute('aria-current', 'true')

    const mechanic = await within(peoplePanel()).findByRole('button', { name: /Sampath Kumara/ })
    await user.click(mechanic)
    expect(location()).toHaveTextContent(/^\/coordinator\/chat\/ORD-1041\?with=me-sampath$/)
    expect(await within(peoplePanel()).findByRole('button', { name: /Sampath Kumara/, pressed: true })).toBeInTheDocument()
  })

  it('shows the customer only the coordinator, in every room', async () => {
    const user = renderChat('customer')
    for (const room of roomsOf('customer')) {
      await user.click(await roomButton(room.orderId))
      await waitFor(() => expect(location()).toHaveTextContent(`/customer/chat/${room.orderId}`))
      const people = await within(peoplePanel()).findAllByRole('button')
      expect(people.map((b) => b.textContent)).toEqual([expect.stringContaining('Nimal Perera')])
    }
  })

  it('never offers the customer anyone but the coordinator (service)', async () => {
    const service = createMockChatService({ id: 'cu-dilini', role: 'customer' })
    for (const room of roomsOf('customer')) {
      const people = await service.getParticipants(room.orderId)
      expect(people.map((p) => p.role)).toEqual(['coordinator'])
    }
    expect(chatPeopleMock['cu-dilini'].role).toBe('customer')
  })

  it('sends a message: sending, then sent', async () => {
    const user = renderChat('coordinator', '/coordinator/chat/ORD-1041?with=dr-nuwan')
    const input = await screen.findByRole('textbox', { name: 'Message Nuwan Herath' })
    await waitFor(() => expect(input).toBeEnabled())

    await user.type(input, 'Leaving the depot now')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(screen.getByText('Leaving the depot now')).toBeInTheDocument()
    expect(screen.getByText('Sending…')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Sending…')).not.toBeInTheDocument())
    expect(screen.getByText('Leaving the depot now')).toBeInTheDocument()
    expect(screen.queryByText('Retry')).not.toBeInTheDocument()
  })

  it('shows Retry when a send fails, and Retry sends it', async () => {
    window.history.replaceState(null, '', '/?mock=send-error')
    const user = renderChat('coordinator', '/coordinator/chat/ORD-1041?with=dr-nuwan')
    const input = await screen.findByRole('textbox', { name: 'Message Nuwan Herath' })
    await waitFor(() => expect(input).toBeEnabled())

    await user.type(input, 'Call me at the gate')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    const retry = await screen.findByRole('button', { name: 'Retry' })
    expect(screen.getByText(/Not sent/)).toBeInTheDocument()

    window.history.replaceState(null, '', '/')
    await user.click(retry)
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('Sending…')).not.toBeInTheDocument())
    expect(screen.getByText('Call me at the gate')).toBeInTheDocument()
  })

  it('clears a room’s unread count when its thread is opened', async () => {
    const user = renderChat('coordinator', '/coordinator/chat/ORD-1041')
    const room = await roomButton('ORD-1045')
    expect(room).toHaveTextContent(/unread/)

    await user.click(room)
    await waitFor(async () => expect(await roomButton('ORD-1045')).not.toHaveTextContent(/unread/))
  })
})
