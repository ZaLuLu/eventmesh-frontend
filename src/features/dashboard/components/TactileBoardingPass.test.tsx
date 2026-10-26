import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { TactileBoardingPass } from './TactileBoardingPass'
import { Registration } from '@/api'

// Mock HTMLCanvasElement for QRCode in JSDOM
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Array(4) })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => ({ data: new Array(4) })),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    fillText: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
  })) as any
})

const mockPass: Registration = {
  id: 'reg-suraj-01',
  eventId: 'evt-1',
  userId: 'usr-suraj',
  userEmail: 'ceosuraj@email.com',
  userName: 'Suraj Naik',
  status: 'registered',
  ticketCode: 'TKT-884192',
  eventTitle: 'THE GRAND TURING HACKATHON 2026',
  eventSlug: 'grand-turing-hackathon-2026',
  organizerName: 'CTU ACM Chapter',
  organizerColor: '#6366F1',
  eventStartsAt: '2026-10-24T09:00:00Z',
  tierName: 'General Hacker Pass',
  createdAt: '2026-10-02T14:30:00Z',
  answers: {},
}

describe('TactileBoardingPass Component', () => {
  it('renders Suraj Naik admission pass with ticket serial and event title', () => {
    const onPresent = vi.fn()
    const onCancel = vi.fn()

    render(
      <TactileBoardingPass
        registration={mockPass}
        onPresent={onPresent}
        onCancel={onCancel}
      />
    )

    // Check pass serial and event title
    expect(screen.getByText(/PASS-REG-SURA/i)).toBeInTheDocument()
    expect(screen.getAllByText('THE GRAND TURING HACKATHON 2026').length).toBeGreaterThan(0)
    expect(screen.getByText('CTU ACM Chapter')).toBeInTheDocument()
    expect(screen.getByText(/General Hacker Pass/i)).toBeInTheDocument()
  })

  it('triggers onPresent callback when Present Pass button is clicked', () => {
    const onPresent = vi.fn()
    const onCancel = vi.fn()

    render(
      <TactileBoardingPass
        registration={mockPass}
        onPresent={onPresent}
        onCancel={onCancel}
      />
    )

    const presentBtn = screen.getByRole('button', { name: /Present Pass/i })
    expect(presentBtn).toBeInTheDocument()
    fireEvent.click(presentBtn)

    expect(onPresent).toHaveBeenCalledTimes(1)
  })

  it('flips pass to back face when Flip pass button is clicked', () => {
    const onPresent = vi.fn()
    const onCancel = vi.fn()

    render(
      <TactileBoardingPass
        registration={mockPass}
        onPresent={onPresent}
        onCancel={onCancel}
      />
    )

    // Find flip button by aria-label
    const flipBtn = screen.getByRole('button', { name: /Flip pass/i })
    expect(flipBtn).toBeInTheDocument()
    fireEvent.click(flipBtn)

    // Check back face details
    expect(screen.getByText('OFFICIAL GATE TOKEN')).toBeInTheDocument()
    expect(screen.getByText('TKT-884192')).toBeInTheDocument()
    expect(screen.getByText('GATE READY')).toBeInTheDocument()
    expect(screen.getByText(/Signed by EventMesh admission service/i)).toBeInTheDocument()
  })
})
