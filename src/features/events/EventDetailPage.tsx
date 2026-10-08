import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ArrowRight,
  Share2,
  CalendarPlus,
  CheckCircle,
  Building,
  Mail,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { useEvent, useEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { formatDate, formatTime, formatDateTime } from '@/lib/dates'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'
import { PassBookingModal } from '@/features/registration/PassBookingModal'

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: event, isLoading, error } = useEvent(slug || '')

  const [isPassModalOpen, setIsPassModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-md-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Loading Event Details...
          </span>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-canvas p-12 text-center flex flex-col items-center justify-center">
        <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">Event Not Found</h2>
        <p className="font-body text-sm text-slate-500 mb-6 max-w-md">
          The requested event could not be found or may have been updated.
        </p>
        <Link to="/explore">
          <Button variant="primary" size="md">
            Explore All Events
          </Button>
        </Link>
      </div>
    )
  }

  const handleDownloadCalendar = () => {
    downloadICS({
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      venueName: event.venue.name,
      venueAddress: event.venue.address,
      url: window.location.href,
    })
    toast({
      title: 'Calendar File Downloaded',
      message: 'Added event entry to your iCalendar / Outlook feed.',
      type: 'success',
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: 'Link Copied',
        message: 'Direct link to event copied to clipboard.',
        type: 'info',
      })
    }
  }

  const isRegistrationOpen =
    event.status === 'published' &&
    new Date() >= new Date(event.registrationOpensAt) &&
    new Date() <= new Date(event.registrationClosesAt)

  const isWaitlistOnly = event.seatsLeft <= 0 && event.waitlistEnabled
  const registeredCount = event.capacity - event.seatsLeft
  const spotsPercent = Math.min(
    100,
    Math.round((registeredCount / (event.capacity || 100)) * 100)
  )

  return (
    <div className="w-full bg-canvas text-md-on-surface min-h-screen pb-20">
      {/* ==============================================================
          1. GOOGLE M3 TOP BREADCRUMB & HEADER STRIP
          ============================================================== */}
      <div className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link to="/" className="hover:text-md-primary">
                Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link to="/explore" className="hover:text-md-primary">
                Events
              </Link>
              <ChevronRight className="h-3 w-3" />
              <Link
                to={`/clubs/${event.organizerId}`}
                className="hover:text-md-primary font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: event.organizerColor || '#1A73E8' }}
                />
                <span>{event.organizerName}</span>
              </Link>
            </div>

            {/* Actions: Share & Calendar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DADCE0] bg-white hover:bg-[#F1F3F4] text-xs font-semibold text-slate-700 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DADCE0] bg-white hover:bg-[#F1F3F4] text-xs font-semibold text-slate-700 transition-colors"
              >
                <CalendarPlus className="h-3.5 w-3.5 text-md-primary" />
                <span>Add to Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==============================================================
          2. HERO TITLE SECTION
          ============================================================== */}
      <section className="bg-white border-b border-[#DADCE0] pt-6 sm:pt-8 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-4xl space-y-4">
            {/* Category Pill & Trending */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-md-primary-container text-md-primary">
                {event.category}
              </span>

              {event.certificateInfo && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]">
                  <Award className="h-3.5 w-3.5" />
                  Certificate Included
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]">
                <Sparkles className="h-3.5 w-3.5" />
                {spotsPercent}% Booked
              </span>
            </div>

            {/* Event Title */}
            <h1 className="font-display font-bold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
              {event.title}
            </h1>

            {/* Subtitle */}
            {event.subtitle && (
              <p className="font-body text-base sm:text-xl text-slate-600 font-normal leading-relaxed">
                {event.subtitle}
              </p>
            )}

            {/* Quick Logistics Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-md-primary" />
                <span>{formatDate(event.startsAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-md-primary" />
                <span>{formatTime(event.startsAt)} – {formatTime(event.endsAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-md-primary" />
                <span>{event.venue.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-md-primary" />
                <span>{registeredCount} Attendees Registered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==============================================================
          3. MAIN CONTENT (TWO COLUMNS: 8 / 4)
          ============================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left Column (8 cols): Media, Overview, Schedule, Speakers, Rules */}
          <div className="lg:col-span-8 space-y-8">
            {/* Event Cover Banner */}
            <div className="rounded-2xl overflow-hidden border border-[#DADCE0] bg-white shadow-subtle aspect-[16/9] w-full">
              <img
                src={event.banner || event.poster}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* About Event Card */}
            <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                About This Event
              </h2>
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-3 font-body">
                {event.description}
              </div>
            </div>

            {/* Schedule & Agenda Card */}
            {event.schedule && event.schedule.length > 0 && (
              <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Schedule & Timeline
                </h2>
                <div className="space-y-4">
                  {event.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl bg-[#F8F9FA] border border-[#DADCE0]"
                    >
                      <div className="px-3 py-1 rounded-lg bg-md-primary-container text-md-primary font-bold text-xs flex-shrink-0">
                        {item.time}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-900">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-slate-600 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers, Judges & Instructors */}
            {event.people && event.people.length > 0 && (
              <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-6">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Featured Speakers & Mentors
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.people.map((person, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-4 p-4 rounded-xl border border-[#DADCE0] bg-[#F8F9FA]"
                    >
                      {person.photo ? (
                        <img
                          src={person.photo}
                          alt={person.name}
                          className="w-14 h-14 rounded-full object-cover border border-[#DADCE0] flex-shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-md-primary-container text-md-primary font-bold text-lg flex items-center justify-center flex-shrink-0">
                          {person.name[0]}
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] font-semibold text-md-primary uppercase tracking-normal block">
                          {person.role}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                          {person.name}
                        </h4>
                        {person.bio && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {person.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rules & Eligibility */}
            {event.rules && event.rules.length > 0 && (
              <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-4">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Guidelines & Eligibility
                </h2>
                <ul className="space-y-3">
                  {event.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-md-primary-container text-md-primary font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Column (4 cols): Sticky Ticket Pass Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Ticket Card */}
              <div className="rounded-3xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-card-hover space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-md-primary uppercase tracking-normal">
                      Pass Reservation
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#137333] text-[11px] font-bold">
                      Free Entry
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    {isRegistrationOpen
                      ? isWaitlistOnly
                        ? 'Waitlist Open'
                        : 'Open For Booking'
                      : 'Registration Closed'}
                  </h3>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                      <span>Live Capacity</span>
                      <span className="font-bold text-slate-800">
                        {event.seatsLeft} of {event.capacity} left
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-md-primary transition-all duration-500"
                        style={{ width: `${spotsPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Primary CTA */}
                <div>
                  {isRegistrationOpen ? (
                    <Button
                      size="lg"
                      fullWidth
                      variant="primary"
                      arrow
                      onClick={() => setIsPassModalOpen(true)}
                    >
                      {isWaitlistOnly ? 'Join Waitlist' : 'Claim Entry Pass'}
                    </Button>
                  ) : event.status === 'completed' ? (
                    <div className="space-y-3">
                      <Button size="lg" fullWidth disabled>
                        Event Concluded
                      </Button>
                      <Link to="/verify/TA-2026-001245">
                        <Button size="md" variant="secondary" fullWidth>
                          Verify Issued Certificates
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <Button size="lg" fullWidth disabled>
                      Registration Closed
                    </Button>
                  )}
                </div>

                {/* Event Logistics Checklist */}
                <div className="border-t border-[#DADCE0] pt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Date</span>
                    <span className="font-semibold text-slate-900">{formatDate(event.startsAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Time</span>
                    <span className="font-semibold text-slate-900">{formatTime(event.startsAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Venue</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[160px]">{event.venue.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Team Format</span>
                    <span className="font-semibold text-slate-900">
                      {event.features.team
                        ? `Teams of ${event.teamConfig?.minSize}–${event.teamConfig?.maxSize}`
                        : 'Individual Entry'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Digital Pass</span>
                    <span className="font-semibold text-emerald-600">Instant QR Pass</span>
                  </div>
                </div>

                {/* Organizer Contact Info */}
                <div className="border-t border-[#DADCE0] pt-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-normal block mb-2">
                    Organized by
                  </span>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: event.organizerColor || '#1A73E8' }}
                    >
                      {(event.organizerName || 'ORG').slice(0, 3).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">
                        {event.organizerName}
                      </h4>
                      <a
                        href={`mailto:${event.contact.email}`}
                        className="text-[11px] text-md-primary hover:underline block"
                      >
                        {event.contact.email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DADCE0] px-4 py-3 sm:hidden flex items-center justify-between gap-4 shadow-card">
        <div>
          <span className="text-[10px] font-bold text-[#B06000] block">
            ⚡ {event.seatsLeft} SEATS LEFT
          </span>
          <span className="font-display font-bold text-sm text-slate-900 truncate max-w-[180px] block">
            {event.title}
          </span>
        </div>

        <Button
          size="sm"
          variant="primary"
          arrow
          disabled={!isRegistrationOpen}
          onClick={() => setIsPassModalOpen(true)}
        >
          Book Pass
        </Button>
      </div>

      {/* 1-Tap Pass Booking Modal */}
      <PassBookingModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        event={event}
      />
    </div>
  )
}
