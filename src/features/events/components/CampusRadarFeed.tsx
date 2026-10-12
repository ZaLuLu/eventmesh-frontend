import React from 'react'
import { Link } from 'react-router-dom'
import { Radio, Users, MapPin, Clock, ArrowRight, ShieldCheck, Sparkles, Activity } from 'lucide-react'

export interface RadarVenue {
  id: string
  venueName: string
  eventTitle: string
  eventSlug: string
  status: 'live' | 'doors_open' | 'upcoming'
  statusLabel: string
  attendeeCount: number
  capacityPercent: number
  gateCode: string
  timeNote: string
  accentColor: string
}

const LIVE_VENUES: RadarVenue[] = [
  {
    id: 'venue-1',
    venueName: 'Tech Park Hall A & Mainstage',
    eventTitle: 'The Grand Turing Hackathon 2026',
    eventSlug: 'grand-turing-hackathon-2026',
    status: 'live',
    statusLabel: 'LIVE IN SESSION · 48H BUILD',
    attendeeCount: 382,
    capacityPercent: 96,
    gateCode: 'GATE 01 EAST',
    timeNote: 'Sprint 2 Code Freeze in 3h 40m',
    accentColor: '#10B981',
  },
  {
    id: 'venue-2',
    venueName: 'Central University Auditorium',
    eventTitle: 'Neural Frontiers Research Symposium',
    eventSlug: 'neural-frontiers-research-symposium',
    status: 'doors_open',
    statusLabel: 'DOORS OPEN · KIOSKS SCANNING',
    attendeeCount: 240,
    capacityPercent: 80,
    gateCode: 'GATE 03 NORTH',
    timeNote: 'Keynote begins in 24 mins',
    accentColor: '#6366F1',
  },
  {
    id: 'venue-3',
    venueName: 'Cyber Range Amphitheatre',
    eventTitle: 'Zero-Day Protocol Campus CTF',
    eventSlug: 'zero-day-protocol-ctf-2026',
    status: 'upcoming',
    statusLabel: 'TERMINAL SETUP · 12 SPOTS LEFT',
    attendeeCount: 176,
    capacityPercent: 88,
    gateCode: 'CYBER WING L2',
    timeNote: 'Challenge drops at 02:00 PM',
    accentColor: '#F59E0B',
  },
]

export const CampusRadarFeed: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <section
      aria-label="Campus Live Schedule"
      className={`w-full py-12 sm:py-16 relative ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unboxed Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-[#1A2E4C] mb-8">
          <div>
            <span className="text-xs font-mono text-sky-400 font-semibold tracking-wider block mb-1">
              02 // CAMPUS SCHEDULE · TODAY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Live Venues & Active Sessions
            </h2>
          </div>

          <p className="text-sm text-slate-400">
            Real-time venue check-ins across main campus halls
          </p>
        </div>

        {/* Frameless 3-Column Architectural Venue Schedule (Zero Boxes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {LIVE_VENUES.map((venue, idx) => (
            <Link
              key={venue.id}
              to={`/events/${venue.eventSlug}`}
              className="group flex flex-col justify-between border-l border-[#1A2E4C] pl-5 sm:pl-6 hover:border-sky-400 transition-colors duration-200"
            >
              <div>
                {/* Gate & Status Row */}
                <div className="flex items-center justify-between gap-2 mb-3 text-xs font-mono">
                  <span className="text-sky-400 font-medium">
                    {venue.gateCode}
                  </span>
                  <span className="text-slate-400 text-[11px] uppercase tracking-wide">
                    {venue.statusLabel}
                  </span>
                </div>

                {/* Event Title */}
                <h3 className="font-bold text-lg sm:text-xl text-white group-hover:text-sky-300 transition-colors leading-snug tracking-tight mb-2">
                  {venue.eventTitle}
                </h3>

                {/* Venue Name */}
                <p className="flex items-center gap-2 text-sm text-slate-300 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>{venue.venueName}</span>
                </p>
              </div>

              {/* Progress & Time Info (Open, Unboxed) */}
              <div className="space-y-2 pt-3 border-t border-[#1A2E4C]/60 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>
                    <strong className="text-white">{venue.attendeeCount}</strong> checked in
                  </span>
                  <span className="text-slate-300 font-mono">{venue.capacityPercent}% capacity</span>
                </div>

                {/* Matte Minimal Line */}
                <div className="w-full h-1 bg-[#1A2E4C] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-400 transition-all duration-300"
                    style={{ width: `${venue.capacityPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{venue.timeNote}</span>
                  </span>
                  <span className="font-semibold text-sky-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Event</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
