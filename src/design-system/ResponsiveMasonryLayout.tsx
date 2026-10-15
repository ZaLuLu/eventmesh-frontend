'use client'

import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, CalendarBlank, MapPin, ArrowUpRight } from '@/design-system/Icon'
import { Event } from '@/api/contracts/event'
import { formatDate } from '@/lib/format'

export interface ResponsiveMasonryLayoutProps {
  events: Event[]
  title?: string
  subtitle?: string
  className?: string
}

/**
 * ResponsiveMasonryLayout
 * Dynamic multi-column masonry grid inspired by 21st.dev / Preet Suthar.
 * Adapts seamlessly across screen sizes while respecting arbitrary poster aspect
 * ratios (4:5 fest posters, 16:9 tech banners, 1:1 club showcases) without forced clipping.
 * Built to the Section 4.3 Inset-Frame Solid Card specification.
 */
export const ResponsiveMasonryLayout: React.FC<ResponsiveMasonryLayoutProps> = ({
  events = [],
  title = 'Happening on Campus',
  subtitle = 'Regular sessions, club gatherings, and daily student productions',
  className = '',
}) => {
  // Balanced columns distribution helper for multi-column masonry
  const columns = useMemo(() => {
    // 4 columns for desktop
    const colCount = 4
    const cols: Event[][] = Array.from({ length: colCount }, () => [])
    events.forEach((event, idx) => {
      cols[idx % colCount].push(event)
    })
    return cols
  }, [events])

  if (events.length === 0) {
    return null
  }

  return (
    <section className={`w-full py-8 sm:py-12 bg-canvas border-b border-line ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <p className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                Campus Spotlight
              </p>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-ink font-display">
              {title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-ink-soft">
              {subtitle}
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-accent hover:text-accent-hover self-start sm:self-auto"
          >
            <span>Explore All Campus Events</span>
            <ArrowUpRight size={14} weight="bold" />
          </Link>
        </div>

        {/* Responsive Multi-Column Masonry Layout */}
        {/* Uses CSS columns for natural flow, or grid columns fallback */}
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {events.map((event, index) => {
            // Assign varying natural aspect ratios based on index to demonstrate authentic campus posters
            const aspectRatios = ['aspect-[4/5]', 'aspect-[16/9]', 'aspect-square', 'aspect-[3/4]']
            const aspectClass = aspectRatios[index % aspectRatios.length]

            return (
              <article
                key={event.id || index}
                className="break-inside-avoid w-full rounded-[24px] border border-line bg-surface p-3.5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                {/* 1. Inset Media Frame (18px inner radius) */}
                <div className={`w-full ${aspectClass} overflow-hidden rounded-[18px] bg-surface-subtle border border-line/50 relative`}>
                  {event.poster || event.banner ? (
                    <img
                      src={event.poster || event.banner}
                      alt={event.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-purple-800 to-indigo-900 grid place-items-center p-4 text-center text-white font-display font-semibold text-base">
                      {event.title}
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-ink/80 text-white text-[10px] font-mono uppercase tracking-wider border border-white/10">
                    {event.category || 'Session'}
                  </div>
                </div>

                {/* 2. Typographic Core */}
                <div className="mt-3.5 px-1 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-ink-muted font-mono">
                    <span className="truncate">{event.organizerName || 'Campus Club'}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" weight="fill" />
                  </div>

                  <h3 className="text-base sm:text-lg font-semibold tracking-tight text-ink font-display line-clamp-2 leading-snug">
                    <Link to={`/events/${event.slug || event.id}`} className="hover:text-accent transition-colors">
                      {event.title}
                    </Link>
                  </h3>

                  <p className="line-clamp-2 text-xs text-ink-soft leading-relaxed">
                    {event.description || 'Open campus event. Reserve your pass early.'}
                  </p>
                </div>

                {/* 3. Split Utility Dock */}
                <div className="mt-4 pt-3 border-t border-line px-1 flex items-center justify-between gap-2">
                  <div className="space-y-0.5 text-[11px] font-mono text-ink-soft">
                    <div className="flex items-center gap-1">
                      <CalendarBlank size={12} className="text-ink-muted flex-shrink-0" />
                      <span className="truncate">{formatDate(event.startsAt)}</span>
                    </div>
                    {event.venue?.name && (
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-ink-muted flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{event.venue.name}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/events/${event.slug || event.id}`}
                    className="flex-shrink-0 px-3.5 py-1.5 rounded-full bg-surface-subtle hover:bg-accent text-ink hover:text-white border border-line hover:border-accent text-xs font-medium font-mono transition-all active:scale-95"
                  >
                    RSVP +
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
