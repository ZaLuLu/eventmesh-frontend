import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  CaretLeft,
  CaretRight,
  CalendarBlank,
  MapPin,
  Ticket,
  ArrowUpRight,
  Sparkle,
} from '@/design-system/Icon'
import { Event } from '@/api/contracts'
import { PosterArtwork } from '@/design-system/PosterArtwork'
import { formatDate, formatTime } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import { cn } from '@/lib/utils'

interface FeaturedEventsHeroProps {
  events: Event[]
}

/**
 * FeaturedEventsHero:
 * Distinctive editorial hero carousel adapting the architectural patterns of @reactbits-pro/about-15.
 * Features kinetic horizontal slide transitions, accessible keyboard controls, active index metrics,
 * and high-contrast typography in the Obsidian Alabaster design system.
 */
export const FeaturedEventsHero: React.FC<FeaturedEventsHeroProps> = ({ events }) => {
  const navigate = useNavigate()
  const activeEvents = events.length > 0 ? events.slice(0, 5) : []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<number>(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartRef = useRef<number | null>(null)

  const handleNext = useCallback(() => {
    setDirection(1)
    setCurrentIndex((prev) => (prev + 1) % activeEvents.length)
  }, [activeEvents.length])

  const handlePrev = useCallback(() => {
    setDirection(-1)
    setCurrentIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length)
  }, [activeEvents.length])

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  // Autoplay with pause-on-hover / reduced motion check
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isPaused || prefersReducedMotion || activeEvents.length <= 1) return

    const timer = setInterval(() => {
      handleNext()
    }, 7000)

    return () => clearInterval(timer)
  }, [isPaused, activeEvents.length, handleNext])

  if (activeEvents.length === 0) return null

  const currentEvent = activeEvents[currentIndex]
  const clubId = currentEvent.organizerId || (currentEvent as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = currentEvent.isFree ?? (!currentEvent.price || currentEvent.price === 0)

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
    touchStartRef.current = null
  }

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    }),
  }

  return (
    <section
      aria-label="Featured Campus Events Carousel"
      className="relative w-full pt-6 pb-12 sm:pt-10 sm:pb-16 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Control Bar: Title & Slide Index Counter */}
        <div className="flex items-center justify-between pb-4 border-b border-line mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-ink-soft font-semibold">
              FEATURED DISCOVERY
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Numeric Progress Counter */}
            <div className="font-mono text-xs text-ink-soft">
              <span className="font-bold text-ink">0{currentIndex + 1}</span>
              <span className="opacity-40 mx-1">/</span>
              <span>0{activeEvents.length}</span>
            </div>

            {/* Slider Navigation Chevrons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Previous slide"
              >
                <CaretLeft size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:text-ink hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Next slide"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Showcase Stage */}
        <div className="relative overflow-hidden min-h-[460px] sm:min-h-[480px]">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentEvent.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-card rounded-3xl p-6 sm:p-10 border border-line/80 shadow-[0_4px_24px_-4px_rgba(20,17,29,0.04)]"
            >
              {/* Left Column (7 cols): Event Art Plate */}
              <div className="lg:col-span-7 relative group rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] bg-surface-subtle">
                <PosterArtwork
                  id={currentEvent.id}
                  title={currentEvent.title}
                  category={currentEvent.category}
                  clubName={currentEvent.club?.name || currentEvent.organizerName}
                  clubColor={clubTheme.hex}
                  imageUrl={currentEvent.poster}
                  aspectRatio="16/9"
                  priority={true}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-mono text-[11px] font-semibold tracking-wider uppercase border border-white/10">
                    {currentEvent.category || 'HACKATHON'}
                  </span>
                  {currentEvent.isSignature && (
                    <span className="px-3 py-1 rounded-full bg-accent text-white font-mono text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                      <Sparkle size={12} weight="fill" />
                      SIGNATURE
                    </span>
                  )}
                </div>

                {/* Price Pill */}
                <div className="absolute bottom-4 right-4 z-10">
                  <span className={cn(
                    'px-3.5 py-1.5 rounded-full font-mono text-xs font-bold backdrop-blur-md shadow-md',
                    isFree
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-black/75 text-white border border-white/15'
                  )}>
                    {isFree ? 'FREE ENTRY' : `₹${currentEvent.price || 199}`}
                  </span>
                </div>
              </div>

              {/* Right Column (5 cols): Editorial Metadata & Immediate RSVP */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Organizing Club Tag */}
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: clubTheme.hex || 'var(--accent)' }}
                    />
                    <span className="font-mono text-xs font-semibold text-ink-soft uppercase tracking-wider">
                      {currentEvent.club?.name || currentEvent.organizerName || 'Campus Guild'}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-ink tracking-tight leading-[1.1]">
                    {currentEvent.title}
                  </h2>

                  {/* Subtitle / Description */}
                  <p className="text-sm sm:text-base text-ink-soft line-clamp-3 leading-relaxed">
                    {currentEvent.subtitle || currentEvent.description}
                  </p>

                  {/* Date, Time & Venue */}
                  <div className="pt-2 space-y-2 border-t border-line/60 font-mono text-xs text-ink-soft">
                    <div className="flex items-center gap-2">
                      <CalendarBlank size={15} weight="bold" className="text-accent flex-shrink-0" />
                      <span className="text-ink font-medium">
                        {formatDate(currentEvent.startsAt)} · {formatTime(currentEvent.startsAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={15} weight="bold" className="text-accent flex-shrink-0" />
                      <span className="truncate">
                        {currentEvent.venue?.name || 'Central University Amphitheatre'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to={`/events/${currentEvent.slug}`}
                    className="btn-minimal-primary px-6 py-2.5 text-xs sm:text-sm font-semibold gap-2 shadow-xs"
                  >
                    <Ticket size={15} weight="bold" />
                    <span>Reserve Pass</span>
                  </Link>

                  <Link
                    to={`/events/${currentEvent.slug}`}
                    className="btn-minimal-secondary px-5 py-2.5 text-xs sm:text-sm font-medium gap-1.5"
                  >
                    <span>Event Details</span>
                    <ArrowUpRight size={14} weight="bold" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Slide Progress Bars */}
        <div className="flex items-center justify-center gap-2 pt-6">
          {activeEvents.map((evt, idx) => (
            <button
              key={evt.id}
              type="button"
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1)
                setCurrentIndex(idx)
              }}
              className="group py-2 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  idx === currentIndex
                    ? 'w-10 bg-accent'
                    : 'w-4 bg-line group-hover:bg-ink-muted'
                )}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedEventsHero
