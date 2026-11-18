import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { UserAccountsPage } from './UserAccountsPage'

function renderPage(path = '/admin/users') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/admin/users" element={<UserAccountsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('UserAccountsPage', () => {
  it('lists users with their role and status', async () => {
    renderPage()
    const row = (await screen.findByText('Dinesh Kumara')).closest('tr')!
    expect(within(row).getByText('Mechanic')).toBeInTheDocument()
    expect(within(row).getByText('Deactivated')).toBeInTheDocument()
    // A deactivated account offers Activate instead of View profile.
    expect(within(row).getByRole('button', { name: 'Activate' })).toBeInTheDocument()
  })

  it('shows the licence warning on the Drivers tab', async () => {
    renderPage('/admin/users?tab=drivers')
    expect(await screen.findByText('2 driver licences need attention')).toBeInTheDocument()
    expect(screen.getByText('Licence expired')).toBeInTheDocument()
  })

  it('changes a role from the profile sheet and reports it', async () => {
    const user = userEvent.setup()
    renderPage('/admin/users?user=USR-0118')

    const sheet = await screen.findByRole('dialog', { name: 'User profile' })
    await within(sheet).findByText('Sanduni Fernando')
    await user.click(within(sheet).getByRole('button', { name: 'Change role' }))

    const dialog = await screen.findByRole('dialog', { name: 'Change role' })
    const submit = within(dialog).getByRole('button', { name: 'Change role' })
    // Nothing to save until a different role is picked.
    expect(submit).toBeDisabled()
    await user.click(within(dialog).getByRole('radio', { name: /Operational Coordinator/ }))
    await user.click(submit)

    expect(await screen.findByText(/Sanduni Fernando now has the Operational Coordinator role/)).toBeInTheDocument()
  })
})
