import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarBlank,
  MapPin,
  Ticket,
  ArrowUpRight,
  Sparkle,
} from '@/design-system/Icon'
import { Event, EventType } from '@/api/contracts'
import { PosterArtwork } from '@/design-system/PosterArtwork'
import { formatDate, formatTime } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import { cn } from '@/lib/utils'

export interface EventShowcaseGridProps {
  events: Event[]
  title?: string
  subtitle?: string
  showCategoryFilters?: boolean
  selectedCategory?: string
  onSelectCategory?: (category: string) => void
  isLoading?: boolean
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Sessions' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'competition', label: 'Competitions' },
  { id: 'talk', label: 'Talks' },
]

export const EventShowcaseCard: React.FC<{ event: Event }> = ({ event }) => {
  const clubId = event.organizerId || (event as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = event.isFree ?? (!event.price || event.price === 0)

  return (
    <article className="group relative flex flex-col bg-card rounded-2xl border border-purple-200/60 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-xl hover:shadow-purple-950/5 transition-all duration-200 overflow-hidden select-none">
      <Link to={`/events/${event.slug}`} className="block focus:outline-none">
        {/* Card Artwork Header */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-subtle">
          <PosterArtwork
            id={event.id}
            title={event.title}
            category={event.category}
            clubName={event.club?.name || event.organizerName}
            clubColor={clubTheme.hex}
            imageUrl={event.poster}
            aspectRatio="16/10"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />

          {/* Overlaid Category Pill */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-sm shadow-purple-600/30">
              {event.category || 'SESSION'}
            </span>
            {event.isSignature && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] font-bold uppercase shadow-xs">
                ★
              </span>
            )}
          </div>

          {/* Pricing indicator */}
          <div className="absolute bottom-3 right-3 z-10">
            <span
              className={cn(
                'px-2.5 py-1 rounded-full font-mono text-[11px] font-bold shadow-sm',
                isFree
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 text-white'
              )}
            >
              {isFree ? 'FREE ENTRY' : `₹${event.price}`}
            </span>
          </div>
        </div>

        {/* Card Body & Metadata */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            {/* Club + Date line */}
            <div className="flex items-center justify-between text-xs font-mono text-ink-soft">
              <div className="flex items-center gap-1.5 truncate pr-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: clubTheme.hex || 'var(--accent)' }}
                  aria-hidden="true"
                />
                <span className="truncate font-semibold text-ink">
                  {event.club?.name || event.organizerName || 'Campus Society'}
                </span>
              </div>
              <span className="text-ink-muted flex-shrink-0">
                {new Date(event.startsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-sans font-bold text-base text-ink tracking-tight line-clamp-2 leading-snug group-hover:text-accent transition-colors">
              {event.title}
            </h3>

            {/* Subtitle / summary */}
            {event.subtitle && (
              <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                {event.subtitle}
              </p>
            )}
          </div>

          {/* Venue & Action Footer */}
          <div className="pt-3 border-t border-line/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-ink-muted truncate font-mono text-[11px] pr-2">
              <MapPin size={13} weight="bold" className="text-accent flex-shrink-0" />
              <span className="truncate">{event.venue?.name || 'Campus Venue'}</span>
            </div>

            <span className="inline-flex items-center gap-1 font-sans font-semibold text-accent text-xs group-hover:translate-x-0.5 transition-transform flex-shrink-0">
              <span>View Pass</span>
              <ArrowUpRight size={13} weight="bold" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}

/**
 * EventShowcaseGrid:
 * Showcase grid adapting @reactbits-pro/showcase-4 layout patterns with interactive category pills.
 */
export const EventShowcaseGrid: React.FC<EventShowcaseGridProps> = ({
  events,
  title = 'Featured Event Showcase',
  subtitle,
  showCategoryFilters = true,
  selectedCategory,
  onSelectCategory,
  isLoading = false,
}) => {
  const [internalCategory, setInternalCategory] = useState('all')
  const activeCat = selectedCategory !== undefined ? selectedCategory : internalCategory

  const handleCategoryChange = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat)
    } else {
      setInternalCategory(cat)
    }
  }

  const filteredEvents = activeCat === 'all'
    ? events
    : events.filter((e) => (e.category || '').toLowerCase() === activeCat.toLowerCase())

  return (
    <div className="w-full space-y-8 select-none">
      {/* Header and Optional Category Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-line">
        <div>
          <h2 className="font-sans font-bold text-2xl text-ink tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-ink-soft mt-1 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {showCategoryFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCat === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryChange(tab.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-purple-600 text-white font-semibold shadow-sm shadow-purple-600/30'
                      : 'bg-surface-subtle hover:bg-purple-100/70 dark:hover:bg-purple-950/40 text-ink-soft hover:text-purple-600'
                  )}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Grid or Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-80 rounded-2xl bg-surface-subtle animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-surface-subtle border border-line/60 space-y-3">
          <p className="font-sans font-bold text-base text-ink">No events in this category yet</p>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            Try switching categories or open the discovery drawer to filter across other campus collectives.
          </p>
          <button
            type="button"
            onClick={() => handleCategoryChange('all')}
            className="btn-minimal-secondary px-4 py-1.5 text-xs font-medium mt-2"
          >
            Show All Sessions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventShowcaseCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

export default EventShowcaseGrid
