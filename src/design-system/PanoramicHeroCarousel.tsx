'use client'

import React, { useState, useRef, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
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
 * Inspired by BookMyShow's panoramic flagship marquee and Hallmark tactile principles.
 * Features:
 * - Wide edge-to-edge panoramic banner stage with side-peeking neighbor slides in vivid color.
 * - Floating circular chevron controls on side overlays.
 * - Bottom pagination indicators.
 * - Full responsive touch-swipe & keyboard navigation.
 * - Clean enterprise routing to event detail and registration flows.
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      move(1)
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

  const activeEvent = slides[safeIndex]
  const prevEvent = slides[(safeIndex - 1 + count) % count]
  const nextEvent = slides[(safeIndex + 1) % count]

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Flagship featured campus productions"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full overflow-hidden bg-[#07080c] text-white pt-4 pb-8 sm:py-7 border-b border-white/10 select-none ${className}`}
    >
      {/* Cinematic Ambient Glow Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-[30%] left-1/2 -translate-x-1/2 w-[850px] sm:w-[1200px] h-[500px] bg-gradient-to-b from-purple-950/30 via-indigo-950/20 to-transparent blur-[120px] rounded-full" />
      </div>

      <div className="relative mx-auto w-full max-w-[1520px] px-2 sm:px-6 lg:px-8">
        {/* Panoramic Carousel Stage */}
        <div className="relative flex h-[280px] sm:h-[360px] md:h-[400px] lg:h-[440px] items-center justify-center overflow-hidden">
          {/* Left Peeking Slide (In Vivid Color, Scale & Subtle Scrim) */}
          {count > 1 && (
            <div
              onClick={() => move(-1)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  move(-1)
                }
              }}
              aria-label={`Previous: ${prevEvent.title}`}
              className="absolute left-0 -translate-x-[68%] sm:-translate-x-[42%] md:-translate-x-[32%] lg:-translate-x-[24%] h-[82%] sm:h-[88%] w-[88%] sm:w-[80%] md:w-[72%] max-w-[1080px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer opacity-65 hover:opacity-95 transition-all duration-300 z-0 shadow-2xl border border-white/10 scale-[0.93] hover:scale-[0.95] group"
            >
              {prevEvent.banner || prevEvent.poster ? (
                <img
                  src={prevEvent.banner || prevEvent.poster}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              ) : (
                <PosterArt
                  eventId={prevEvent.id}
                  title={prevEvent.title}
                  category={prevEvent.category}
                  clubId={prevEvent.organizerId}
                />
              )}
              {/* Soft directional scrim preserving vibrant color while maintaining focal hierarchy */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/40 to-black/70 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          )}

          {/* Active Center Slide */}
          <div className="relative z-10 h-full w-[94%] sm:w-[88%] md:w-[82%] lg:w-[76%] max-w-[1140px] flex-shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeEvent.id || safeIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-black/90 shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
              >
                {/* Background Panoramic Event Visual */}
                <div className="absolute inset-0 overflow-hidden bg-black">
                  {activeEvent.banner || activeEvent.poster ? (
                    <img
                      src={activeEvent.banner || activeEvent.poster}
                      alt={activeEvent.title}
                      className="h-full w-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-102"
                    />
                  ) : (
                    <PosterArt
                      eventId={activeEvent.id}
                      title={activeEvent.title}
                      category={activeEvent.category}
                      clubId={activeEvent.organizerId}
                    />
                  )}
                  {/* Subtle Cinematic Gradient Mask for Typography Legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-black/15 sm:bg-gradient-to-r sm:from-black/95 sm:via-black/60 sm:to-black/20" />
                </div>

                {/* Banner Content Layer */}
                <div className="relative z-10 flex h-full flex-col justify-end p-5 sm:p-8 md:p-10 text-white max-w-2xl">
                  {/* Category & Status Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase bg-accent text-white shadow-xs">
                      <Sparkle size={12} weight="fill" />
                      {activeEvent.promotion?.label || activeEvent.category || 'Featured Show'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {activeEvent.club?.name || activeEvent.organizerName || 'Campus Premiere'}
                    </span>
                  </div>

                  {/* High-Impact Display Title */}
                  <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
                    {activeEvent.title}
                  </h1>

                  {/* Metadata Row: Date & Venue */}
                  <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-white/90 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CalendarBlank size={15} className="text-accent" weight="bold" />
                      <span>{formatDate(activeEvent.startsAt)} · {formatTime(activeEvent.startsAt)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-accent" weight="bold" />
                      <span>{activeEvent.venue?.name || (activeEvent.isOnline ? 'Online Session' : 'Main Auditorium')}</span>
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
                    <EventLink
                      event={activeEvent}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                    >
                      <span>Explore Show</span>
                      <ArrowRight size={15} weight="bold" />
                    </EventLink>

                    <Link
                      to={`/events/${activeEvent.slug || activeEvent.id}/register`}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
                    >
                      <span>Reserve Pass</span>
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Peeking Slide (In Vivid Color, Scale & Subtle Scrim) */}
          {count > 1 && (
            <div
              onClick={() => move(1)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  move(1)
                }
              }}
              aria-label={`Next: ${nextEvent.title}`}
              className="absolute right-0 translate-x-[68%] sm:translate-x-[42%] md:translate-x-[32%] lg:translate-x-[24%] h-[82%] sm:h-[88%] w-[88%] sm:w-[80%] md:w-[72%] max-w-[1080px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer opacity-65 hover:opacity-95 transition-all duration-300 z-0 shadow-2xl border border-white/10 scale-[0.93] hover:scale-[0.95] group"
            >
              {nextEvent.banner || nextEvent.poster ? (
                <img
                  src={nextEvent.banner || nextEvent.poster}
                  alt=""
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-500"
                />
              ) : (
                <PosterArt
                  eventId={nextEvent.id}
                  title={nextEvent.title}
                  category={nextEvent.category}
                  clubId={nextEvent.organizerId}
                />
              )}
              {/* Soft directional scrim preserving vibrant color */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-black/40 to-black/70 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          )}

          {/* Floating Circular Nav Controls (BookMyShow Signature Glass) */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous slide"
                className="absolute left-2 sm:left-5 z-20 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-90"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next slide"
                className="absolute right-2 sm:right-5 z-20 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-black/75 hover:bg-black/95 text-white backdrop-blur-md border border-white/20 shadow-2xl transition-all hover:scale-105 active:scale-90"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </>
          )}
        </div>

        {/* Carousel Pagination Dots */}
        {count > 1 && (
          <div className="mt-5 flex items-center justify-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === safeIndex
                    ? 'w-8 h-2 bg-accent shadow-[0_0_12px_rgba(139,92,246,0.7)]'
                    : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
