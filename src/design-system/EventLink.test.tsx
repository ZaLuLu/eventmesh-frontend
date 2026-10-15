import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { EventLink } from './EventLink'
import { normalizeBackendEvent, type VisibleEventRead } from '@/api/contracts/event'

const event = normalizeBackendEvent({ kind: 'imported', id: 'external', slug: null, title: 'Provider event', url: 'https://example.org/book', provider: 'Luma', sources: ['luma'], is_free: true } as VisibleEventRead)
describe('EventLink', () => {
  it('renders provider destinations as named external links', () => {
    render(<MemoryRouter><EventLink event={event}>View event</EventLink></MemoryRouter>)
    expect(screen.getByRole('link', { name: 'View event — on Luma' })).toHaveAttribute('href', 'https://example.org/book')
  })
  it('does not create a local booking route when an imported URL is missing', () => {
    render(<MemoryRouter><EventLink event={{ ...event, sourceUrl: null }}>View event</EventLink></MemoryRouter>)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('View event')).toHaveAttribute('aria-disabled', 'true')
  })
})
