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
      className={`w-full py-12 sm:py-16 relative ${className}`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unboxed Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-[#E2E8F0] mb-8">
          <div>
            <span className="text-xs font-mono text-[#0047FF] font-semibold tracking-wider block mb-1">
              03 // DISCIPLINE TRACKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] tracking-tight font-sans">
              Explore by Subculture & Track
            </h2>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0047FF] hover:text-[#0037CC] transition-colors"
          >
            <span>Browse all categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Minimalist Architectural Tab Bar (No pill buttons, clean underlined text) */}
        <div className="flex items-center gap-8 overflow-x-auto pb-4 scrollbar-none mb-8 border-b border-[#E2E8F0]">
          {TRACKS.map((t) => {
            const Icon = t.icon
            const isActive = t.id === activeTrack
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTrack(t.id)}
                className={cn(
                  'flex items-center gap-2 pb-2 text-sm font-medium whitespace-nowrap transition-all duration-150 relative cursor-pointer',
                  isActive
                    ? 'text-[#0A0A0A] font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-[#0047FF]' : 'text-slate-400')} />
                <span>{t.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0047FF]" />
                )}
              </button>
            )
          })}
        </div>

        {/* Unboxed Track Showcase Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-8">
          {/* Left 4 cols: Open Editorial Profile (No Box) */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-mono text-[#0047FF] uppercase tracking-wider block">
              {currentDef.badge}
            </span>

            <h3 className="text-2xl sm:text-3xl font-bold text-[#0A0A0A] font-sans tracking-tight">
              {currentDef.label}
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              {currentDef.description}
            </p>

            <div className="pt-4 border-t border-[#E2E8F0] text-xs font-mono text-slate-500 flex items-center justify-between">
              <span>CAMPUS ACCREDITED</span>
              <span className="text-[#0047FF] font-semibold">VERIFIED CLUBS</span>
            </div>
          </div>

          {/* Right 8 cols: Frameless Event Dossiers (Zero Card Boxes) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
            {displayEvents.map((evt) => (
              <Link
                key={evt.id}
                to={`/events/${evt.slug}`}
                className="group border-t border-[#E2E8F0] pt-4 hover:border-[#0047FF] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs font-mono">
                    <span className="text-[#0047FF] font-medium uppercase tracking-wider">
                      {evt.category || 'FEATURED'}
                    </span>
                    <span className="text-emerald-600 font-semibold">
                      {evt.isFree ? 'FREE ADMISSION' : evt.price ? `₹${evt.price}` : 'RSVP OPEN'}
                    </span>
                  </div>

                  <h4 className="font-bold text-base sm:text-lg text-[#0A0A0A] group-hover:text-[#0047FF] transition-colors line-clamp-2 tracking-tight leading-snug mb-3">
                    {evt.title}
                  </h4>

                  <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-2 truncate">
                      <Calendar className="w-3.5 h-3.5 text-[#0047FF] shrink-0" />
                      <span>{formatDate(evt.startsAt, 'EEE, MMM d · h:mm a')}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.venue?.name || (evt as any).venueName || 'Main Campus'}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#0047FF]" />
                    <span><strong className="text-[#0A0A0A]">{evt.registrationsCount || 140}</strong> registered</span>
                  </div>
                  <span className="font-semibold text-[#0047FF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Event</span>
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
