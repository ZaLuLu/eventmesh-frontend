/**
 * EventMesh Date & Time Formatting Utilities
 * Timezone: Asia/Kolkata / en-IN standard
 */

export function formatDate(isoString: string, _format?: string): string {
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d)
  } catch {
    return isoString
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d)
  } catch {
    return isoString
  }
}

export function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    return new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d)
  } catch {
    return isoString
  }
}

export function formatDayMonth(isoString: string): { day: string; month: string } {
  try {
    const d = new Date(isoString)
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(d).toUpperCase(),
    }
  } catch {
    return { day: '01', month: 'OCT' }
  }
}

export function isDateToday(isoString: string): boolean {
  const d = new Date(isoString)
  const today = new Date()
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  )
}

export function isDateThisWeekend(isoString: string): boolean {
  const d = new Date(isoString)
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
  const saturday = new Date(today)
  saturday.setDate(today.getDate() + daysUntilSaturday)
  saturday.setHours(0, 0, 0, 0)

  const sunday = new Date(saturday)
  sunday.setDate(saturday.getDate() + 1)
  sunday.setHours(23, 59, 59, 999)

  return d >= saturday && d <= sunday
}

export function getRelativeTime(isoString: string): string {
  try {
    const d = new Date(isoString)
    const now = new Date()
    const diffMs = d.getTime() - now.getTime()
    const diffSec = Math.round(diffMs / 1000)
    const diffMin = Math.round(diffSec / 60)
    const diffHours = Math.round(diffMin / 60)
    const diffDays = Math.round(diffHours / 24)

    const rtf = new Intl.RelativeTimeFormat('en-IN', { numeric: 'auto' })

    if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day')
    if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour')
    if (Math.abs(diffMin) >= 1) return rtf.format(diffMin, 'minute')
    return 'just now'
  } catch {
    return ''
  }
}
