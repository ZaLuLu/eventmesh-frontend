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
  it('exports an event with an unknown end time without inventing an end', () => {
    const NativeBlob = global.Blob
    let content = ''
    const blobSpy = vi.spyOn(global, 'Blob').mockImplementation((parts, options) => {
      content = (parts || []).join('')
      return new NativeBlob(parts, options)
    })
    global.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url')
    global.URL.revokeObjectURL = vi.fn()
    downloadICS({ title: 'Community event', startsAt: '2026-11-03T18:00:00Z', endsAt: '' })
    expect(content).toContain('DTSTART:20261103T180000Z')
    expect(content).not.toContain('DTEND:')
    blobSpy.mockRestore()
  })

})
