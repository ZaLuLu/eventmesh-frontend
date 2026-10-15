'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import useEmblaCarousel from 'embla-carousel-react'
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
 * Infinite loop carousel with peeking next-event poster and 4-second auto-scroll.
 * Features:
 * - True infinite wrapping powered by Embla Carousel.
 * - Next slide visibly peeking beside the active slide to spark user curiosity.
 * - 4-second automatic advancement with hover/touch pause.
 * - Clicking the peeking slide glides it directly into full view.
 * - Obstruction-free bottom controls with indicators, index counter, and tactile chevrons.
 */
export const PanoramicHeroCarousel: React.FC<PanoramicHeroCarouselProps> = ({
  events = [],
  className = '',
}) => {
  const slides = useMemo(() => {
    const featured = events.filter((e) => e.isSignature || e.promotion?.label || e.banner || e.poster)
    return (featured.length ? featured : events).slice(0, 6)
  }, [events])

  const count = slides.length

  // Initialize Embla with infinite loop and start-alignment for the next card peek
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    skipSnaps: false,
    containScroll: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Sync selected index with Embla
  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // 4-second auto-scroll, pauses on mouse enter or touch interaction
  useEffect(() => {
    if (!emblaApi || count <= 1 || isPaused) return
    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [emblaApi, count, isPaused])

  // Navigation handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index)
    },
    [emblaApi]
  )

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      scrollPrev()
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      scrollNext()
    }
  }

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
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden bg-card border-b border-line select-none py-4 sm:py-6 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6">
        {/* Embla Viewport Frame */}
        <div ref={emblaRef} className="overflow-hidden">
          {/* Infinite Slide Track */}
          <div className="flex">
            {slides.map((event, idx) => {
              const isActive = idx === selectedIndex
              return (
                <div
                  key={event.id || idx}
                  onClick={() => {
                    if (!isActive) scrollTo(idx)
                  }}
                  className={`relative flex-[0_0_86%] sm:flex-[0_0_82%] lg:flex-[0_0_80%] min-w-0 pr-3 sm:pr-4 md:pr-5 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-75 hover:opacity-95 cursor-pointer'
                  }`}
                  aria-hidden={!isActive}
                >
                  {/* Card Container */}
                  <div className="relative h-[360px] sm:h-[400px] md:h-[440px] w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-line bg-black shadow-lg">
                    {/* Background Artwork */}
                    <div className="absolute inset-0 overflow-hidden bg-black">
                      {event.banner || event.poster ? (
                        <img
                          src={event.banner || event.poster}
                          alt={event.title}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          className="h-full w-full object-cover object-center transform transition-transform duration-700 ease-out hover:scale-102"
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

                    {/* Content Overlay */}
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
                          <span className="truncate max-w-[220px] sm:max-w-none">
                            {event.venue?.name || (event.isOnline ? 'Online Session' : 'Main Auditorium')}
                          </span>
                        </span>
                      </div>

                      {/* Action Buttons */}
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

                    {/* Peeking Badge for the Next Card */}
                    {!isActive && (
                      <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 border border-white/20 text-[11px] font-semibold text-white/90">
                        <span>Up Next</span>
                        <ArrowRight size={12} weight="bold" />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Carousel Bottom Control Bar: Indicators & Chevrons */}
        {count > 1 && (
          <div className="mt-3 sm:mt-4 flex items-center justify-between gap-3 px-1">
            {/* Segmented Dots */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === selectedIndex
                      ? 'w-7 sm:w-9 bg-accent'
                      : 'w-2 sm:w-2.5 bg-line-strong hover:bg-ink-muted'
                  }`}
                />
              ))}
            </div>

            {/* Counter and Chevrons */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-muted font-medium pr-1">
                {selectedIndex + 1} / {count}
              </span>
              <button
                type="button"
                onClick={scrollPrev}
                aria-label="Previous featured event"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-card hover:bg-surface-subtle text-ink shadow-xs transition-transform active:scale-90"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
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
