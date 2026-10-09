import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, List, ChevronLeft, ChevronRight, CalendarPlus, Clock, MapPin } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'
import { formatDate, formatTime } from '@/lib/dates'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'
import { Event } from '@/api'

export const CalendarPage: React.FC = () => {
  const { toast } = useToast()
  const { data: eventsData } = useEvents()
  const { data: clubs = [] } = useClubs()

  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [selectedClub, setSelectedClub] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)) // October 2026 default seed
  const [selectedDay, setSelectedDay] = useState<number>(15)

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

  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push(d)
  }

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  // Find events on selected day
  const selectedDayEvents = filteredEvents.filter((e) => {
    const d = new Date(e.startsAt)
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
  })

  // Get events on a specific day
  const getEventsForDay = (d: number): Event[] => {
    return filteredEvents.filter((e) => {
      const dt = new Date(e.startsAt)
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d
    })
  }

  return (
    <div className="w-full bg-bg text-text pb-16">
      {/* Title & Toolbar */}
      <div className="border-b border-line bg-surface">
        <div className="app-container py-6 sm:py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              Event calendar
            </h1>
            <p className="text-small text-text-2 mt-0.5">
              Comprehensive schedule across all collegiate clubs and collectives
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-line rounded-[8px] bg-subtle p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-[6px] text-small font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-surface text-text' : 'text-text-2 hover:text-text'
                }`}
              >
                Month grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-[6px] text-small font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-surface text-text' : 'text-text-2 hover:text-text'
                }`}
              >
                List view
              </button>
            </div>

            {/* Club Filter */}
            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="h-10 px-3 rounded-[8px] bg-surface border border-line text-small text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
            >
              <option value="all">All clubs ({clubs.length})</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="app-container py-6 sm:py-8">
        {viewMode === 'month' ? (
          /* Calendar using full container width with a side list of the selected day's events */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Month Grid */}
            <div className="lg:col-span-8 bg-surface border border-line rounded-panel p-5 sm:p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-line">
                <h2 className="text-xl font-semibold text-text">
                  {monthName}
                </h2>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-2 rounded-[8px] border border-line hover:bg-subtle text-text-2 hover:text-text transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date(2026, 9, 1))}
                    className="px-3 py-1.5 rounded-[8px] border border-line text-small font-medium text-text hover:bg-subtle transition-colors"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-2 rounded-[8px] border border-line text-text-2 hover:text-text hover:bg-subtle transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-caption text-text-3 mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>

              {/* Month Days Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-20 sm:h-24 bg-subtle/40 rounded-[8px]" />
                  }

                  const dayEvents = getEventsForDay(day)
                  const isSelected = selectedDay === day

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`h-20 sm:h-24 p-2 rounded-[8px] border text-left flex flex-col justify-between transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent-soft/40 ring-1 ring-accent'
                          : 'border-line bg-surface hover:bg-subtle'
                      }`}
                    >
                      <span className={`text-small font-semibold ${isSelected ? 'text-accent' : 'text-text'}`}>
                        {day}
                      </span>

                      {/* Event indicators */}
                      <div className="space-y-1 w-full overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center gap-1.5 truncate px-1.5 py-0.5 rounded-[4px] bg-subtle text-caption text-text"
                          >
                            <span
                              className="h-2 w-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: ev.organizerColor || '#C93E27' }}
                              aria-hidden="true"
                            />
                            <span className="truncate text-caption">{ev.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-caption text-text-3 block pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Right 4 Cols: Side List of the Selected Day's Events */}
            <div className="lg:col-span-4 bg-surface border border-line rounded-panel p-5 sm:p-6 space-y-4">
              <div className="border-b border-line pb-3">
                <span className="text-caption font-semibold text-accent">Selected date</span>
                <h3 className="text-lg font-semibold text-text">
                  October {selectedDay}, {year}
                </h3>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="py-8 text-center text-small text-text-3">
                  No events scheduled for this date.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="p-4 rounded-[10px] bg-subtle border border-line space-y-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: evt.organizerColor || '#C93E27' }}
                          aria-hidden="true"
                        />
                        <span className="text-caption font-semibold text-text-2 truncate">
                          {evt.organizerName}
                        </span>
                        <span className="text-caption px-2 py-0.5 rounded-full bg-surface border border-line text-text ml-auto">
                          {evt.isFree ? 'Free' : `₹${evt.price}`}
                        </span>
                      </div>

                      <Link
                        to={`/events/${evt.slug}`}
                        className="font-semibold text-small text-text hover:underline block"
                      >
                        {evt.title}
                      </Link>

                      <div className="flex items-center gap-3 text-caption text-text-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-accent" />
                          {formatTime(evt.startsAt)}
                        </span>
                        <span className="flex items-center gap-1 truncate max-w-[140px]">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          {evt.venue?.name}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-line/60 flex items-center justify-between">
                        <Link to={`/events/${evt.slug}/register`}>
                          <Button variant="primary" size="compact">
                            Register
                          </Button>
                        </Link>
                        <Link to={`/events/${evt.slug}`}>
                          <Button variant="tertiary" size="compact">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* List View Alternative */
          <div className="bg-surface border border-line rounded-panel divide-y divide-line overflow-hidden">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: evt.organizerColor || '#C93E27' }}
                    aria-hidden="true"
                  />
                  <div>
                    <span className="text-caption font-medium text-text-2">
                      {formatDate(evt.startsAt, 'EEE, MMM d, yyyy · h:mm a')}
                    </span>
                    <Link to={`/events/${evt.slug}`} className="font-semibold text-small sm:text-base text-text hover:underline block">
                      {evt.title}
                    </Link>
                    <p className="text-caption text-text-2 mt-0.5">
                      {evt.organizerName} · {evt.venue?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <Link to={`/events/${evt.slug}/register`}>
                    <Button variant="primary" size="compact">
                      Register
                    </Button>
                  </Link>
                  <Link to={`/events/${evt.slug}`}>
                    <Button variant="secondary" size="compact">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
