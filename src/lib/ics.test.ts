import { describe, it, expect, vi } from 'vitest'
import { downloadICS, CalendarEventPayload } from './ics'

describe('ICS Calendar Export Utility', () => {
  it('triggers download with correctly formatted ICS content', () => {
    const fakeBlob = vi.fn()
    const appendSpy = vi.spyOn(document.body, 'appendChild')
    const removeSpy = vi.spyOn(document.body, 'removeChild')
    
    // Mock URL methods
    const mockCreateUrl = vi.fn().mockReturnValue('blob:test-url')
    const mockRevokeUrl = vi.fn()
    global.URL.createObjectURL = mockCreateUrl
    global.URL.revokeObjectURL = mockRevokeUrl

    const payload: CalendarEventPayload = {
      title: 'Grand Turing Hackathon 2026',
      description: 'Annual competitive 36-hour hackathon.',
      startsAt: '2026-10-15T09:00:00Z',
      endsAt: '2026-10-16T21:00:00Z',
      venueName: 'Turing Hall',
      venueAddress: 'Block 4, Tech Park',
      url: 'https://eventmesh.xyz/events/evt-1',
    }

    downloadICS(payload)

    expect(mockCreateUrl).toHaveBeenCalled()
    expect(appendSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
    expect(mockRevokeUrl).toHaveBeenCalledWith('blob:test-url')
  })
})
