import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, CalendarPlus } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'
import { downloadICS } from '@/lib/ics'
import { formatDate, formatTime } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'

export const CalendarPage: React.FC = () => {
  const { toast } = useToast()
  const { data: eventsData, isLoading } = useEvents()
  const { data: clubs = [] } = useClubs()

  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [selectedClub, setSelectedClub] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)) // October 2026

  const events = eventsData?.items || []

  const filteredEvents = events.filter((e) => {
    if (selectedClub !== 'all' && e.organizerId !== selectedClub) return false
    return true
  })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate)

  // Calculate calendar days in month
  const firstDay = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d)
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  return (
    <div className="w-full bg-paper text-ink min-h-screen">
      {/* Editorial Page Header */}
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
            Temporal Schedule
          </span>
          <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
            Calendar
          </h1>
        </div>

        {/* View Switcher & Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center border border-ink">
            <button
              type="button"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 font-mono text-xs uppercase flex items-center gap-1.5 ${
                viewMode === 'month' ? 'bg-ink text-paper font-bold' : 'text-ink'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Month</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 font-mono text-xs uppercase flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-ink text-paper font-bold' : 'text-ink'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          <select
            value={selectedClub}
            onChange={(e) => setSelectedClub(e.target.value)}
            className="bg-paper border border-ink px-3 py-2 font-mono text-xs uppercase focus:outline-none"
          >
            <option value="all">All Collectives (9)</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="px-[4vw] py-8">
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-6 border-b border-ink-15">
            <h2 className="font-display text-3xl sm:text-4xl uppercase text-ink">
              {monthName}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 border border-ink-15 hover:border-ink hover:bg-ink hover:text-paper transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 border border-ink-15 hover:border-ink hover:bg-ink hover:text-paper transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-ink-15 bg-paper-deep/40 font-mono text-[11px] uppercase tracking-widecaps text-ink-60 py-2.5 text-center">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7 border-l border-t border-ink-15">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[100px] sm:min-h-[130px] border-r border-b border-ink-15 bg-paper-deep/20"
                  />
                )
              }

              const dateIsoPrefix = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const dayEvents = filteredEvents.filter((e) => e.startsAt.startsWith(dateIsoPrefix))

              return (
                <div
                  key={day}
                  className="min-h-[100px] sm:min-h-[130px] border-r border-b border-ink-15 p-2 flex flex-col justify-between hover:bg-paper-deep/30 transition-colors"
                >
                  <span className="font-mono text-xs font-bold text-ink">
                    {String(day).padStart(2, '0')}
                  </span>

                  <div className="space-y-1 mt-1">
                    {dayEvents.map((evt) => (
                      <Link
                        key={evt.id}
                        to={`/events/${evt.slug}`}
                        className="block p-1 border text-[10px] sm:text-[11px] font-mono uppercase font-semibold truncate hover:opacity-90"
                        style={{
                          borderColor: evt.organizerColor,
                          borderLeftWidth: '3px',
                          backgroundColor: 'var(--paper)',
                        }}
                        title={evt.title}
                      >
                        {evt.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="px-[4vw] py-8 divide-y divide-ink-15 border-b border-ink-15">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 sm:gap-6 flex-1">
                <div className="font-mono text-center border border-ink p-2 w-16 flex-shrink-0">
                  <span className="text-[10px] uppercase text-ink-60 block">
                    {new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(evt.startsAt)).toUpperCase()}
                  </span>
                  <span className="text-xl font-bold block">
                    {String(new Date(evt.startsAt).getDate()).padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block h-2.5 w-2.5"
                      style={{ backgroundColor: evt.organizerColor }}
                    />
                    <span className="font-mono text-[11px] uppercase text-ink-60">
                      {evt.organizerName} · {evt.category}
                    </span>
                  </div>

                  <Link to={`/events/${evt.slug}`}>
                    <h3 className="font-display text-2xl sm:text-3xl uppercase text-ink group-hover:underline truncate">
                      {evt.title}
                    </h3>
                  </Link>

                  <p className="font-mono text-xs text-ink-60 uppercase mt-1">
                    {formatTime(evt.startsAt)} · {evt.venue.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    downloadICS({
                      title: evt.title,
                      description: evt.description,
                      startsAt: evt.startsAt,
                      endsAt: evt.endsAt,
                      venueName: evt.venue.name,
                    })
                    toast({ title: 'ICS Downloaded', type: 'success' })
                  }}
                  className="p-2 border border-ink-15 hover:border-ink"
                  title="Add to iCalendar"
                >
                  <CalendarPlus className="h-4 w-4" />
                </button>

                <Link to={`/events/${evt.slug}`}>
                  <Button size="sm" variant="secondary">
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
