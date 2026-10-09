import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EventCard } from './EventCard'
import { Event } from '../../api/contracts'

const mockEvent: Event = {
  id: 'test-evt-1',
  slug: 'test-algo-sprint',
  orgId: 'org-1',
  organizerId: 'club-cp',
  organizerName: 'CP Club',
  organizerColor: '#2F4BD6',
  club: {
    id: 'club-cp',
    name: 'CP Club',
    color: '#2F4BD6',
    verified: true,
  },
  isSignature: true,
  title: 'ALGORITHMIC ENDURANCE SPRINT',
  category: 'hackathon',
  type: 'hackathon',
  tags: ['Algorithms', 'Systems'],
  description: 'An intense 48-hour competitive algorithmic endurance challenge.',
  poster: '/images/events/event-1.webp',
  venue: { name: 'Auditorium A' },
  startsAt: '2026-10-24T09:00:00Z',
  endsAt: '2026-10-26T12:00:00Z',
  capacity: 100,
  seatsLeft: 3, // triggers "Filling fast" (< 5)
  eligibility: 'Open to all engineering cohorts',
  waitlistEnabled: true,
  registrationOpensAt: '2026-10-01T00:00:00Z',
  registrationClosesAt: '2026-10-22T00:00:00Z',
  schedule: [],
  people: [],
  rules: [],
  contact: { name: 'Lead', email: 'lead@cp.org' },
  features: { certificate: true, checkin: true, paid: false, team: false },
  formSchema: [],
  status: 'published',
  results: [],
  photos: [],
  isFree: true,
  price: 0,
  registrationsCount: 88,
}

describe('EventCard Component', () => {
  it('renders stacked variant with title, club name, and filling fast badge', () => {
    render(
      <MemoryRouter>
        <EventCard event={mockEvent} variant="stacked" />
      </MemoryRouter>
    )

    expect(screen.getByTestId('event-card-stacked')).toBeInTheDocument()
    expect(screen.getByText('ALGORITHMIC ENDURANCE SPRINT')).toBeInTheDocument()
    expect(screen.getByText('CP Club')).toBeInTheDocument()
    expect(screen.getByText('Filling fast')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders overlay variant with dark gradient scrim', () => {
    render(
      <MemoryRouter>
        <EventCard event={mockEvent} variant="overlay" />
      </MemoryRouter>
    )

    expect(screen.getByTestId('event-card-overlay')).toBeInTheDocument()
    expect(screen.getByText('ALGORITHMIC ENDURANCE SPRINT')).toBeInTheDocument()
  })

  it('renders list-row variant with horizontal layout and view link', () => {
    render(
      <MemoryRouter>
        <EventCard event={mockEvent} variant="list-row" />
      </MemoryRouter>
    )

    expect(screen.getByTestId('event-card-list-row')).toBeInTheDocument()
    expect(screen.getByText('View event')).toBeInTheDocument()
  })

  it('renders typographic fallback poster when poster is empty', () => {
    const noPosterEvent: Event = {
      ...mockEvent,
      poster: '',
      title: 'TYPOGRAPHIC SALON WITHOUT POSTER',
    }

    render(
      <MemoryRouter>
        <EventCard event={noPosterEvent} variant="stacked" />
      </MemoryRouter>
    )

    expect(screen.getAllByText('TYPOGRAPHIC SALON WITHOUT POSTER').length).toBeGreaterThanOrEqual(1)
    // Should not have an img element
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('handles bookmark click without navigating', () => {
    const handleBookmarkToggle = vi.fn()
    render(
      <MemoryRouter>
        <EventCard event={mockEvent} onBookmarkToggle={handleBookmarkToggle} />
      </MemoryRouter>
    )

    const bookmarkBtn = screen.getByRole('button', { name: /save event/i })
    fireEvent.click(bookmarkBtn)

    expect(handleBookmarkToggle).toHaveBeenCalledWith('test-evt-1', true)
  })
})
