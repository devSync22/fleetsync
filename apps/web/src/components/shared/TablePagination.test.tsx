import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TablePagination } from './TablePagination'

const pageLabels = () =>
  screen
    .getAllByRole('button')
    .map((b) => b.getAttribute('aria-label') ?? b.textContent)
    .filter((label) => label !== 'Previous page' && label !== 'Next page')

describe('TablePagination', () => {
  it('shows every page when there are few', () => {
    render(<TablePagination page={1} pageCount={4} pageSize={8} onChange={() => {}} />)
    expect(pageLabels()).toEqual(['1', '2', '3', '4'])
    expect(screen.getByText('Rows per page: 8')).toBeInTheDocument()
  })

  it('collapses long ranges to 1 2 3 … last, keeping the current page', () => {
    render(<TablePagination page={7} pageCount={11} pageSize={8} onChange={() => {}} />)
    expect(pageLabels()).toEqual(['1', '2', '3', '7', '11'])
    expect(screen.getAllByText('…')).toHaveLength(2)
    expect(screen.getByRole('button', { name: '7' })).toHaveAttribute('aria-current', 'page')
  })

  it('disables Previous on the first page and moves with Next', async () => {
    const onChange = vi.fn()
    render(<TablePagination page={1} pageCount={3} pageSize={8} onChange={onChange} label="Showing 1–8 of 20" />)
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onChange).toHaveBeenCalledWith(2)
    expect(screen.getByText('Showing 1–8 of 20')).toBeInTheDocument()
  })
})
