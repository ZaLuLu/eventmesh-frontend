import type { Event } from '@/api/contracts/event'
import { APP_CONFIG } from '@/config/appConfig'

/** Imported records never fall back to native booking routes. */
export function eventDestination(event: Event): string | null {
  if (event.kind !== 'imported') return `/events/${encodeURIComponent(event.slug || event.id)}`
  if (!event.sourceUrl) return null
  try {
    const url = new URL(event.sourceUrl)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch { return null }
}

export function eventPriceLabel(event: Event): string {
  if (event.isFree === true) return 'Free'
  if (event.price == null || !Number.isFinite(event.price)) return 'Price unavailable'
  // Legacy mock records use the configured currency; API null currency remains unknown.
  const currency = event.currency === undefined ? APP_CONFIG.currency.code : event.currency
  if (!currency) return 'Price unavailable'
  try {
    return new Intl.NumberFormat(APP_CONFIG.currency.locale, { style: 'currency', currency }).format(event.price)
  } catch { return 'Price unavailable' }
}
