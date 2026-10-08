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
    <div className="w-full bg-canvas text-md-on-surface min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-semibold text-md-primary block mb-1">
              Event Timeline
            </span>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              Calendar
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Track upcoming hackathons, tech talks, and certification sessions across all clubs
            </p>
          </div>

          {/* View Switcher & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1 rounded-full bg-slate-100 border border-[#DADCE0]">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-md-primary shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Month</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-md-primary shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="h-3.5 w-3.5" />
                <span>List</span>
              </button>
            </div>

            <select
              value={selectedClub}
              onChange={(e) => setSelectedClub(e.target.value)}
              className="rounded-full border border-[#DADCE0] bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-none focus:border-md-primary"
            >
              <option value="all">All 9 Clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Month Navigation Card */}
          <div className="rounded-2xl border border-[#DADCE0] bg-white shadow-subtle overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#DADCE0]">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                {monthName}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-2 rounded-full border border-[#DADCE0] hover:bg-[#F1F3F4] text-slate-700 transition-colors"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-2 rounded-full border border-[#DADCE0] hover:bg-[#F1F3F4] text-slate-700 transition-colors"
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-[#DADCE0] bg-[#F8F9FA] text-xs font-semibold text-slate-600 py-3 text-center">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Month Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[100px] sm:min-h-[120px] border-r border-b border-[#DADCE0] bg-[#F8F9FA]/60"
                    />
                  )
                }

                const dateIsoPrefix = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const dayEvents = filteredEvents.filter((e) => e.startsAt.startsWith(dateIsoPrefix))

                return (
                  <div
                    key={day}
                    className="min-h-[100px] sm:min-h-[120px] border-r border-b border-[#DADCE0] p-2 flex flex-col justify-between hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-700">
                      {day}
                    </span>

                    <div className="space-y-1 mt-1">
                      {dayEvents.map((evt) => (
                        <Link
                          key={evt.id}
                          to={`/events/${evt.slug}`}
                          className="block p-1.5 rounded-lg border text-[11px] font-medium truncate hover:opacity-90 transition-opacity"
                          style={{
                            borderColor: evt.organizerColor || '#1A73E8',
                            borderLeftWidth: '3px',
                            backgroundColor: '#E8F0FE',
                            color: '#1A73E8',
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
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl border border-[#DADCE0] bg-white divide-y divide-[#DADCE0] shadow-subtle overflow-hidden">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F8F9FA] transition-colors"
              >
                <div className="flex items-start gap-4 sm:gap-6 flex-1">
                  <div className="text-center rounded-xl border border-[#DADCE0] bg-[#E8F0FE] p-2.5 w-16 flex-shrink-0">
                    <span className="text-[10px] uppercase font-bold text-md-primary block">
                      {new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(evt.startsAt)).toUpperCase()}
                    </span>
                    <span className="text-xl font-bold text-slate-900 block leading-tight">
                      {new Date(evt.startsAt).getDate()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: evt.organizerColor || '#1A73E8' }}
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {evt.organizerName} · {evt.category}
                      </span>
                    </div>

                    <Link to={`/events/${evt.slug}`}>
                      <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 hover:text-md-primary transition-colors truncate">
                        {evt.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 mt-1">
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
                      toast({ title: 'Calendar File Downloaded', type: 'success' })
                    }}
                    className="p-2 rounded-full border border-[#DADCE0] hover:bg-[#F1F3F4] text-slate-600 transition-colors"
                    title="Add to iCalendar"
                  >
                    <CalendarPlus className="h-4 w-4" />
                  </button>

                  <Link to={`/events/${evt.slug}`}>
                    <Button size="sm" variant="secondary">
                      Details
                    </Button>
                  </Link>

                  <Link to={`/events/${evt.slug}/register`}>
                    <Button size="sm" variant="primary">
                      Book Pass
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
