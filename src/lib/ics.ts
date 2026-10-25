/**
 * Client-side iCalendar (.ics) generation utility for "Add to Calendar"
 */

export interface CalendarEventPayload {
  title: string
  description?: string
  startsAt: string
  endsAt: string
  venueName?: string
  venueAddress?: string
  url?: string
}

function formatDateToICS(isoString: string): string {
  const d = new Date(isoString)
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

export function downloadICS(event: CalendarEventPayload) {
  const start = formatDateToICS(event.startsAt)
  const end = event.endsAt ? formatDateToICS(event.endsAt) : undefined
  const location = [event.venueName, event.venueAddress].filter(Boolean).join(', ')

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventMesh//Editorial Event Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@eventmesh.xyz`,
    `DTSTAMP:${formatDateToICS(new Date().toISOString())}`,
    `DTSTART:${start}`,
    ...(end ? [`DTEND:${end}`] : []),
    `SUMMARY:${event.title.replace(/\n/g, ' ')}`,
    `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${location}`,
    ...(event.url ? [`URL:${event.url}`] : []),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  const icsData = icsLines.join('\r\n')
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Generates a 1-click Google Calendar web creation URL.
 */
export function getGoogleCalendarUrl(event: CalendarEventPayload): string {
  const start = formatDateToICS(event.startsAt)
  let end = event.endsAt ? formatDateToICS(event.endsAt) : ''
  if (!end) {
    const endDt = new Date(new Date(event.startsAt).getTime() + 2 * 60 * 60 * 1000)
    end = formatDateToICS(endDt.toISOString())
  }
  const dates = `${start}/${end}`
  const location = [event.venueName, event.venueAddress].filter(Boolean).join(', ')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates,
    details: `${event.description || ''}\n\nView event on EventMesh: ${event.url || window.location.href}`,
    location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Returns backend calendar endpoints.
 */
export function getEventIcsUrl(slug: string): string {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  return `${apiBase}/events/${slug}/calendar.ics`
}

export function getUserScheduleIcsUrl(userId: string): string {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'
  return `${apiBase}/users/${userId}/calendar.ics`
}

export function getUserScheduleWebCalUrl(userId: string): string {
  const url = getUserScheduleIcsUrl(userId)
  return url.replace(/^https?:\/\//i, 'webcal://')
}
