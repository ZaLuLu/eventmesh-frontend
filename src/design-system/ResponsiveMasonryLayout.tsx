'use client'

import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CheckCircle,
  CalendarBlank,
  MapPin,
  ArrowRight,
  BookmarkSimple,
  Sparkle,
  X,
  Funnel,
} from '@/design-system/Icon'
import { Event } from '@/api/contracts/event'
import { formatDate, formatTime } from '@/lib/format'
import { eventPriceLabel } from '@/lib/eventPresentation'
import { EventLink } from '@/design-system/EventLink'
import { PosterArt } from '@/design-system/visuals/PosterArt'
import { getClubTheme } from '@/design-system/clubColors'
import { cn } from '@/lib/utils'

export interface ResponsiveMasonryLayoutProps {
  events: Event[]
  title?: string
  subtitle?: string
  className?: string

  // Filter State & Callbacks
  category?: string
  onCategoryChange?: (category: string) => void
  dateFilter?: string
  onDateFilterChange?: (date: string) => void
  freeOnly?: boolean
  onFreeOnlyChange?: (free: boolean) => void
  sortBy?: string
  onSortByChange?: (sort: string) => void
  totalCount?: number

  // Pagination & Loading
  isLoading?: boolean
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  onResetFilters?: () => void

  // Bookmarking
  onBookmark?: (eventId: string) => void
  bookmarkedIds?: Set<string>
}

const CATEGORIES = [
  { id: 'all', label: 'All Events' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'competition', label: 'Competitions' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'talk', label: 'Talks' },
  { id: 'club_events', label: 'Club Sessions' },
]

const DATE_PILLS = [
  { id: 'all', label: 'Any date' },
  { id: 'today', label: 'Today' },
  { id: 'this-weekend', label: 'This weekend' },
  { id: 'next-week', label: 'Next week' },
]

/**
 * ResponsiveMasonryLayout
 * Dynamic multi-column masonry grid showcasing high-visibility campus events.
 * Features:
 * - Respects authentic poster aspect ratios (16:10 banners, 4:5 posters, 1:1 workshop covers).
 * - High-visibility poster artwork with procedural PosterArt fallback (no generic AI gradients).
 * - Verified club badge with signature club accent color.
 * - Tabular calendar date block & campus venue indicator.
 * - Standardized purple CTA button: "Get Pass →".
 * - Integrated single-tap Category & Timing filter ribbon with reactive sorting.
 */
export const ResponsiveMasonryLayout: React.FC<ResponsiveMasonryLayoutProps> = ({
  events = [],
  title = 'Happening on Campus',
  subtitle = 'Regular club sessions, technical workshops, and campus championships',
  className = '',
  category = 'all',
  onCategoryChange,
  dateFilter = 'all',
  onDateFilterChange,
  freeOnly = false,
  onFreeOnlyChange,
  sortBy = 'date-asc',
  onSortByChange,
  totalCount,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onResetFilters,
  onBookmark,
  bookmarkedIds,
}) => {
  // Helper to determine natural aspect ratio per card based on category and ID hash
  const getPosterAspect = (cat?: string, id?: string) => {
    const c = (cat || '').toLowerCase()
    if (c.includes('hackathon') || c.includes('tech')) return 'aspect-[16/10]'
    if (c.includes('cultural') || c.includes('fest') || c.includes('night')) return 'aspect-[3/4]'
    if (c.includes('workshop') || c.includes('design')) return 'aspect-square'
    const hash = (id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const options = ['aspect-[16/10]', 'aspect-[4/5]', 'aspect-square', 'aspect-[3/4]']
    return options[hash % options.length]
  }

  const hasActiveFilters = category !== 'all' || dateFilter !== 'all' || freeOnly

  return (
    <section id="campus-events" className={`w-full py-8 sm:py-12 bg-canvas border-b border-line ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* 1. Section Header & Quick Links */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink font-display">
              {title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-soft">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {totalCount != null && (
              <span className="font-mono text-xs text-ink-muted hidden md:inline-block">
                {totalCount} total events
              </span>
            )}
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-hover whitespace-nowrap self-start sm:self-auto"
            >
              <span>Explore full directory</span>
              <ArrowRight size={13} weight="bold" />
            </Link>
          </div>
        </div>

        {/* 2. Single-Tap Category & Timing Filter Ribbon */}
        {(onCategoryChange || onDateFilterChange || onFreeOnlyChange) && (
          <div className="space-y-3 pt-1 pb-2 border-y border-line/60">
            {/* Category Ribbon */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {CATEGORIES.map((cat) => {
                const isActive = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onCategoryChange && onCategoryChange(cat.id)}
                    className={cn(
                      'whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex-shrink-0 border',
                      isActive
                        ? 'bg-accent text-white border-accent shadow-xs'
                        : 'bg-card text-ink border-line hover:border-line-strong hover:bg-surface-subtle'
                    )}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Sub-Filters: Date Pills, Free Toggle, Sort */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">When:</span>
                {DATE_PILLS.map((d) => {
                  const isActive = dateFilter === d.id
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => onDateFilterChange && onDateFilterChange(d.id)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-xs font-mono transition-colors border',
                        isActive
                          ? 'bg-ink text-paper border-ink font-bold'
                          : 'bg-card text-ink-soft border-line hover:bg-surface-subtle hover:text-ink'
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}

                {onFreeOnlyChange && (
                  <button
                    type="button"
                    onClick={() => onFreeOnlyChange(!freeOnly)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-mono transition-colors border ml-1',
                      freeOnly
                        ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                        : 'bg-card text-ink-soft border-line hover:bg-surface-subtle hover:text-ink'
                    )}
                  >
                    {freeOnly ? '✓ Free events only' : 'Free only'}
                  </button>
                )}
              </div>

              {/* Sort & Reset */}
              <div className="flex items-center gap-2">
                {hasActiveFilters && onResetFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-muted hover:text-ink underline"
                  >
                    <X size={12} weight="bold" />
                    <span>Reset filters</span>
                  </button>
                )}

                {onSortByChange && (
                  <select
                    value={sortBy}
                    onChange={(e) => onSortByChange(e.target.value)}
                    aria-label="Sort events"
                    className="bg-card border border-line rounded-lg px-2 py-1 text-xs font-mono text-ink focus:outline-none focus:border-accent"
                  >
                    <option value="date-asc">Soonest first</option>
                    <option value="date-desc">Latest first</option>
                    <option value="popular">Most popular</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. High-Visibility Multi-Column Masonry Showcase */}
        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="break-inside-avoid w-full rounded-2xl border border-line bg-card p-3 space-y-3 animate-pulse"
              >
                <div className="w-full h-48 rounded-xl bg-surface-subtle" />
                <div className="h-4 bg-surface-subtle rounded w-3/4" />
                <div className="h-3 bg-surface-subtle rounded w-1/2" />
                <div className="h-8 bg-surface-subtle rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="w-full py-16 text-center rounded-2xl border border-line bg-card p-8 space-y-3">
            <p className="text-base font-bold text-ink font-display">No events found matching your filter</p>
            <p className="text-xs text-ink-soft max-w-md mx-auto">
              Try choosing another category or timing filter, or view all upcoming events across campus.
            </p>
            {onResetFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="mt-2 px-4 py-1.5 rounded-full bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {events.map((event, index) => {
              const aspectClass = getPosterAspect(event.category, event.id)
              const clubId = event.organizerId || (event as any).clubId || 'club-cp'
              const clubTheme = getClubTheme(clubId)
              const isBookmarked = bookmarkedIds ? bookmarkedIds.has(event.id) : false
              const price = eventPriceLabel(event)

              return (
                <article
                  key={event.id || index}
                  className="break-inside-avoid mb-5 w-full rounded-2xl border border-line bg-card p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between"
                >
                  {/* Media Frame (High-Visibility Poster Showcase) */}
                  <div
                    className={cn(
                      'w-full overflow-hidden rounded-xl bg-surface-subtle border border-line/40 relative',
                      aspectClass
                    )}
                  >
                    {event.poster || event.banner ? (
                      <img
                        src={event.poster || event.banner}
                        alt={event.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                    ) : (
                      <PosterArt
                        eventId={event.id}
                        title={event.title}
                        category={event.category}
                        clubId={event.organizerId}
                      />
                    )}

                    {/* Category Pill Tag (100% Solid Opaque) */}
                    <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-1 rounded-full bg-card/95 backdrop-blur-xs text-ink text-[10px] font-mono font-bold uppercase tracking-wider border border-line shadow-xs">
                      {event.category || 'Session'}
                    </div>

                    {/* Bookmark Trigger */}
                    {onBookmark && (
                      <button
                        type="button"
                        onClick={() => onBookmark(event.id)}
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
                        className="absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-card/95 text-ink hover:text-accent border border-line shadow-xs transition-colors"
                      >
                        <BookmarkSimple size={15} weight={isBookmarked ? 'fill' : 'regular'} />
                      </button>
                    )}
                  </div>

                  {/* Typographic Core */}
                  <div className="mt-3.5 px-1 space-y-1.5 flex-1">
                    {/* Club / Organizer Host Row */}
                    <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: clubTheme.hex || 'var(--accent)' }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium">
                        {event.club?.name || event.organizerName || 'Campus Society'}
                      </span>
                      {event.club?.verified !== false && (
                        <CheckCircle size={13} weight="fill" className="text-emerald-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Event Title */}
                    <h3 className="text-base sm:text-lg font-bold tracking-tight text-ink font-display line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                      <EventLink event={event} className="hover:text-accent">
                        {event.title}
                      </EventLink>
                    </h3>

                    {/* Date & Time */}
                    <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono pt-0.5">
                      <CalendarBlank size={13} className="text-accent flex-shrink-0" />
                      <span className="truncate">
                        {formatDate(event.startsAt)} · {formatTime(event.startsAt)}
                      </span>
                    </div>

                    {/* Venue */}
                    {event.venue?.name && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <MapPin size={13} className="text-ink-muted flex-shrink-0" />
                        <span className="truncate">{event.venue.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Split Bottom Utility Dock */}
                  <div className="mt-4 pt-3 border-t border-line/60 px-1 flex items-center justify-between gap-2">
                    <div className="space-y-0.5 font-mono">
                      <span className="text-xs font-bold text-ink">
                        {price}
                      </span>
                      {event.seatsLeft != null && (
                        <p className="text-[10px] text-ink-muted">
                          {event.seatsLeft} left
                        </p>
                      )}
                    </div>

                    {/* Standardized Purple Primary CTA */}
                    <EventLink
                      event={event}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
                    >
                      <span>Get Pass</span>
                      <ArrowRight size={13} weight="bold" />
                    </EventLink>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* 4. Load More Events Trigger */}
        {hasMore && onLoadMore && (
          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-6 py-2.5 rounded-full border border-line bg-card hover:bg-surface-subtle font-mono text-xs font-semibold text-ink shadow-xs transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoadingMore ? 'Loading events...' : 'Load More Campus Events ↓'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
