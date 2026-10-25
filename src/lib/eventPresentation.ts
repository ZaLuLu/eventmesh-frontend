import type { Event } from '@/api/contracts/event'
import { APP_CONFIG } from '@/config/appConfig'

const EVENTBRITE_CITY_SLUGS: Record<string, string> = {
  bangalore: 'india--bangalore',
  bengaluru: 'india--bangalore',
  mumbai: 'india--mumbai',
  'delhi ncr': 'india--new-delhi',
  delhi: 'india--new-delhi',
  'new delhi': 'india--new-delhi',
  hyderabad: 'india--hyderabad',
  pune: 'india--pune',
  chennai: 'india--chennai',
  goa: 'india--goa',
  'san francisco': 'ca--san-francisco',
  'new york': 'ny--new-york',
  london: 'united-kingdom--london',
  berlin: 'germany--berlin',
}

const LUMA_CITY_SLUGS: Record<string, string> = {
  bangalore: 'bangalore',
  bengaluru: 'bangalore',
  'san francisco': 'sf',
  'new york': 'nyc',
  london: 'london',
  berlin: 'berlin',
  delhi: 'delhi',
  'delhi ncr': 'delhi',
  mumbai: 'mumbai',
}

function isDummyPlaceholder(urlStr: string): boolean {
  const dummyPatterns = [
    'tickets-98214',
    'cartographer-premiere',
    'sunrise-yoga-cubbon-park',
    'a16z-founder-hours',
    'tickets-781920',
    'figma-config-watch-party-2026',
    'tickets-129384',
    'frontier-ai-bangalore',
    'web3-goa-hacker-house',
    'k8s-cilium-2026',
    'tickets-918231',
    'kernel-go-sprint-2026',
    'tickets-981814612937',
    'tickets-1987637669776',
  ]
  return dummyPatterns.some((p) => urlStr.includes(p))
}

function buildProviderFallbackUrl(event: Event): string {
  const provider = (event.provider || '').toLowerCase()
  const city = (event.venue?.city || event.tags?.[0] || 'online').toLowerCase()
  const cleanTitle = (event.title || '').replace(/[^\w\s-]/g, '').trim()

  if (provider === 'eventbrite') {
    const citySlug = EVENTBRITE_CITY_SLUGS[city]
    if (citySlug) {
      return `https://www.eventbrite.com/d/${citySlug}/${encodeURIComponent(cleanTitle)}/`
    }
    return `https://www.eventbrite.com/d/online/${encodeURIComponent(cleanTitle)}/`
  }

  if (provider === 'meetup') {
    const loc = event.venue?.city || city
    return `https://www.meetup.com/find/?keywords=${encodeURIComponent(cleanTitle)}${loc ? `&location=${encodeURIComponent(loc)}` : ''}`
  }

  if (provider === 'luma') {
    const lumaSlug = LUMA_CITY_SLUGS[city]
    if (lumaSlug) {
      return `https://lu.ma/${lumaSlug}`
    }
    return 'https://lu.ma/explore'
  }

  return `https://www.google.com/search?q=${encodeURIComponent(event.title + ' ' + (event.venue?.city || ''))}`
}

/** Imported records jump straight to their canonical source URL (Eventbrite, Meetup, Luma) or a verified resilient landing destination. */
export function eventDestination(event: Event): string | null {
  if (event.kind === 'imported') {
    if (!event.sourceUrl) return null
    try {
      const url = new URL(event.sourceUrl)
      if (!['https:', 'http:'].includes(url.protocol)) return null
      if (isDummyPlaceholder(url.href)) {
        return buildProviderFallbackUrl(event)
      }
      return url.href
    } catch {
      return null
    }
  }
  return `/events/${encodeURIComponent(event.slug || event.id)}`
}

export function eventPriceLabel(event: Event): string {
  if (event.isFree === true || event.price === 0) return 'Free'
  if (event.price == null || !Number.isFinite(event.price) || !event.currency) return 'Price unavailable'
  const currency = event.currency || APP_CONFIG.currency.code
  try {
    return new Intl.NumberFormat(APP_CONFIG.currency.locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: Number.isInteger(event.price) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(event.price)
  } catch {
    return `${currency} ${event.price}`
  }
}


export const PROVIDER_OPTIONS = [
  { value: 'ALL', label: 'All Sources' },
  { value: 'eventmesh', label: 'EventMesh' },
  { value: 'eventbrite', label: 'Eventbrite' },
  { value: 'meetup', label: 'Meetup' },
  { value: 'luma', label: 'Luma' },
]

export function providerInfo(provider?: string | null) {
  const p = (provider || 'eventmesh').toLowerCase()
  if (p === 'eventbrite') {
    return {
      name: 'Eventbrite',
      color: '#FF8A65',
      badgeClass: 'bg-[#FF8A65]/15 text-[#E05326] border-[#FF8A65]/40',
      dotColor: '#FF8A65',
    }
  }
  if (p === 'meetup') {
    return {
      name: 'Meetup',
      color: '#FF4D4D',
      badgeClass: 'bg-[#FF4D4D]/15 text-[#E02828] border-[#FF4D4D]/40',
      dotColor: '#FF4D4D',
    }
  }
  if (p === 'luma') {
    return {
      name: 'Luma',
      color: '#C084FC',
      badgeClass: 'bg-[#C084FC]/15 text-[#9333EA] border-[#C084FC]/40',
      dotColor: '#C084FC',
    }
  }
  return {
    name: 'EventMesh',
    color: '#00D6FF',
    badgeClass: 'bg-accent/15 text-accent border-accent/40',
    dotColor: '#00D6FF',
  }
}
