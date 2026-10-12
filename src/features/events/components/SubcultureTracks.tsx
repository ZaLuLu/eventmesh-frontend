import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Terminal, Cpu, Sparkles, Wrench, Trophy, Award, ArrowRight, Calendar, Users, MapPin } from 'lucide-react'
import { Event } from '@/api/contracts'
import { formatDate } from '@/lib/dates'
import { cn } from '@/lib/utils'

export interface SubcultureTracksProps {
  events: Event[]
  className?: string
}

interface TrackDef {
  id: string
  label: string
  badge: string
  description: string
  icon: React.ElementType
  categoryMatch: string[]
  accentColor: string
}

const TRACKS: TrackDef[] = [
  {
    id: 'builds',
    label: 'Builds & Hackathons',
    badge: 'HIGH STAKES · 48H SPRINTS',
    description: 'Autonomous coding sprints, algorithmic battles, and systems engineering summits with major prize pools.',
    icon: Terminal,
    categoryMatch: ['hackathon', 'tech', 'coding', 'cybersecurity'],
    accentColor: '#10B981',
  },
  {
    id: 'research',
    label: 'Research & Keynotes',
    badge: 'ACADEMIC EXCELLENCE · PAPERS',
    description: 'Peer-reviewed symposiums, IEEE/ACM research tracks, and distinguished guest scientist keynotes.',
    icon: Cpu,
    categoryMatch: ['research', 'symposium', 'academic', 'conference'],
    accentColor: '#6366F1',
  },
  {
    id: 'cultural',
    label: 'Cultural & Pro-Nights',
    badge: 'MAIN ARENA · LIVE ENERGY',
    description: 'Campus headliners, orchestral showcases, performing arts festivals, and collegiate celebration nights.',
    icon: Sparkles,
    categoryMatch: ['cultural', 'arts', 'music', 'social'],
    accentColor: '#EC4899',
  },
  {
    id: 'workshops',
    label: 'Workshops & Labs',
    badge: 'HANDS-ON · CERTIFICATE INCLUDED',
    description: 'Hardware fabrication, AI fine-tuning bootcamps, and career accelerators led by industry engineers.',
    icon: Wrench,
    categoryMatch: ['workshop', 'bootcamp', 'training', 'hands-on'],
    accentColor: '#F59E0B',
  },
]

export const SubcultureTracks: React.FC<SubcultureTracksProps> = ({ events, className = '' }) => {
  const [activeTrack, setActiveTrack] = useState<string>('builds')

  const currentDef = TRACKS.find((t) => t.id === activeTrack) || TRACKS[0]

  // Filter events belonging to this track
  const trackEvents = events
    .filter((e) => {
      const cat = (e.category || '').toLowerCase()
      const title = (e.title || '').toLowerCase()
      return currentDef.categoryMatch.some((m) => cat.includes(m) || title.includes(m))
    })
    .slice(0, 4)

  // Fallback to top events if track has fewer matches
  const displayEvents = trackEvents.length >= 2 ? trackEvents : events.slice(0, 3)

  return (
    <section
      aria-label="Campus Subculture Tracks"
      className={`w-full py-10 sm:py-14 relative ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[11px] font-bold font-mono text-accent uppercase tracking-wider block mb-1">
              CURATED CAMPUS TRACKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight font-sans">
              Explore by Subculture & Discipline
            </h2>
            <p className="text-small text-text-2 mt-1 max-w-xl">
              Campus life moves across distinct creative wavelengths. Select a track to dive into targeted collectives.
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-small font-semibold text-accent hover:gap-2 transition-all shrink-0"
          >
            <span>Browse all categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Track Segmented Selector Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-8 border-b border-line/40">
          {TRACKS.map((t) => {
            const Icon = t.icon
            const isActive = t.id === activeTrack
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTrack(t.id)}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-small whitespace-nowrap transition-all duration-150',
                  isActive
                    ? 'bg-text text-bg shadow-md font-semibold'
                    : 'bg-subtle text-text-2 hover:text-text hover:bg-subtle/80'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-bg' : 'text-text-2')} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Track Banner & Editorial Dossier */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-8">
          {/* Left 4 cols: Thematic Track Profile */}
          <div
            className="lg:col-span-4 p-6 rounded-2xl border flex flex-col justify-between backdrop-blur-md"
            style={{
              backgroundColor: `${currentDef.accentColor}08`,
              borderColor: `${currentDef.accentColor}25`,
            }}
          >
            <div className="space-y-4">
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider border"
                style={{
                  backgroundColor: `${currentDef.accentColor}15`,
                  color: currentDef.accentColor,
                  borderColor: `${currentDef.accentColor}30`,
                }}
              >
                {currentDef.badge}
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-text font-sans tracking-tight">
                {currentDef.label}
              </h3>

              <p className="text-small text-text-2 leading-relaxed">
                {currentDef.description}
              </p>
            </div>

            <div className="pt-6 border-t border-line/60 mt-6 flex items-center justify-between text-caption font-mono text-text-2">
              <span>ACTIVE GATES: VERIFIED</span>
              <span className="font-bold text-text">COLLEGIATE ACCREDITED</span>
            </div>
          </div>

          {/* Right 8 cols: Curated Event Dossier Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/events/${evt.slug}`}
                className="group p-5 sm:p-6 rounded-2xl bg-surface/60 backdrop-blur-md border border-line/60 hover:border-accent/40 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Event Category & Price Row */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold font-mono text-accent uppercase tracking-wider bg-accent-soft px-2 py-0.5 rounded">
                      {evt.category || 'FEATURED'}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 font-mono">
                      {evt.isFree ? 'FREE ADMISSION' : evt.price ? `₹${evt.price}` : 'RSVP OPEN'}
                    </span>
                  </div>

                  {/* Event Title */}
                  <h4 className="font-bold text-base text-text group-hover:text-accent transition-colors line-clamp-2 tracking-tight leading-snug mb-2">
                    {evt.title}
                  </h4>

                  {/* Logistics Snippet */}
                  <div className="space-y-1 text-caption text-text-2">
                    <p className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{formatDate(evt.startsAt, 'EEE, MMM d · h:mm a')}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-accent shrink-0" />
                      <span>{evt.venue?.name || (evt as any).venueName || 'Main Campus'}</span>
                    </p>
                  </div>
                </div>

                {/* Social Proof & Quick CTA */}
                <div className="pt-3 border-t border-line/60 mt-4 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-text-2">
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>{evt.registrationsCount || 140}</strong> passholders</span>
                  </div>
                  <span className="font-semibold text-accent flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
