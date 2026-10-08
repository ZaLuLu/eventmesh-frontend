import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { IndexRow } from './IndexRow'

describe('IndexRow Component', () => {
  it('renders index number, title, organizer, and category', () => {
    render(
      <BrowserRouter>
        <IndexRow
          id="evt-1"
          slug="grand-turing-hackathon"
          title="Grand Turing Hackathon 2026"
          category="HACKATHON"
          organizerName="DevCraft"
          organizerColor="#E54D2E"
          dateDisplay="OCT 15 · 09:00"
          venueName="Turing Auditorium"
          indexNumber="01"
          isSignature={true}
        />
      </BrowserRouter>
    )

    expect(screen.getByText('Grand Turing Hackathon 2026')).toBeInTheDocument()
    expect(screen.getByText('DevCraft')).toBeInTheDocument()
    expect(screen.getByText('HACKATHON')).toBeInTheDocument()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('Signature')).toBeInTheDocument()
    expect(screen.getByText('OCT 15 · 09:00')).toBeInTheDocument()
  })

  it('renders correct navigation link', () => {
    render(
      <BrowserRouter>
        <IndexRow
          id="evt-2"
          slug="quantum-ai-colloquium"
          title="Quantum AI Colloquium"
          category="TALK"
          organizerName="BIRDS"
          organizerColor="#0091FF"
          dateDisplay="OCT 20"
        />
      </BrowserRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/events/quantum-ai-colloquium')
  })
})
