import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { CaretLeft, CaretRight, CalendarBlank, MapPin, ArrowRight } from '@/design-system/Icon'
import { PosterArt } from '@/design-system/visuals/PosterArt'
import { formatDate } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import { Event } from '@/api'

interface PromotedTicketStackProps {
  events: Event[]
}

/**
 * PromotedTicketStack: Option B Modern-Minimal Featured Event Showcase
 * Smooth, borderless visual art showcase with clean typography and zero cartoon gimmicks.
 */
export const PromotedTicketStack: React.FC<PromotedTicketStackProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const activeEvents = events.length > 0 ? events.slice(0, 5) : []

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isPaused || prefersReducedMotion || activeEvents.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeEvents.length)
    }, 6000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, activeEvents.length])

  if (activeEvents.length === 0) return null

  const currentEvent = activeEvents[currentIndex]
  const clubId = currentEvent.organizerId || (currentEvent as any).clubId || 'club-cp'
  const isFree = currentEvent.isFree ?? (!currentEvent.price || currentEvent.price === 0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeEvents.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length)
  }

  return (
    <div
      className="relative w-full max-w-[460px] mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative bg-card rounded-2xl overflow-hidden border border-line shadow-xl flex flex-col group"
        >
          {/* Top Artwork Area */}
          <Link
            to={`/events/${currentEvent.slug || currentEvent.id}`}
            className="relative w-full aspect-[16/10] overflow-hidden bg-surface-subtle"
            tabIndex={-1}
          >
            {currentEvent.poster && !currentEvent.poster.includes('placeholder') ? (
              <img
                src={currentEvent.poster}
                alt={currentEvent.title}
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <PosterArt
                eventId={currentEvent.id}
                title={currentEvent.title}
                category={currentEvent.category}
                clubId={clubId}
                aspectRatio="video"
              />
            )}

            {/* Floating Status Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">
                Featured
              </span>
              {isFree && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-md">
                  Free
                </span>
              )}
            </div>

            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-card/85 text-ink backdrop-blur-md">
                {currentEvent.organizerName || 'Campus Society'}
              </span>
            </div>
          </Link>

          {/* Body Content */}
          <div className="p-5 flex flex-col justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-accent">
                <CalendarBlank size={13} weight="bold" />
                <span>{formatDate(currentEvent.startsAt)}</span>
                <span className="text-ink-muted">·</span>
                <span className="text-ink-muted">{currentEvent.venue?.name || 'Campus Main Auditorium'}</span>
              </div>

              <Link to={`/events/${currentEvent.slug || currentEvent.id}`}>
                <h3 className="font-sans font-semibold text-lg text-ink group-hover:text-accent transition-colors line-clamp-1 leading-snug">
                  {currentEvent.title}
                </h3>
              </Link>

              {currentEvent.subtitle && (
                <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                  {currentEvent.subtitle}
                </p>
              )}
            </div>

            {/* Bottom Controls & RSVP Link */}
            <div className="pt-3 border-t border-line flex items-center justify-between gap-3">
              {/* Pagination Dots */}
              <div className="flex items-center gap-1.5">
                {activeEvents.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${
                      currentIndex === idx ? 'w-5 bg-accent' : 'w-1.5 bg-line hover:bg-ink-muted'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Prev / Next & RSVP Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="w-7 h-7 rounded-full bg-surface-subtle hover:bg-line/60 text-ink-soft hover:text-ink flex items-center justify-center transition-colors"
                  aria-label="Previous event"
                >
                  <CaretLeft size={13} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-7 h-7 rounded-full bg-surface-subtle hover:bg-line/60 text-ink-soft hover:text-ink flex items-center justify-center transition-colors"
                  aria-label="Next event"
                >
                  <CaretRight size={13} weight="bold" />
                </button>

                <Link
                  to={`/events/${currentEvent.slug || currentEvent.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-ink text-paper hover:bg-accent hover:text-white font-medium text-xs transition-colors ml-1"
                >
                  <span>RSVP</span>
                  <ArrowRight size={12} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
