'use client'

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CaretLeft, CaretRight, Sparkle, CalendarBlank, MapPin, ArrowRight } from '@/design-system/Icon'
import { Event } from '@/api/contracts/event'
import { formatDate, formatTime } from '@/lib/format'
import { EventLink } from './EventLink'
import { PosterArt } from './visuals/PosterArt'

export interface PanoramicHeroCarouselProps {
  events?: Event[]
  className?: string
}

/**
 * PanoramicHeroCarousel
 * Side-by-side sliding carousel for flagship featured events.
 * Features:
 * - True horizontal side-by-side slide track with smooth hardware-accelerated transitions.
 * - Responsive touch swipe gestures for mobile and tablet.
 * - Clean navigation controls with dedicated bottom controls and pagination.
 * - Keyboard navigation (Left / Right arrow keys).
 * - Full responsive typography preventing collision or overflow.
 */
export const PanoramicHeroCarousel: React.FC<PanoramicHeroCarouselProps> = ({
  events = [],
  className = '',
}) => {
  const slides = useMemo(() => {
    const featured = events.filter((e) => e.isSignature || e.promotion?.label || e.banner || e.poster)
    return (featured.length ? featured : events).slice(0, 6)
  }, [events])

  const [activeIndex, setActiveIndex] = useState(0)
  const count = slides.length
  const safeIndex = count ? ((activeIndex % count) + count) % count : 0

  const move = useCallback(
    (delta: number) => {
      if (!count) return
      setActiveIndex((prev) => (prev + delta + count) % count)
    },
    [count]
  )

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      move(1)
    }
  }

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchEndX.current = null
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 50) {
      move(1) // swipe left -> next
    } else if (diff < -50) {
      move(-1) // swipe right -> prev
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  // Subtle auto-advance every 6s, pauses on hover
  const [isPaused, setIsPaused] = useState(false)
  useEffect(() => {
    if (count <= 1 || isPaused) return
    const timer = setInterval(() => {
      move(1)
    }, 6000)
    return () => clearInterval(timer)
  }, [count, isPaused, move])

  if (count === 0) {
    return (
      <div className="w-full py-12 text-center border-b border-line bg-canvas">
        <p className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">Campus Stage</p>
        <p className="mt-2 text-ink-soft text-sm">Featured productions will appear here.</p>
      </div>
    )
  }

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Flagship featured campus productions"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden bg-card border-b border-line select-none py-4 sm:py-6 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6">
        {/* Main Sliding Viewport Frame */}
        <div
          className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-black shadow-xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Side-by-side sliding track */}
          <div
            className="flex w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${safeIndex * 100}%)` }}
          >
            {slides.map((event, idx) => (
              <div
                key={event.id || idx}
                className="relative w-full flex-shrink-0 h-[360px] sm:h-[400px] md:h-[440px] overflow-hidden"
                aria-hidden={idx !== safeIndex}
              >
                {/* Background Artwork */}
                <div className="absolute inset-0 overflow-hidden bg-black">
                  {event.banner || event.poster ? (
                    <img
                      src={event.banner || event.poster}
                      alt={event.title}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <PosterArt
                      eventId={event.id}
                      title={event.title}
                      category={event.category}
                      clubId={event.organizerId}
                    />
                  )}
                  {/* Directional Gradient Scrim for Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 sm:bg-gradient-to-r sm:from-black/95 sm:via-black/65 sm:to-black/25" />
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-8 md:p-10 text-white max-w-2xl">
                  {/* Category & Status Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-accent text-white shadow-xs">
                      <Sparkle size={12} weight="fill" />
                      {event.promotion?.label || event.category || 'Featured Show'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {event.club?.name || event.organizerName || 'Campus Premiere'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm line-clamp-2">
                    {event.title}
                  </h2>

                  {/* Date & Venue */}
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-white/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CalendarBlank size={15} className="text-accent" weight="bold" />
                      <span>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-accent" weight="bold" />
                      <span className="truncate max-w-[220px] sm:max-w-none">{event.venue?.name || (event.isOnline ? 'Online Session' : 'Main Auditorium')}</span>
                    </span>
                  </div>

                  {/* CTAs */}
                  <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
                    <EventLink
                      event={event}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                    >
                      <span>Explore Show</span>
                      <ArrowRight size={15} weight="bold" />
                    </EventLink>

                    <Link
                      to={`/events/${event.slug || event.id}/register`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
                    >
                      <span>Reserve Pass</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Carousel Pagination Controls, Chevrons & Segmented Indicators */}
        {count > 1 && (
          <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === safeIndex
                      ? 'w-7 sm:w-9 bg-accent'
                      : 'w-2 sm:w-2.5 bg-line-strong hover:bg-ink-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-muted font-medium pr-1">
                {safeIndex + 1} / {count}
              </span>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous featured event"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-card hover:bg-surface-subtle text-ink shadow-xs transition-transform active:scale-90"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next featured event"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-card hover:bg-surface-subtle text-ink shadow-xs transition-transform active:scale-90"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
