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
      aria-label="Campus Live Radar Feed"
      className={`w-full py-10 sm:py-14 relative overflow-hidden ${className}`}
    >
      {/* Background Ambient Radar Waves */}
      <div className="absolute right-[-100px] top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-accent/10 pointer-events-none animate-pulse -z-0" />
      <div className="absolute right-[-40px] top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-emerald-500/10 pointer-events-none -z-0" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Live Radar Pill */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[11px] font-mono font-bold uppercase tracking-wider mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>CAMPUS RADAR · HAPPENING TODAY</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight font-sans">
              Real-Time Campus Energy & Venues
            </h2>
          </div>

          <div className="flex items-center gap-3 text-caption text-text-2">
            <span className="flex items-center gap-1.5 font-mono">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span>Gate attendance active across 3 venues</span>
            </span>
          </div>
        </div>

        {/* 3-Column Tactical Venue Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {LIVE_VENUES.map((venue) => (
            <Link
              key={venue.id}
              to={`/events/${venue.eventSlug}`}
              className="group relative p-5 sm:p-6 rounded-2xl bg-surface/60 backdrop-blur-md border border-line/60 hover:border-accent/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Top Status & Gate Bar */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border"
                    style={{
                      backgroundColor: `${venue.accentColor}15`,
                      color: venue.accentColor,
                      borderColor: `${venue.accentColor}30`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: venue.accentColor }}
                    />
                    {venue.statusLabel}
                  </span>

                  <span className="text-[10px] font-mono text-text-2 bg-subtle px-2 py-0.5 rounded border border-line">
                    {venue.gateCode}
                  </span>
                </div>

                {/* Event Headline */}
                <h3 className="font-bold text-base sm:text-lg text-text group-hover:text-accent transition-colors leading-snug tracking-tight mb-1.5 line-clamp-1">
                  {venue.eventTitle}
                </h3>

                {/* Venue Location */}
                <p className="flex items-center gap-1.5 text-caption text-text-2 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                  <span className="truncate">{venue.venueName}</span>
                </p>
              </div>

              {/* Bottom Telemetry & Capacity Progress */}
              <div className="space-y-2 pt-3 border-t border-line/60">
                <div className="flex items-center justify-between text-[11px] font-mono text-text-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <strong className="text-text">{venue.attendeeCount}</strong> checked in
                  </span>
                  <span className="font-semibold text-text">{venue.capacityPercent}% capacity</span>
                </div>

                {/* Mini Capacity Bar */}
                <div className="w-full h-1.5 rounded-full bg-subtle overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${venue.capacityPercent}%`,
                      backgroundColor: venue.accentColor,
                    }}
                  />
                </div>

                {/* Time & CTA Row */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-text-2 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-2" />
                    <span>{venue.timeNote}</span>
                  </span>
                  <span className="font-medium text-accent flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Gate</span>
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
