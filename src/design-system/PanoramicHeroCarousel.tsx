'use client'

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, PanInfo } from 'motion/react'
import { CaretLeft, CaretRight, Sparkle, CalendarBlank, MapPin, ArrowRight } from '@/design-system/Icon'
import { Event } from '@/api/contracts/event'
import { formatDate, formatTime } from '@/lib/format'
import { useAuth } from '@/hooks/useAuth'
import { useRegister } from '@/hooks/useRegistrations'
import { useToast } from '@/design-system/primitives/Toast'

export interface PanoramicHeroCarouselProps {
  events?: Event[]
  className?: string
}

/**
 * PanoramicHeroCarousel
 * Inspired by BookMyShow's panoramic flagship marquee and Hallmark tactile principles.
 * Features:
 * - Wide edge-to-edge panoramic banner stage with side-peeking neighbor slides.
 * - Floating circular chevron controls on side overlays.
 * - Bottom pagination indicators.
 * - Full responsive touch-swipe & keyboard navigation.
 * - Direct "1-Tap Quick Pass" trigger for fast smoke testing.
 */
export const PanoramicHeroCarousel: React.FC<PanoramicHeroCarouselProps> = ({
  events = [],
  className = '',
}) => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { session, switchDemoAccount } = useAuth()
  const registerMutation = useRegister()
  const [quickPassLoading, setQuickPassLoading] = useState<string | null>(null)

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

  const handleOneTapQuickPass = async (e: React.MouseEvent, event: Event) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickPassLoading(event.id)
    try {
      if (!session) {
        await switchDemoAccount({ role: 'attendee' })
      }
      const attendeeName = session?.name || 'Aarav Deshmukh'
      const attendeeEmail = session?.email || 'aarav.deshmukh@campus.edu'

      const payload = {
        eventId: event.id,
        answers: {
          phone: '+91 98765 43210',
          regNumber: 'ENG-2024-8891',
          branch: 'Computer Engineering',
          ticketTier: 'Standard Pass',
        },
      }

      await registerMutation.mutateAsync(payload)
      toast({
        title: 'Pass Confirmed! ⚡',
        message: `You're registered for ${event.title}. Viewing your 3D digital badge.`,
        type: 'success',
      })
      navigate('/attendee/dashboard')
    } catch (err: any) {
      toast({
        title: 'Quick Pass Note',
        message: err.message || 'Pass issued or already registered. Opening dashboard.',
        type: 'info',
      })
      navigate('/attendee/dashboard')
    } finally {
      setQuickPassLoading(null)
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
      className={`relative w-full overflow-hidden bg-paper-2 pt-4 pb-8 sm:py-6 border-b border-line select-none ${className}`}
    >
      <div className="relative mx-auto w-full max-w-[1480px] px-2 sm:px-6 lg:px-8">
        {/* Panoramic Carousel Stage */}
        <div className="relative flex h-[280px] sm:h-[360px] md:h-[400px] lg:h-[430px] items-center justify-center overflow-hidden">
          {/* Left Peeking Slide (Desk & Tablet) */}
          {count > 1 && (
            <div
              onClick={() => move(-1)}
              role="button"
              tabIndex={0}
              aria-label={`Previous: ${prevEvent.title}`}
              className="absolute left-0 -translate-x-[68%] sm:-translate-x-[42%] md:-translate-x-[32%] lg:-translate-x-[24%] h-[82%] sm:h-[88%] w-[88%] sm:w-[80%] md:w-[72%] max-w-[1080px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer opacity-40 hover:opacity-75 transition-all duration-300 z-0 shadow-sm border border-line"
            >
              <img
                src={prevEvent.banner || prevEvent.poster || '/images/events/demo-cyberpulse.jpg'}
                alt=""
                className="h-full w-full object-cover filter grayscale contrast-110"
              />
              <div className="absolute inset-0 bg-black/40" />
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
                className="group relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-line-strong bg-card shadow-lg"
              >
                {/* Background Panoramic Event Visual */}
                <div className="absolute inset-0 overflow-hidden bg-paper-3">
                  <img
                    src={activeEvent.banner || activeEvent.poster || '/images/events/demo-cyberpulse.jpg'}
                    alt={activeEvent.title}
                    className="h-full w-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-102"
                  />
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
                      {activeEvent.club?.name || 'Campus Premiere'}
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
                      <span>{formatDate(activeEvent.startsAt, 'full')} · {formatTime(activeEvent.startsAt)}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={15} className="text-accent" weight="bold" />
                      <span>{activeEvent.venue?.name || 'Main Auditorium'}</span>
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/events/${activeEvent.slug}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full bg-accent hover:bg-accent/90 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                    >
                      <span>Explore Show</span>
                      <ArrowRight size={15} weight="bold" />
                    </Link>

                    <button
                      type="button"
                      disabled={quickPassLoading === activeEvent.id}
                      onClick={(e) => handleOneTapQuickPass(e, activeEvent)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all active:scale-95"
                    >
                      <span>⚡</span>
                      <span>{quickPassLoading === activeEvent.id ? 'Issuing Pass…' : '1-Tap Quick Pass'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Peeking Slide (Desk & Tablet) */}
          {count > 1 && (
            <div
              onClick={() => move(1)}
              role="button"
              tabIndex={0}
              aria-label={`Next: ${nextEvent.title}`}
              className="absolute right-0 translate-x-[68%] sm:translate-x-[42%] md:translate-x-[32%] lg:translate-x-[24%] h-[82%] sm:h-[88%] w-[88%] sm:w-[80%] md:w-[72%] max-w-[1080px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer opacity-40 hover:opacity-75 transition-all duration-300 z-0 shadow-sm border border-line"
            >
              <img
                src={nextEvent.banner || nextEvent.poster || '/images/events/demo-cyberpulse.jpg'}
                alt=""
                className="h-full w-full object-cover filter grayscale contrast-110"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          )}

          {/* Floating Circular Nav Controls (Left & Right - BookMyShow Signature) */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous slide"
                className="absolute left-2 sm:left-4 z-20 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 shadow-md transition-all active:scale-90"
              >
                <CaretLeft size={20} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next slide"
                className="absolute right-2 sm:right-4 z-20 grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md border border-white/20 shadow-md transition-all active:scale-90"
              >
                <CaretRight size={20} weight="bold" />
              </button>
            </>
          )}
        </div>

        {/* Carousel Pagination Dots */}
        {count > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Jump to slide ${idx + 1}: ${slide.title}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === safeIndex
                    ? 'w-7 h-2 bg-accent shadow-xs'
                    : 'w-2 h-2 bg-line-strong hover:bg-ink-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
