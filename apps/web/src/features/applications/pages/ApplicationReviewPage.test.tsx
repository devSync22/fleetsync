import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ApplicationReviewPage } from './ApplicationReviewPage'

function renderReview(applicationId: string) {
  render(
    <MemoryRouter initialEntries={[`/admin/applications/${applicationId}`]}>
      <Routes>
        <Route path="/admin/applications/:applicationId" element={<ApplicationReviewPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ApplicationReviewPage', () => {
  it('approves a driver and creates the account', async () => {
    const user = userEvent.setup()
    renderReview('APP-2026-0118')

    await screen.findByRole('heading', { name: 'Tharindu Wijesinghe' })
    await user.click(await screen.findByRole('button', { name: 'Approve' }))

    const dialog = await screen.findByRole('dialog', { name: 'Approve and create account' })
    // The unchecked medical certificate is called out but doesn't block approval.
    expect(within(dialog).getByText('One document not checked')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('Work email')).toHaveValue('tharindu.w@fms.lk')
    await user.click(within(dialog).getByRole('button', { name: 'Approve & create account' }))

    expect(await screen.findByText('Account created')).toBeInTheDocument()
    expect(screen.getByText(/Account DRV-036 was created for Tharindu Wijesinghe/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
  })

  it('shows the outcome of an application that is already decided', async () => {
    renderReview('APP-2026-0119')
    await screen.findByRole('heading', { name: 'Chathura Silva' })
    // Rejected in the mock data: no decision buttons, and the reason is shown.
    expect(screen.queryByRole('button', { name: 'Approve' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Reject' })).not.toBeInTheDocument()
    expect(screen.getByText(/Rejected by Ayesha Silva .*: Licence expired\./)).toBeInTheDocument()
  })

  it('rejects with a reason and a templated message', async () => {
    const user = userEvent.setup()
    renderReview('APP-2026-0123')

    await screen.findByRole('heading', { name: 'Ruwan Bandara' })
    await user.click(screen.getByRole('button', { name: 'Reject' }))
    const dialog = await screen.findByRole('dialog', { name: 'Reject application' })
    expect((within(dialog).getByLabelText('Message to applicant') as HTMLTextAreaElement).value).toContain('Thank you for applying')
    await user.click(within(dialog).getByRole('button', { name: 'Reject application' }))

    expect(await screen.findByText('Application rejected')).toBeInTheDocument()
  })
})
