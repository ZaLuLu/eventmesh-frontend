import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { CaretLeft, CaretRight, CalendarBlank, MapPin, Ticket } from '@/design-system/Icon'
import { PosterArt } from '@/design-system/visuals/PosterArt'
import { Sticker } from '@/design-system/primitives/Sticker'
import { formatDate, formatCurrency } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import { Event } from '@/api'

interface PromotedTicketStackProps {
  events: Event[]
}

/**
 * PromotedTicketStack: Draggable/flippable stack of promoted event tickets
 * Replaces the blue slab hero and curved marquee (V-08).
 * Auto-advances every 5s; pauses on hover, focus, or prefers-reduced-motion.
 */
export const PromotedTicketStack: React.FC<PromotedTicketStackProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const activeEvents = events.length > 0 ? events.slice(0, 5) : []

  // Auto-advance every 5 seconds unless paused or reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isPaused || prefersReducedMotion || activeEvents.length <= 1) return

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeEvents.length)
    }, 5000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPaused, activeEvents.length])

  if (activeEvents.length === 0) return null

  const currentEvent = activeEvents[currentIndex]
  const clubId = currentEvent.organizerId || (currentEvent as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = currentEvent.isFree ?? (!currentEvent.price || currentEvent.price === 0)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeEvents.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length)
  }

  return (
    <div
      className="relative w-full max-w-[440px] mx-auto select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Decorative tilted background cards giving physical stacked paper depth */}
      <div
        className="absolute inset-0 bg-card border-[1.5px] border-ink rounded-ticket shadow-offset rotate-3 translate-x-2 translate-y-3 opacity-60 pointer-events-none transition-transform"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-paper-2 border-[1.5px] border-ink rounded-ticket shadow-offset -rotate-2 -translate-x-1.5 translate-y-1.5 opacity-80 pointer-events-none transition-transform"
        aria-hidden="true"
      />

      {/* Main Front Ticket */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentEvent.id}
          initial={{ opacity: 0, y: 12, rotate: -1, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, rotate: 2, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative bg-card border-[2px] border-ink rounded-ticket overflow-hidden shadow-offset-lg flex flex-col"
        >
          {/* Top Generative Poster Field */}
          <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-paper-2 border-b-[2px] border-ink">
            <PosterArt
              eventId={currentEvent.id}
              title={currentEvent.title}
              category={currentEvent.category}
              clubId={clubId}
              aspectRatio="video"
            />

            {/* Floating Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <Sticker color={isFree ? 'mint' : 'mustard'} size="sm" tilt={-2}>
                {formatCurrency(currentEvent.price)}
              </Sticker>
              <Sticker color={clubTheme.token} size="sm" tilt={2}>
                {currentEvent.club?.name || currentEvent.organizerName || 'Featured'}
              </Sticker>
            </div>
          </div>

          {/* Ticket Body with Notched Perforation Divider */}
          <div className="relative bg-card px-5 py-4 flex flex-col justify-between gap-3">
            {/* Bite Notches on Left & Right */}
            <div className="absolute -top-3.5 -left-3.5 w-7 h-7 rounded-full bg-paper border-[2px] border-ink z-20" />
            <div className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-paper border-[2px] border-ink z-20" />

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cobalt uppercase">
                <CalendarBlank size={14} weight="bold" />
                <span>{formatDate(currentEvent.startsAt, 'medium')}</span>
              </div>

              <h3 className="font-display font-extrabold text-xl text-ink leading-snug line-clamp-2">
                <Link
                  to={`/events/${currentEvent.slug || currentEvent.id}`}
                  className="hover:text-cobalt transition-colors"
                >
                  {currentEvent.title}
                </Link>
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-ink-soft">
                <MapPin size={13} weight="bold" className="text-cobalt flex-shrink-0" />
                <span className="truncate">
                  {currentEvent.venue?.name || 'Campus Main Auditorium'}
                </span>
              </div>
            </div>

            {/* Action Bottom Bar */}
            <div className="pt-3 border-t border-ink/15 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {activeEvents.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      currentIndex === idx ? 'w-6 bg-ink' : 'w-2 bg-ink/20 hover:bg-ink/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous event"
                    className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center text-ink hover:bg-paper-2 transition-colors"
                  >
                    <CaretLeft size={14} weight="bold" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next event"
                    className="w-8 h-8 rounded-full border border-ink/20 flex items-center justify-center text-ink hover:bg-paper-2 transition-colors"
                  >
                    <CaretRight size={14} weight="bold" />
                  </button>
                </div>

                <Link
                  to={`/events/${currentEvent.slug || currentEvent.id}`}
                  className="btn-funk-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Ticket size={14} weight="bold" />
                  <span>Grab seat</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
