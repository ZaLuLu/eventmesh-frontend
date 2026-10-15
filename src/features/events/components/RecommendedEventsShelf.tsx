import { EventLink } from '@/design-system/EventLink'
import { eventPriceLabel } from '@/lib/eventPresentation'
import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Event } from '@/api/contracts/event'
import { formatDate } from '@/lib/format'
import { CaretRight, CaretLeft, Sparkle, ArrowRight } from '@/design-system/Icon'

export interface RecommendedEventsShelfProps {
  events?: Event[]
  title?: string
  subtitle?: string
  seeAllLink?: string
  className?: string
}

/**
 * RecommendedEventsShelf
 * Direct visual translation of BookMyShow's "Recommended Movies / Shows" row:
 * - 5-card desktop viewport with 2:3 vertical poster aspect ratio.
 * - Rating / popularity pill overlayed across the bottom of the poster image.
 * - Bold title + category metadata underneath.
 * - Floating side navigation chevron buttons for effortless horizontal browsing.
 */
export const RecommendedEventsShelf: React.FC<RecommendedEventsShelfProps> = ({
  events = [],
  title = 'Recommended Events',
  subtitle = 'Curated campus exhibitions, workshops, and championship competitions',
  seeAllLink = '/explore',
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -380 : 380
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  if (events.length === 0) return null

  // Helper to extract a crisp rating or highlight badge for each card
  const getEventBadge = (event: Event, idx: number) => {
    if (event.tags && event.tags.length > 0) {
      return event.tags[0]
    }
    return event.category || 'Event'
  }

  return (
    <section className={`w-full py-8 sm:py-12 bg-paper border-b border-line ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header: Title on Left, "See All ›" on Right */}
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-accent text-xs font-mono font-bold uppercase tracking-wider mb-1">
              <Sparkle size={13} weight="fill" />
              <span>Campus Premiere</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs sm:text-sm text-ink-soft hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>

          <Link
            to={seeAllLink}
            className="group inline-flex items-center gap-1 text-sm font-bold text-accent hover:text-accent/80 transition-colors flex-shrink-0"
          >
            <span>See All</span>
            <CaretRight size={15} weight="bold" className="transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 5-Card Rail Container with Side Arrows */}
        <div className="relative group">
          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            className="hidden md:grid absolute -left-4 top-[40%] -translate-y-1/2 z-20 h-10 w-10 place-items-center rounded-full bg-surface/90 hover:bg-surface text-ink border border-line-strong shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
          >
            <CaretLeft size={18} weight="bold" />
          </button>

          {/* Horizontal Poster Rail (5 visible on 1280px+ desktop, 4 on 1024px, 3 on 768px, 2 on mobile) */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event, idx) => (
              <EventLink
                key={event.id || idx}
                event={event}
                className="group flex-shrink-0 w-[44%] sm:w-[30%] md:w-[22%] lg:w-[18.2%] snap-start focus:outline-hidden"
              >
                {/* 2:3 Aspect Ratio Card Poster Frame */}
                <div className="relative w-full aspect-[2/3] rounded-xl sm:rounded-2xl overflow-hidden bg-paper-3 border border-line shadow-xs group-hover:shadow-md group-hover:border-line-strong transition-all duration-300">
                  <img
                    src={event.poster || event.banner || '/images/events/demo-cyberpulse.jpg'}
                    alt={event.title}
                    className="h-full w-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Top Category Badge (100% Solid Opaque) */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-card text-ink border border-line shadow-xs">
                      {event.category || 'Event'}
                    </span>
                  </div>

                  {/* Bottom Rating/Trending Banner (BookMyShow Signature Bar) */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-6 pb-2.5 px-2.5 text-white">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                      <span>{getEventBadge(event, idx)}</span>
                    </div>
                  </div>
                </div>

                {/* Typography & Metadata Underneath */}
                <div className="mt-2.5 space-y-1">
                  <h3 className="font-semibold text-sm sm:text-base text-ink line-clamp-1 group-hover:text-accent transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="truncate max-w-[120px]">{event.club?.name || 'Technical Society'}</span>
                    <span className="font-mono text-[11px] font-semibold text-ink-soft">
                      {formatDate(event.startsAt, 'compact')}
                    </span>
                  </div>
                </div>
              </EventLink>
            ))}
          </div>

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            className="hidden md:grid absolute -right-4 top-[40%] -translate-y-1/2 z-20 h-10 w-10 place-items-center rounded-full bg-surface/90 hover:bg-surface text-ink border border-line-strong shadow-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
          >
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  )
}
