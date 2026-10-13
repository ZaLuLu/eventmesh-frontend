import type { Event } from '@/api'
import { formatDate } from '@/lib/format'

export interface ShareMetadata {
  title: string
  description: string
  url: string
  imageUrl?: string
  ogType: string
  publishedTime: string
  section: string
}

/**
 * Builds standard Open Graph, Twitter Cards, and schema metadata for events.
 * Note: Because EventMesh is a single-page application (Vite SPA), external crawlers
 * (WhatsApp, LinkedIn, Twitter, iMessage) that do not execute client JS require
 * Edge/SSR rendering or a prerendering worker to inspect these tags.
 * Documented in docs/KNOWN_GAPS.md.
 */
export function buildShareMeta(event: Event): ShareMetadata {
  const formattedDate = formatDate(event.startsAt, 'medium')
  const title = `${event.title} — EventMesh`
  const description = event.subtitle ||
    `${event.title} organized by ${event.organizerName} on ${formattedDate} at ${event.venue?.name || 'Main Campus'}. Grab a seat on EventMesh.`

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eventmesh.campus'
  const url = `${origin}/events/${event.slug}`

  return {
    title,
    description,
    url,
    imageUrl: event.banner || event.poster,
    ogType: 'event',
    publishedTime: event.createdAt || new Date().toISOString(),
    section: event.category,
  }
}
