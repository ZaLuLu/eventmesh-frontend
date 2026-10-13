// Hallmark macrostructure: Calendar-Schedule
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarBlank,
  ListBullets,
  CaretLeft,
  CaretRight,
  CalendarPlus,
  Clock,
  MapPin,
  ArrowRight,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Sticker } from '@/design-system/primitives/Sticker'
import { Button } from '@/design-system/primitives/Button'
import { formatDate, formatTime } from '@/lib/format'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'
import { getClubTheme } from '@/design-system/clubColors'
import { Event } from '@/api'

export const CalendarPage: React.FC = () => {
  const { toast } = useToast()
  const { data: eventsData, isLoading } = useEvents()
  const { data: clubs = [] } = useClubs()

  const [viewMode, setViewMode] = useState<'month' | 'list'>('month')
  const [selectedClub, setSelectedClub] = useState<string>('all')
  // Default to October 2026 to align with mock seed data
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 1))
  const [selectedDay, setSelectedDay] = useState<number | null>(15)

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
  const handleToday = () => setCurrentDate(new Date(2026, 9, 1))

  // Find events on selected day
  const selectedDayEvents = selectedDay !== null
    ? filteredEvents.filter((e) => {
        const d = new Date(e.startsAt)
        return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay
      })
    : []

  // Helper to fetch events for any day
  const getEventsForDay = (d: number): Event[] => {
    return filteredEvents.filter((e) => {
      const dt = new Date(e.startsAt)
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d
    })
  }

  const handleExportICS = (event: Event) => {
    downloadICS({
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      venueName: event.venue?.name,
      venueAddress: event.venue?.address,
      url: window.location.origin + `/events/${event.slug}`,
    })
    toast({
      title: 'Calendar event downloaded',
      message: `${event.title} added as .ics file.`,
      type: 'info',
    })
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <PageShell className="py-8 sm:py-12 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeader
          badge="SCHEDULE & TIMETABLE"
          badgeColor="sky"
          title="Campus Event Calendar"
          accentWord="Calendar"
          subtitle="Interactive timetable of technical hackathons, workshops, and meetups happening across campus clubs."
        />

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 p-1.5 rounded-full border-2 border-ink bg-card shadow-[3px_3px_0_#151130] flex-shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'month'
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <CalendarBlank className="w-4 h-4" weight="bold" />
            <span>Month Grid</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-ink text-paper'
                : 'text-ink-soft hover:text-ink'
            }`}
          >
            <ListBullets className="w-4 h-4" weight="bold" />
            <span>Agenda List</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedClub('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all border-2 border-ink ${
            selectedClub === 'all'
              ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
              : 'bg-card text-ink-soft hover:text-ink hover:bg-paper-2'
          }`}
        >
          All Clubs
        </button>

        {clubs.map((club) => {
          const theme = getClubTheme(club.name)
          const isSelected = selectedClub === club.id
          return (
            <button
              key={club.id}
              type="button"
              onClick={() => setSelectedClub(isSelected ? 'all' : club.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold flex-shrink-0 transition-all border-2 border-ink ${
                isSelected
                  ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
                  : 'bg-card text-ink hover:bg-paper-2'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-ink"
                style={{ backgroundColor: theme.hex }}
              />
              <span>{club.name}</span>
            </button>
          )
        })}
      </div>

      {/* Month Navigation Toolbar */}
      <div className="flex items-center justify-between p-4 rounded-[18px] border-2 border-ink bg-card shadow-[4px_4px_0_#151130]">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight">
            {monthName}
          </h2>
          <button
            type="button"
            onClick={handleToday}
            className="text-xs font-bold text-cobalt hover:underline border-2 border-ink/20 px-2.5 py-1 rounded-full bg-paper"
          >
            Current Term
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="compact"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-2"
          >
            <CaretLeft className="w-4 h-4" weight="bold" />
          </Button>
          <Button
            variant="secondary"
            size="compact"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-2"
          >
            <CaretRight className="w-4 h-4" weight="bold" />
          </Button>
        </div>
      </div>

      {/* View Mode: Month Grid */}
      {viewMode === 'month' && (
        <div className="space-y-6">
          <div className="rounded-[20px] border-2 border-ink bg-card shadow-[6px_6px_0_#151130] overflow-hidden">
            {/* Day Header Row */}
            <div className="grid grid-cols-7 border-b-2 border-ink bg-paper-2">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center font-display font-bold text-xs sm:text-sm text-ink border-r-2 border-ink last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[90px] sm:min-h-[110px] p-2 bg-paper/50 border-r-2 border-b-2 border-ink/15 last:border-r-0"
                    />
                  )
                }

                const dayEvents = getEventsForDay(day)
                const isSelected = selectedDay === day
                const hasEvents = dayEvents.length > 0

                return (
                  <div
                    key={`day-${day}`}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 border-r-2 border-b-2 border-ink/15 cursor-pointer transition-all flex flex-col justify-between select-none ${
                      isSelected
                        ? 'bg-lavender/30 ring-2 ring-inset ring-ink'
                        : hasEvents
                        ? 'hover:bg-paper-2 bg-card'
                        : 'hover:bg-paper bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-ink text-paper'
                            : 'text-ink'
                        }`}
                      >
                        {day}
                      </span>

                      {hasEvents && (
                        <span className="text-[10px] font-mono font-bold text-ink-soft hidden sm:inline-block">
                          {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                        </span>
                      )}
                    </div>

                    {/* Event Dots & Mini Tags */}
                    <div className="mt-1.5 space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const theme = getClubTheme(ev.organizerId)
                        return (
                          <div
                            key={ev.id}
                            className="text-[10px] sm:text-xs font-semibold truncate px-1.5 py-0.5 rounded border border-ink/30 hidden sm:block"
                            style={{ backgroundColor: `${theme.hex}30` }}
                          >
                            <span className="truncate">{ev.title}</span>
                          </div>
                        )
                      })}

                      {/* Mobile indicator dots */}
                      <div className="flex flex-wrap items-center gap-1 sm:hidden">
                        {dayEvents.map((ev) => {
                          const theme = getClubTheme(ev.organizerId)
                          return (
                            <span
                              key={ev.id}
                              className="w-2 h-2 rounded-full border border-ink"
                              style={{ backgroundColor: theme.hex }}
                            />
                          )
                        })}
                      </div>

                      {dayEvents.length > 2 && (
                        <span className="text-[9px] font-bold text-ink-soft hidden sm:block pl-1">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Day Agenda Drawer / Card */}
          {selectedDay !== null && (
            <div className="rounded-[20px] border-2 border-ink bg-card p-6 sm:p-7 shadow-[4px_4px_0_#151130] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-extrabold text-xl text-ink">
                    Events on {monthName.split(' ')[0]} {selectedDay}, {year}
                  </h3>
                  <Sticker color="mustard" size="sm" className="font-bold">
                    {selectedDayEvents.length} scheduled
                  </Sticker>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="text-xs font-bold text-ink-soft hover:text-ink flex items-center gap-1 p-1"
                >
                  <X className="w-4 h-4" weight="bold" />
                  <span>Close</span>
                </button>
              </div>

              {selectedDayEvents.length === 0 ? (
                <p className="text-ink-soft text-sm py-4">
                  No events scheduled on this day. Pick another day on the calendar or explore all upcoming events.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {selectedDayEvents.map((event) => {
                    const theme = getClubTheme(event.organizerId)
                    return (
                      <div
                        key={event.id}
                        className="rounded-[16px] border-2 border-ink bg-paper p-4 space-y-3 shadow-[2px_2px_0_#151130] flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Sticker color={theme.token} size="sm" className="font-bold text-[11px]">
                              {theme.name}
                            </Sticker>
                            <span className="text-xs font-mono font-bold text-ink">
                              {formatTime(event.startsAt)}
                            </span>
                          </div>

                          <h4 className="font-display font-bold text-base text-ink line-clamp-1">
                            {event.title}
                          </h4>

                          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                            <MapPin className="w-3.5 h-3.5 text-ink flex-shrink-0" weight="bold" />
                            <span className="truncate">{event.venue?.name || 'Campus Venue'}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-ink/10 flex items-center justify-between gap-2">
                          <Button
                            variant="secondary"
                            size="compact"
                            onClick={() => handleExportICS(event)}
                            className="text-xs font-bold gap-1"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" weight="bold" />
                            <span>.ICS</span>
                          </Button>

                          <Link to={`/events/${event.slug}`}>
                            <Button
                              variant="primary"
                              size="compact"
                              className="text-xs font-bold gap-1"
                            >
                              <span>View Event</span>
                              <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* View Mode: Agenda List */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="rounded-[20px] border-2 border-ink bg-card p-12 text-center space-y-3 shadow-[4px_4px_0_#151130]">
              <p className="font-display font-bold text-xl text-ink">
                No events match the selected club filter
              </p>
              <Button variant="secondary" onClick={() => setSelectedClub('all')}>
                Show all clubs
              </Button>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const theme = getClubTheme(event.organizerId)
              return (
                <div
                  key={event.id}
                  className="rounded-[18px] border-2 border-ink bg-card p-5 sm:p-6 shadow-[4px_4px_0_#151130] hover:shadow-[6px_6px_0_#151130] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Date Block */}
                    <div className="rounded-[12px] border-2 border-ink bg-paper-2 p-2.5 text-center min-w-[64px] flex-shrink-0 shadow-[2px_2px_0_#151130]">
                      <span className="block text-[11px] font-bold uppercase text-ink-soft">
                        {new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(event.startsAt))}
                      </span>
                      <span className="block font-display font-extrabold text-2xl text-ink leading-none">
                        {new Date(event.startsAt).getDate()}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Sticker color={theme.token} size="sm" className="font-bold text-[11px]">
                          {theme.name}
                        </Sticker>
                        <span className="text-xs font-mono font-bold text-ink">
                          {formatTime(event.startsAt)}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-lg sm:text-xl text-ink">
                        {event.title}
                      </h3>

                      <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                        <MapPin className="w-3.5 h-3.5 text-ink flex-shrink-0" weight="bold" />
                        <span>{event.venue?.name || 'Main Campus'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/10">
                    <Button
                      variant="secondary"
                      size="compact"
                      onClick={() => handleExportICS(event)}
                      className="text-xs font-bold gap-1"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" weight="bold" />
                      <span>Add .ics</span>
                    </Button>

                    <Link to={`/events/${event.slug}`}>
                      <Button
                        variant="primary"
                        size="compact"
                        className="text-xs font-bold gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </PageShell>
  )
}
