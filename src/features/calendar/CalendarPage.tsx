import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  CalendarPlus,
  MapPin,
  ArrowRight,
  Clock,
} from '@phosphor-icons/react'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { EventLink } from '@/design-system/EventLink'
import { formatDate, formatTime } from '@/lib/format'
import { downloadICS } from '@/lib/ics'
import { eventDestination, eventPriceLabel } from '@/lib/eventPresentation'
import { useToast } from '@/design-system/primitives/Toast'
import { getClubTheme } from '@/design-system/clubColors'
import { Event } from '@/api'

/**
 * Split-Pane Master Calendar (Modern Architectural Standard)
 * - Left Pane: Sticky interactive mini-calendar matrix, quick date jumpers, club filters.
 * - Right Pane: Editorial Linear Ticket Strips with tabular timestamps, venue, and 1-click .ICS / Pass buttons.
 * - Modern 1px hairline borders (border-[#E2E8F0]), pure white cards, and subtle floating shadows.
 */
export const CalendarPage: React.FC = () => {
  const { toast } = useToast()
  const { data: eventsData, isLoading } = useEvents()
  const { data: clubs = [] } = useClubs()

  const [selectedClub, setSelectedClub] = useState<string>('all')
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [selectedDay, setSelectedDay] = useState<number | null>(() => new Date().getDate())

  const events = eventsData?.items || []

  // Align with first event's month if mock data has no current-month events
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date()
      const hasCurrentMonthEvents = events.some((e) => {
        const d = new Date(e.startsAt)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      if (!hasCurrentMonthEvents) {
        const first = new Date(events[0].startsAt)
        if (!isNaN(first.getTime())) {
          setCurrentDate(new Date(first.getFullYear(), first.getMonth(), 1))
          setSelectedDay(first.getDate())
        }
      }
    }
  }, [events])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedClub !== 'all' && e.organizerId !== selectedClub) return false
      return true
    })
  }, [events, selectedClub])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthName = new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate)

  // Calculate calendar days in month
  const firstDayIndex = new Date(year, month, 1).getDay()
  const totalDays = new Date(year, month + 1, 0).getDate()

  const calendarDays: (number | null)[] = useMemo(() => {
    const days: (number | null)[] = []
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null)
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d)
    }
    return days
  }, [firstDayIndex, totalDays])

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDay(today.getDate())
  }

  const handleThisWeekend = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7
    const saturday = new Date(now)
    saturday.setDate(now.getDate() + (daysUntilSaturday === 0 ? 0 : daysUntilSaturday))
    setCurrentDate(new Date(saturday.getFullYear(), saturday.getMonth(), 1))
    setSelectedDay(saturday.getDate())
  }

  const handleAllMonth = () => {
    setSelectedDay(null)
  }

  // Events filtered by active day (or all month if selectedDay === null)
  const displayScheduleEvents = useMemo(() => {
    return filteredEvents
      .filter((e) => {
        const dt = new Date(e.startsAt)
        const isSameMonth = dt.getFullYear() === year && dt.getMonth() === month
        if (!isSameMonth) return false
        if (selectedDay === null) return true
        return dt.getDate() === selectedDay
      })
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
  }, [filteredEvents, year, month, selectedDay])

  // Helper to get events count and theme for a specific day in the month matrix
  const getDayMeta = (d: number) => {
    const dayEvts = filteredEvents.filter((e) => {
      const dt = new Date(e.startsAt)
      return dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === d
    })
    return {
      count: dayEvts.length,
      events: dayEvts,
    }
  }

  const handleExportICS = (event: Event) => {
    const destination = eventDestination(event)
    downloadICS({
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      venueName: event.venue?.name,
      venueAddress: event.venue?.address,
      url: destination ? new URL(destination, window.location.origin).href : undefined,
    })
    toast({
      title: 'Calendar event downloaded',
      message: `${event.title} added as .ics file.`,
      type: 'info',
    })
  }

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <PageShell className="py-8 sm:py-12 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#E2E8F0] dark:border-line">
        <SectionHeader
          badge="TIMETABLE & AGENDA"
          badgeColor="sky"
          title="Campus Event Calendar"
          accentWord="Calendar"
          subtitle="Explore interactive schedules, technical hackathons, and creative showcases across campus."
        />

        {/* Catalog Navigation Action */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border border-[#E2E8F0] dark:border-line bg-white dark:bg-card hover:bg-slate-50 text-[#0F172A] dark:text-ink shadow-xs hover:border-accent hover:text-accent transition-all cursor-pointer"
            title="Browse all events in card grid"
          >
            <span>Explore Catalog Grid</span>
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      {/* Main Split-Pane Layout (Luma & Workbench Pattern) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =========================================================================
            LEFT COLUMN: Sticky Calendar Matrix & Filter Controls (col-span-5)
           ========================================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* 1. Interactive Month Matrix Card */}
          <div className="rounded-[14px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card p-5 shadow-sm space-y-4">
            {/* Month Navigation Strip */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-line">
              <h2 className="font-display font-bold text-xl text-[#0F172A] dark:text-ink tracking-tight">
                {monthName}
              </h2>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card hover:bg-slate-50 text-[#0F172A] dark:text-ink shadow-2xs hover:border-accent active:scale-95 transition-all cursor-pointer"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="grid h-8 w-8 place-items-center rounded-[8px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card hover:bg-slate-50 text-[#0F172A] dark:text-ink shadow-2xs hover:border-accent active:scale-95 transition-all cursor-pointer"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            </div>

            {/* Quick Date Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleToday}
                className="px-2.5 py-1 rounded-[6px] border border-[#E2E8F0] dark:border-line bg-slate-50 dark:bg-surface-subtle hover:bg-slate-100 text-[#0F172A] dark:text-ink font-mono text-[11px] font-semibold transition-all cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleThisWeekend}
                className="px-2.5 py-1 rounded-[6px] border border-[#E2E8F0] dark:border-line bg-slate-50 dark:bg-surface-subtle hover:bg-slate-100 text-[#0F172A] dark:text-ink font-mono text-[11px] font-semibold transition-all cursor-pointer"
              >
                This Weekend
              </button>
              <button
                type="button"
                onClick={handleAllMonth}
                className={`px-2.5 py-1 rounded-[6px] border text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                  selectedDay === null
                    ? 'border-[#0F172A] dark:border-white bg-[#0F172A] dark:bg-white text-white dark:text-black shadow-xs'
                    : 'border-[#E2E8F0] dark:border-line bg-slate-50 dark:bg-surface-subtle hover:bg-slate-100 text-[#0F172A] dark:text-ink'
                }`}
              >
                All {monthName.split(' ')[0]}
              </button>
            </div>

            {/* Calendar Matrix Grid */}
            <div className="rounded-[10px] border border-[#E2E8F0] dark:border-line bg-slate-50/70 dark:bg-surface-subtle/50 p-2.5">
              {/* Day of Week Headers */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-xs text-[#64748B] dark:text-ink-muted pb-2 border-b border-[#E2E8F0] dark:border-line">
                {daysOfWeek.map((day, idx) => (
                  <span key={`dow-${idx}`} className="py-1">
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Numerals with Event Heat Dots */}
              <div className="grid grid-cols-7 gap-1 pt-2">
                {calendarDays.map((day, idx) => {
                  if (day === null) {
                    return <div key={`pad-${idx}`} className="h-10 w-full" />
                  }

                  const { count, events: dayEvts } = getDayMeta(day)
                  const isSelected = selectedDay === day
                  const hasEvents = count > 0

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      aria-label={`Select ${monthName.split(' ')[0]} ${day}, ${count} events`}
                      className={`h-10 w-full rounded-[8px] flex flex-col items-center justify-center transition-all relative select-none cursor-pointer ${
                        isSelected
                          ? 'border border-[#0F172A] dark:border-white bg-[#0F172A] dark:bg-white text-white dark:text-black font-extrabold shadow-sm scale-102 z-10'
                          : hasEvents
                          ? 'border border-[#E2E8F0] dark:border-line/70 bg-white dark:bg-card hover:bg-slate-100 text-[#0F172A] dark:text-ink font-semibold hover:border-accent'
                          : 'hover:bg-slate-200/50 text-[#64748B] dark:text-ink-muted font-medium'
                      } active:scale-95`}
                    >
                      <span className="text-xs leading-none">{day}</span>

                      {/* Event Indicator Dots */}
                      {hasEvents && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {dayEvts.slice(0, 3).map((ev) => {
                            const theme = getClubTheme(ev.organizerId)
                            return (
                              <span
                                key={ev.id}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-amber-300' : ''
                                }`}
                                style={{ backgroundColor: isSelected ? undefined : theme.hex }}
                              />
                            )
                          })}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 2. Club & Theme Filters Pill Matrix */}
          <div className="rounded-[14px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] dark:border-line">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-ink-muted">
                Filter by Club / Host
              </span>
              <span className="text-[11px] font-mono font-bold text-accent">
                {filteredEvents.length} events
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedClub('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                  selectedClub === 'all'
                    ? 'border-[#0F172A] dark:border-white bg-[#0F172A] dark:bg-white text-white dark:text-black shadow-xs font-bold'
                    : 'border-[#E2E8F0] dark:border-line bg-white dark:bg-card text-[#475569] dark:text-ink hover:bg-slate-50'
                } active:scale-95`}
              >
                All Clubs ({events.length})
              </button>

              {clubs.map((club) => {
                const theme = getClubTheme(club.name)
                const isSelected = selectedClub === club.id
                const clubCount = events.filter((e) => e.organizerId === club.id).length
                return (
                  <button
                    key={club.id}
                    type="button"
                    onClick={() => setSelectedClub(isSelected ? 'all' : club.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                      isSelected
                        ? 'border-[#0F172A] dark:border-white bg-[#0F172A] dark:bg-white text-white dark:text-black shadow-xs font-bold'
                        : 'border-[#E2E8F0] dark:border-line bg-white dark:bg-card text-[#475569] dark:text-ink hover:bg-slate-50 shadow-2xs'
                    } active:scale-95`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.hex }}
                    />
                    <span>{club.name}</span>
                    {clubCount > 0 && (
                      <span
                        className={`text-[10px] font-mono px-1 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-surface-subtle text-[#64748B]'
                        }`}
                      >
                        {clubCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Editorial Linear Ticket Strips Timeline (col-span-7)
           ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Scope Summary Banner */}
          <div className="rounded-[14px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B] dark:text-ink-muted mb-0.5">
                {selectedDay === null ? 'Monthly Overview' : 'Selected Day Schedule'}
              </span>
              <h3 className="font-display font-bold text-xl text-[#0F172A] dark:text-ink">
                {selectedDay === null
                  ? `All Events in ${monthName}`
                  : `Events on ${monthName.split(' ')[0]} ${selectedDay}, ${year}`}
              </h3>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="border border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 text-xs font-mono font-bold px-3 py-1 rounded-full">
                {displayScheduleEvents.length} {displayScheduleEvents.length === 1 ? 'event' : 'events'}
              </span>

              {selectedDay !== null && (
                <button
                  type="button"
                  onClick={handleAllMonth}
                  className="text-xs font-semibold text-accent hover:underline px-2.5 py-1 rounded-[6px] hover:bg-accent-soft/50 transition-colors cursor-pointer"
                >
                  View Month
                </button>
              )}
            </div>
          </div>

          {/* Schedule Feed: Editorial Linear Ticket Strips */}
          {displayScheduleEvents.length === 0 ? (
            <div className="rounded-[14px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card p-12 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-full border border-[#E2E8F0] dark:border-line bg-slate-50 dark:bg-surface-subtle flex items-center justify-center mx-auto text-[#0F172A] dark:text-ink shadow-2xs">
                <CalendarBlank size={24} weight="bold" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-[#0F172A] dark:text-ink">
                  No events found on this date
                </h4>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-ink-soft max-w-sm mx-auto mt-1">
                  Try picking another date with active event dots on the calendar or view all upcoming events this month.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAllMonth}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[8px] bg-[#0F172A] dark:bg-ink text-white dark:text-paper hover:bg-accent font-semibold text-xs shadow-xs active:scale-95 cursor-pointer transition-all"
              >
                <span>Show All {monthName.split(' ')[0]} Events</span>
                <ArrowRight size={13} weight="bold" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayScheduleEvents.map((event) => {
                const theme = getClubTheme(event.organizerId)
                const eventDate = new Date(event.startsAt)
                return (
                  <article
                    key={event.id}
                    className="group rounded-[14px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  >
                    {/* Left & Middle Container */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {/* Tabular Date & Time Block */}
                      <div className="rounded-[8px] border border-[#E2E8F0] dark:border-line bg-slate-50 dark:bg-surface-subtle p-2 text-center min-w-[76px] flex-shrink-0 shadow-2xs">
                        <span className="block text-[10px] font-mono font-bold uppercase text-[#64748B] dark:text-ink-muted">
                          {new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(eventDate)} {eventDate.getDate()}
                        </span>
                        <span className="block font-mono font-extrabold text-xs sm:text-sm text-[#0F172A] dark:text-ink leading-tight mt-0.5">
                          {formatTime(event.startsAt)}
                        </span>
                      </div>

                      {/* Content Stack */}
                      <div className="space-y-1.5 min-w-0 flex-1">
                        {/* Club Kicker & Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded-[4px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-surface-subtle text-[#0F172A] dark:text-ink shadow-2xs"
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.hex }} />
                            <span>{theme.name}</span>
                          </span>

                          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-[4px] border border-[#E2E8F0] dark:border-line bg-slate-100 dark:bg-surface-subtle text-[#475569] dark:text-ink-muted">
                            {event.category || 'Featured'}
                          </span>

                          <span className="text-[11px] font-mono font-bold text-accent ml-auto sm:ml-0">
                            {eventPriceLabel(event)}
                          </span>
                        </div>

                        {/* Title */}
                        <h4 className="font-display font-bold text-base sm:text-lg text-[#0F172A] dark:text-ink group-hover:text-accent transition-colors truncate">
                          {event.title}
                        </h4>

                        {/* Venue & Metadata */}
                        <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-ink-soft flex-wrap">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin size={13} className="text-[#0F172A] dark:text-ink shrink-0" weight="bold" />
                            <span className="truncate">{event.venue?.name || 'Main Campus Hub'}</span>
                          </span>

                          <span className="text-black/20 dark:text-white/20">•</span>

                          <span className="flex items-center gap-1 text-[#64748B] dark:text-ink-muted font-mono text-[11px]">
                            <Clock size={12} weight="bold" />
                            <span>{formatDate(event.startsAt, 'compact')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Action Cluster */}
                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E2E8F0] dark:border-line justify-end">
                      <button
                        type="button"
                        onClick={() => handleExportICS(event)}
                        title="Download calendar .ics file"
                        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[8px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card hover:bg-slate-50 dark:hover:bg-surface-subtle text-[#0F172A] dark:text-ink text-xs font-semibold shadow-xs active:scale-95 cursor-pointer transition-all"
                      >
                        <CalendarPlus size={14} weight="bold" />
                        <span className="hidden sm:inline">.ICS</span>
                      </button>

                      <EventLink event={event}>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] bg-[#0F172A] dark:bg-ink hover:bg-accent dark:hover:bg-accent text-white dark:text-paper text-xs font-semibold shadow-xs active:scale-95 cursor-pointer transition-all"
                        >
                          <span>View Event</span>
                          <ArrowRight size={13} weight="bold" />
                        </button>
                      </EventLink>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}
