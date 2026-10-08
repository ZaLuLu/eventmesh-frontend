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
  const end = formatDateToICS(event.endsAt)
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
    `DTEND:${end}`,
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
