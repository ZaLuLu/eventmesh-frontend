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
 * Hallmark & Denim Dept Stage (Phase 5):
 * - User-directed editorial cover-stage (Gate 33: eliminated auto-advancing setInterval slop).
 * - Solitary 14px outer radius (Gate 22).
 * - 100% solid surfaces and zero frosted glass (Gate 4: eliminated backdrop-blur).
 * - Tactile chevrons and segmented progress tracks.
 * - Keyboard (ArrowLeft/ArrowRight) and touch-drag support via Embla.
 */
export const PanoramicHeroCarousel: React.FC<PanoramicHeroCarouselProps> = ({
  events = [],
  className = '',
}) => {
  const slides = useMemo(() => {
    const featured = events.filter((e) => e.isSignature || e.promotion?.label || e.banner || e.poster)
    return (featured.length ? featured : events).slice(0, 3)
  }, [events])

  const count = slides.length

  // Initialize Embla with center alignment for peeking adjacent slides
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
    containScroll: false,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)

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

  // Navigation handlers (100% user-directed, zero auto-advancing interval)
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
      <div className="w-full py-12 text-center border-b border-line bg-card">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent font-semibold">Campus Stage</p>
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
      className={`relative w-full overflow-hidden bg-card border-b border-line select-none py-4 sm:py-6 ${className}`}
    >
      {/* Full-Width Embla Viewport Frame */}
      <div ref={emblaRef} className="w-full overflow-hidden">
        {/* Slide Track */}
        <div className="flex">
          {slides.map((event, idx) => {
            const isActive = idx === selectedIndex
            return (
              <div
                key={event.id || idx}
                onClick={() => {
                  if (!isActive) scrollTo(idx)
                }}
                className={`relative flex-[0_0_88%] sm:flex-[0_0_80%] lg:flex-[0_0_72%] xl:flex-[0_0_68%] min-w-0 px-2 sm:px-3 lg:px-4 transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-100' : 'opacity-65 hover:opacity-90 scale-[0.98] cursor-pointer'
                }`}
                aria-hidden={!isActive}
              >
                {/* Solitary 14px Card Container (Zero nested radii, zero blur) */}
                <div className="relative h-[340px] sm:h-[400px] md:h-[450px] w-full overflow-hidden rounded-[14px] border border-line bg-black shadow-md">
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
                        aspectRatio="video"
                        className="h-full w-full"
                      />
                    )}
                    {/* Directional Gradient Scrim for Contrast & Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/20 sm:bg-gradient-to-r sm:from-black/95 sm:via-black/65 sm:to-black/25" />
                  </div>

                  {/* Content Overlay */}
                  <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-8 md:p-10 text-white max-w-2xl">
                    {/* Category & Club Tags (100% Solid Opaque, 4px radius) */}
                    <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[10px] sm:text-[11px] font-bold font-mono tracking-wider uppercase bg-accent text-white shadow-xs">
                        <Sparkle size={12} weight="fill" />
                        {event.promotion?.label || event.category || 'Featured Show'}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] sm:text-xs font-mono uppercase tracking-wider bg-white/10 text-white border border-white/20">
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
                        <CalendarBlank size={14} className="text-accent" weight="bold" />
                        <span>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-accent" weight="bold" />
                        <span className="truncate max-w-[220px] sm:max-w-none">
                          {event.venue?.name || (event.isOnline ? 'Online Session' : 'Main Auditorium')}
                        </span>
                      </span>
                    </div>

                    {/* Action Buttons (Normalized 8px radius, zero glassmorphism) */}
                    <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
                      <EventLink
                        event={event}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-[8px] bg-accent hover:bg-accent-hover text-white font-mono font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                      >
                        <span>Explore Show</span>
                        <ArrowRight size={14} weight="bold" />
                      </EventLink>

                      <Link
                        to={`/events/${event.slug || event.id}/register`}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-[8px] bg-white text-zinc-950 hover:bg-zinc-100 font-mono font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                      >
                        <span>Reserve Pass</span>
                        <ArrowRight size={13} weight="bold" />
                      </Link>
                    </div>
                  </div>

                  {/* Peeking Badge for the Adjacent Card */}
                  {!isActive && (
                    <div className="absolute top-4 right-4 z-20 hidden sm:flex items-center gap-1 rounded-[4px] bg-black/80 px-2.5 py-1 border border-white/20 text-[10px] font-mono font-bold uppercase tracking-wider text-white">
                      <span>Up Next</span>
                      <ArrowRight size={11} weight="bold" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Carousel Bottom Control Bar: Segmented Tracks & Chevrons */}
      {count > 1 && (
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 mt-3 sm:mt-4">
          <div className="flex items-center justify-between gap-3">
            {/* Segmented Indicators */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                  className={`h-1.5 rounded-[2px] transition-all duration-300 ${
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
                className="grid h-8 w-8 place-items-center rounded-[8px] border border-line bg-card hover:bg-surface-subtle text-ink shadow-xs transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <CaretLeft size={16} weight="bold" />
              </button>
              <button
                type="button"
                onClick={scrollNext}
                aria-label="Next featured event"
                className="grid h-8 w-8 place-items-center rounded-[8px] border border-line bg-card hover:bg-surface-subtle text-ink shadow-xs transition-transform active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
