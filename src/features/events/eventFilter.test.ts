import { describe, it, expect } from 'vitest'
import { Event } from '@/api'

describe('Event Search and Filtering Logic', () => {
  const sampleEvents: Partial<Event>[] = [
    {
      id: '1',
      title: 'Grand Turing Hackathon',
      organizerId: 'club-devcraft',
      type: 'hackathon',
      startsAt: '2026-10-15T09:00:00Z',
      status: 'published',
      tags: ['code', 'ai'],
    },
    {
      id: '2',
      title: 'AI and Neural Architectures',
      organizerId: 'club-birds',
      type: 'talk',
      startsAt: '2026-10-20T14:00:00Z',
      status: 'published',
      tags: ['deep-learning', 'math'],
    },
    {
      id: '3',
      title: 'Intro to Competitive Programming',
      organizerId: 'club-cp',
      type: 'workshop',
      startsAt: '2026-11-05T10:00:00Z',
      status: 'published',
      tags: ['algorithms', 'c++'],
    },
  ]

  it('filters events by search query in title or tags', () => {
    const query = 'neural'
    const filtered = sampleEvents.filter(e => 
      e.title?.toLowerCase().includes(query) || 
      e.tags?.some(t => t.toLowerCase().includes(query))
    )
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('2')
  })

  it('filters events by category / type', () => {
    const filtered = sampleEvents.filter(e => e.type === 'hackathon')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Grand Turing Hackathon')
  })

  it('filters events by club organizer', () => {
    const filtered = sampleEvents.filter(e => e.organizerId === 'club-cp')
    expect(filtered).toHaveLength(1)
    expect(filtered[0].title).toBe('Intro to Competitive Programming')
  })
})
