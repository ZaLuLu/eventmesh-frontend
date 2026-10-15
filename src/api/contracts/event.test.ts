import { describe, expect, it } from 'vitest'
import { normalizeBackendEvent, type EventRead, type VisibleEventRead } from './event'
import { eventDestination, eventPriceLabel } from '@/lib/eventPresentation'

const imported: VisibleEventRead = {
  kind: 'imported', id: 'external-1', slug: null, title: 'Community evening',
  description: null, image_url: null, start_time: '2026-11-03T18:00:00Z',
  end_time: null, timezone: 'Europe/London', city: 'London', venue: null,
  is_online: false, is_free: false, price_cents: null, currency: 'GBP',
  category: null, url: 'https://example.org/events/community', provider: 'meetup',
  sources: ['meetup'], organization_id: null, audience_type: 'public',
}
const native: EventRead = {
  id: 'native-1', slug: 'community-evening', title: 'Community evening', description: null,
  status: 'published', event_type: 'online', visibility: 'public', audience_type: 'public',
  start_time: '2026-11-03T18:00:00Z', end_time: null, timezone: 'Europe/London',
  venue_name: null, venue_address: null, city: null, country: null, latitude: null, longitude: null,
  is_free: false, price_cents: null, currency: 'GBP', capacity: null,
  registration_required: true, registration_closes_at: null, cover_image_url: null, refund_policy: null,
  organization_id: 'company-1', organization_name: 'Community Company', organization_slug: 'community-company',
  registration_state: 'open', spots_remaining: null, created_at: '', updated_at: '',
}

describe('existing API response presentation', () => {
  it('preserves imported provenance and destination without making a local booking link', () => {
    const event = normalizeBackendEvent(imported)
    expect(eventDestination(event)).toBe(imported.url)
    expect(event).toMatchObject({ kind: 'imported', sources: ['meetup'], provider: 'meetup', timezone: 'Europe/London' })
    expect(event.features.checkin).toBe(false)
    for (const url of [null, 'javascript:alert(1)', '/events/invented']) {
      expect(eventDestination(normalizeBackendEvent({ ...imported, url }))).toBeNull()
    }
  })
  it('keeps unknown availability, price and verification unknown', () => {
    const event = normalizeBackendEvent(native)
    expect(event).toMatchObject({ capacity: null, seatsLeft: null, orgId: 'company-1', organizerName: 'Community Company', isOnline: true })
    expect(event.club?.verified).toBe(false)
    expect(event.contact.email).toBe('')
    expect(event.venue.name).toBe('')
    expect(eventPriceLabel(event)).toBe('Price unavailable')
    expect(eventDestination(event)).toBe('/events/community-evening')
  })
  it.each(['open', 'full', 'closed', 'not_required'] as const)('preserves authoritative %s registration state', (registration_state) => {
    expect(normalizeBackendEvent({ ...native, registration_state }).registrationState).toBe(registration_state)
  })
  it('preserves real zero and uses the provided currency', () => {
    const event = normalizeBackendEvent({ ...native, price_cents: 1250, capacity: 10, spots_remaining: 0 })
    expect(event.seatsLeft).toBe(0)
    expect(eventPriceLabel(event)).toContain('12.50')
    expect(eventPriceLabel(event)).not.toContain('₹')
    expect(eventPriceLabel({ ...event, isFree: true })).toBe('Free')
    expect(eventPriceLabel({ ...event, currency: null })).toBe('Price unavailable')
  })
})
