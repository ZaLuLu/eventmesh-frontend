import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PosterArt } from './PosterArt'

describe('PosterArt Deterministic Gig-Poster Engine (V-02, P-04)', () => {
  it('renders SVG graphic with accessible role and label', () => {
    render(
      <PosterArt
        eventId="evt-grand-hack-2026"
        title="Grand Turing Hackathon"
        category="hackathon"
        clubId="club-devcraft"
      />
    )

    const poster = screen.getByRole('img', { name: /Poster for Grand Turing Hackathon/i })
    expect(poster).toBeInTheDocument()
    expect(screen.getByText('Grand Turing Hackathon')).toBeInTheDocument()
  })

  it('generates identical SVG output deterministically for the same event ID', () => {
    const { container: container1 } = render(
      <PosterArt
        eventId="evt-algo-sprint-99"
        title="Algo Sprint"
        category="hackathon"
        clubId="club-cp"
      />
    )
    const { container: container2 } = render(
      <PosterArt
        eventId="evt-algo-sprint-99"
        title="Algo Sprint"
        category="hackathon"
        clubId="club-cp"
      />
    )

    expect(container1.innerHTML).toBe(container2.innerHTML)
  })

  it('generates different geometrical elements for different event IDs', () => {
    const { container: containerA } = render(
      <PosterArt
        eventId="evt-alpha-1"
        title="Alpha Conference"
        category="symposium"
        clubId="club-cyber"
      />
    )
    const { container: containerB } = render(
      <PosterArt
        eventId="evt-beta-2"
        title="Beta Conference"
        category="symposium"
        clubId="club-cyber"
      />
    )

    expect(containerA.innerHTML).not.toBe(containerB.innerHTML)
  })
})
