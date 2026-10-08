import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  ShieldAlert,
  ArrowRight,
  Share2,
  CalendarPlus,
  CheckCircle,
} from 'lucide-react'
import { useEvent, useEvents } from '@/hooks/useEvents'
import { useEventTheme } from '@/hooks/useEventTheme'
import { Button } from '@/design-system/primitives/Button'
import { Band } from '@/design-system/primitives/Band'
import { MetaRow } from '@/design-system/primitives/MetaRow'
import { Sheet } from '@/design-system/primitives/Sheet'
import { formatDate, formatTime, formatDateTime } from '@/lib/dates'
import { downloadICS } from '@/lib/ics'
import { useToast } from '@/design-system/primitives/Toast'
import { EventTheme } from '@/design-system/EventTheme'
import { TicketTierModal } from '@/features/registration/TicketTierModal'

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { data: event, isLoading, error } = useEvent(slug || '')
  const { data: similarEventsData } = useEvents({
    category: event?.category,
    limit: 3,
  })

  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)
  const [isTierModalOpen, setIsTierModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <span className="font-mono text-xs uppercase tracking-widecaps text-ink-60">
          Loading Curatorial Record...
        </span>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-paper p-12 text-center flex flex-col items-center justify-center">
        <h2 className="font-display text-4xl uppercase mb-3">Event Not Found</h2>
        <p className="font-body text-sm text-ink-60 mb-6 max-w-md">
          The requested event dossier does not exist in the exhibition archives.
        </p>
        <Link to="/explore">
          <Button variant="secondary" size="md">
            Return to Catalogue
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
        message: 'Direct link to event dossier copied to clipboard.',
        type: 'info',
      })
    }
  }

  const isRegistrationOpen =
    event.status === 'published' &&
    new Date() >= new Date(event.registrationOpensAt) &&
    new Date() <= new Date(event.registrationClosesAt)

  const isWaitlistOnly = event.seatsLeft <= 0 && event.waitlistEnabled

  return (
    <EventTheme color={event.organizerColor}>
      <div className="w-full bg-paper text-ink min-h-screen">
        {/* ==============================================================
            1. FULL-BLEED IDENTITY BAND WITH OVERSIZED TITLE
            ============================================================== */}
        <section className="relative pt-8 sm:pt-12 border-b border-ink-15">
          <div className="px-[4vw] mb-6 flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-wide text-ink-60">
            <div className="flex items-center gap-2">
              <Link to="/explore" className="hover:text-ink">
                Catalogue
              </Link>
              <span>/</span>
              <Link
                to={`/clubs/${event.organizerId}`}
                className="font-semibold text-ink hover:underline flex items-center gap-1.5"
              >
                <span
                  className="inline-block h-2.5 w-2.5"
                  style={{ backgroundColor: event.organizerColor }}
                />
                <span>{event.organizerName}</span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 hover:text-ink border border-ink-15 px-2.5 py-1"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="inline-flex items-center gap-1.5 hover:text-ink border border-ink-15 px-2.5 py-1"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                <span>Add to ICS</span>
              </button>
            </div>
          </div>

          {/* Title Area */}
          <div className="px-[4vw] pb-10">
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.86] uppercase tracking-tight text-ink mb-4 max-w-6xl">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="font-body text-lg sm:text-2xl font-medium text-ink-60 max-w-4xl">
                {event.subtitle}
              </p>
            )}
          </div>

          {/* Slicing Organizer Band */}
          <Band
            color={event.organizerColor}
            chipLabel={`ORGANIZED BY ${event.organizerName?.toUpperCase()}`}
            tagline={event.venue.name}
            metaRight={`${formatDate(event.startsAt)} · ${formatTime(event.startsAt)}`}
            height="h-20 sm:h-24"
          />
        </section>

        {/* ==============================================================
            2. TWO-COLUMN EDITORIAL CONTENT WITH STICKY REGISTER PANEL
            ============================================================== */}
        <section className="px-[4vw] py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left 7 Columns: Dossier, Media, Schedule, Speakers, Rules */}
            <div className="lg:col-span-7 space-y-14">
              {/* Poster / Banner Visual Frame */}
              <div className="relative border border-ink-15 bg-paper-deep overflow-hidden">
                <img
                  src={event.banner || event.poster}
                  alt={event.title}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
                <div className="p-3 bg-paper border-t border-ink-15 flex items-center justify-between font-mono text-[10px] uppercase text-ink-60">
                  <span>FIG. 01.1 · OFFICIAL EVENT DOSSIER POSTER</span>
                  <span>STATUS: {event.status.toUpperCase()}</span>
                </div>
              </div>

              {/* Description Statement */}
              <div className="space-y-4">
                <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                  Curatorial Statement
                </span>
                <p className="font-body text-lg sm:text-xl text-ink leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
              </div>

              {/* Schedule */}
              {event.schedule.length > 0 && (
                <div className="space-y-6 border-t border-ink-15 pt-8">
                  <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                    Curated Schedule & Timeline
                  </span>
                  <div className="divide-y divide-ink-15 border-t border-b border-ink-15">
                    {event.schedule.map((item, idx) => (
                      <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                        <span className="font-mono text-xs font-semibold uppercase text-ink-60 w-36 flex-shrink-0">
                          {item.time}
                        </span>
                        <div>
                          <h4 className="font-body text-base font-semibold text-ink">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="font-body text-sm text-ink-60 mt-1">
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
              {event.people.length > 0 && (
                <div className="space-y-6 border-t border-ink-15 pt-8">
                  <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                    Speakers, Judges & Instructors
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {event.people.map((person, idx) => (
                      <div
                        key={idx}
                        className="p-5 border border-ink-15 bg-paper-deep/20 flex items-start gap-4"
                      >
                        {person.photo && (
                          <img
                            src={person.photo}
                            alt={person.name}
                            className="w-14 h-14 object-cover border border-ink flex-shrink-0"
                          />
                        )}
                        <div>
                          <span className="font-mono text-[10px] uppercase text-ink-60 font-semibold block">
                            {person.role}
                          </span>
                          <h4 className="font-display text-xl uppercase text-ink mt-0.5">
                            {person.name}
                          </h4>
                          {person.bio && (
                            <p className="font-body text-xs text-ink-60 mt-1">
                              {person.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rules & Guidelines */}
              {event.rules.length > 0 && (
                <div className="space-y-4 border-t border-ink-15 pt-8">
                  <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                    Regulations & Guidelines
                  </span>
                  <ul className="space-y-2 border-t border-b border-ink-15 py-4">
                    {event.rules.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-3 font-body text-sm text-ink">
                        <span className="font-mono text-xs font-bold text-ink-60 flex-shrink-0 mt-0.5">
                          {String(idx + 1).padStart(2, '0')}.
                        </span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Completed Results and Photos (if event completed) */}
              {event.status === 'completed' && event.results.length > 0 && (
                <div className="space-y-6 border-t border-ink-15 pt-8 bg-paper-deep/40 p-6 border">
                  <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                    Official Results & Laureates
                  </span>
                  <div className="space-y-3">
                    {event.results.map((res, idx) => (
                      <div key={idx} className="border-b border-ink-15 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-ink uppercase">
                            {res.position}
                          </span>
                          <span className="font-display text-xl uppercase text-ink">
                            {res.winnerName}
                          </span>
                        </div>
                        {res.projectTitle && (
                          <p className="font-body text-xs text-ink-60 mt-0.5">
                            Project: {res.projectTitle}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 5 Columns: Sticky Registration Panel & Metadata */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-6">
                {/* Registration Action Card */}
                <div className="bg-paper border-2 border-ink p-6 sm:p-8 space-y-6">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widecaps text-ink-60 block mb-1">
                      Event Access Status
                    </span>
                    <div className="flex items-baseline justify-between">
                      <h3 className="font-display text-3xl uppercase text-ink">
                        {isRegistrationOpen
                          ? isWaitlistOnly
                            ? 'Waitlist Open'
                            : 'Open For Entry'
                          : event.status.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      <span className="font-mono text-xs font-bold uppercase text-ink">
                        {event.seatsLeft} of {event.capacity} left
                      </span>
                    </div>
                  </div>

                  {/* Register Call-To-Action */}
                  <div>
                    {isRegistrationOpen ? (
                      <Button
                        size="lg"
                        fullWidth
                        variant="gradient"
                        arrow
                        onClick={() => setIsTierModalOpen(true)}
                      >
                        {isWaitlistOnly ? 'Join Waitlist' : 'Select Pass & Register'}
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

                  {/* Curatorial Wall Labels MetaRows */}
                  <div className="border-t border-ink-15 pt-2">
                    <MetaRow label="Starts" value={formatDateTime(event.startsAt)} />
                    <MetaRow label="Ends" value={formatDateTime(event.endsAt)} />
                    <MetaRow label="Venue" value={event.venue.name} />
                    <MetaRow label="Eligibility" value={event.eligibility} />
                    <MetaRow
                      label="Deadline"
                      value={formatDate(event.registrationClosesAt)}
                    />
                    <MetaRow
                      label="Team Format"
                      value={
                        event.features.team
                          ? `Teams of ${event.teamConfig?.minSize}–${event.teamConfig?.maxSize}`
                          : 'Individual Entry'
                      }
                    />
                    <MetaRow
                      label="Certificate"
                      value={event.features.certificate ? 'Verifiable Digital PDF' : 'None'}
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="border-t border-ink-15 pt-4 font-mono text-xs">
                    <span className="text-ink-60 uppercase block mb-1">
                      Organizing Inquiries:
                    </span>
                    <p className="font-semibold text-ink uppercase">
                      {event.contact.name}
                    </p>
                    <a
                      href={`mailto:${event.contact.email}`}
                      className="text-ink-60 hover:text-ink underline block mt-0.5"
                    >
                      {event.contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile Sticky Bottom CTA Bar */}
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 sm:hidden flex items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-[10px] font-bold text-amber-600 block">
              ⚡ {event.seatsLeft} SEATS REMAINING
            </span>
            <span className="font-display font-bold text-base text-slate-900 truncate max-w-[180px] block">
              {event.title}
            </span>
          </div>

          <Button
            size="sm"
            variant="gradient"
            arrow
            disabled={!isRegistrationOpen}
            onClick={() => setIsTierModalOpen(true)}
          >
            Book Pass
          </Button>
        </div>

        {/* BookMyShow Ticket Tier Selector Modal */}
        <TicketTierModal
          isOpen={isTierModalOpen}
          onClose={() => setIsTierModalOpen(false)}
          event={event}
        />
      </div>
    </EventTheme>
  )
}
