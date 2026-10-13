/**
 * EventMesh Unified Formatting Library
 * Strictly enforces en-IN locale, Asia/Kolkata timezone, and ₹ (INR) currency formatting.
 * Audit F-18 resolution.
 */

import { APP_CONFIG } from '@/config/appConfig'

const TIMEZONE = APP_CONFIG.timezone
const LOCALE = APP_CONFIG.currency.locale

/**
 * Format ISO date string into readable Indian collegiate date: e.g., "Sat, 18 Oct 2026"
 */
export function formatDate(
  isoString: string | Date | undefined,
  style: 'full' | 'short' | 'compact' | 'medium' = 'short'
): string {
  if (!isoString) return ''
  try {
    const d = typeof isoString === 'string' ? new Date(isoString) : isoString
    if (isNaN(d.getTime())) return String(isoString)

    if (style === 'compact') {
      return new Intl.DateTimeFormat(LOCALE, {
        timeZone: TIMEZONE,
        day: 'numeric',
        month: 'short',
      }).format(d)
    }

    if (style === 'medium') {
      return new Intl.DateTimeFormat(LOCALE, {
        timeZone: TIMEZONE,
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d)
    }

    if (style === 'full') {
      return new Intl.DateTimeFormat(LOCALE, {
        timeZone: TIMEZONE,
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(d)
    }

    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
  } catch {
    return String(isoString)
  }
}

/**
 * Format ISO time into Indian 12-hour collegiate time: e.g., "10:30 AM"
 */
export function formatTime(isoString: string | Date | undefined): string {
  if (!isoString) return ''
  try {
    const d = typeof isoString === 'string' ? new Date(isoString) : isoString
    if (isNaN(d.getTime())) return String(isoString)

    return new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d)
  } catch {
    return String(isoString)
  }
}

/**
 * Format datetime combined: e.g., "Sat, 18 Oct · 10:30 AM"
 */
export function formatDateTime(isoString: string | Date | undefined): string {
  if (!isoString) return ''
  try {
    const d = typeof isoString === 'string' ? new Date(isoString) : isoString
    if (isNaN(d.getTime())) return String(isoString)

    const datePart = new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d)

    const timePart = new Intl.DateTimeFormat(LOCALE, {
      timeZone: TIMEZONE,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d)

    return `${datePart} · ${timePart}`
  } catch {
    return String(isoString)
  }
}

/**
 * Format currency amount with ₹ symbol or "Free"
 */
export function formatCurrency(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return 'Free'
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(numeric) || numeric === 0) return 'Free'

  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: APP_CONFIG.currency.code,
    maximumFractionDigits: 0,
  }).format(numeric)
}

/**
 * Format integer / metric count with Indian comma grouping (e.g. 1,00,000)
 */
export function formatNumber(num: number): string {
  if (num == null || isNaN(num)) return '0'
  return new Intl.NumberFormat(LOCALE).format(num)
}

export const formatCount = formatNumber

/**
 * Format ordinal indicator (e.g. 1st, 2nd, 3rd, 21st)
 */
export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

/**
 * Relative time helper for live ticker: e.g. "Tomorrow", "In 3 days", "Past"
 */
export function formatRelativeDays(isoString: string | Date): string {
  try {
    const d = typeof isoString === 'string' ? new Date(isoString) : isoString
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
    if (diffDays < 0) return 'Concluded'
    return formatDate(d, 'compact')
  } catch {
    return 'Upcoming'
  }
}
