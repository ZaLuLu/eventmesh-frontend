import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  MapPin,
  Users,
  Award,
  Sparkles,
  Bookmark,
  Clock,
  Star,
} from 'lucide-react'
import { Event } from '@/api'
import { formatDate, formatTime } from '@/lib/dates'
import { Button } from '@/design-system/primitives/Button'

interface HeroBillboardProps {
  events: Event[]
}

export const HeroBillboard: React.FC<HeroBillboardProps> = ({ events }) => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Auto-advance billboard every 6 seconds
  useEffect(() => {
    if (events.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % events.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [events.length])

  if (!events || events.length === 0) return null

  const current = events[activeIndex] || events[0]
  const accentColor = current.organizerColor || '#2563EB'

  const fallbackBackdrop =
    current.banner ||
    current.poster ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80'

  const registeredCount = current.capacity - current.seatsLeft
  const spotsPercent = Math.min(
    100,
    Math.round((registeredCount / (current.capacity || 100)) * 100)
  )

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-4">
      {/* Subtle Google Blue Ambient Aura */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 sm:h-96 pointer-events-none rounded-full overflow-hidden z-0"
        style={{
          background: 'radial-gradient(circle, rgba(26, 115, 232, 0.15) 0%, rgba(232, 240, 254, 0.3) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Main Billboard Container */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#DADCE0] shadow-card bg-slate-900 min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] flex flex-col justify-end">
        {/* Background Visual with Animated Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center z-0"
            style={{
              backgroundImage: `url(${fallbackBackdrop})`,
            }}
          >
            {/* Cinematic Gradient Vignettes */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Top Badges Bar */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-8 right-4 sm:right-8 z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-md-primary text-white text-xs font-semibold shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
              #1 Trending This Week
            </span>

            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-md bg-white/20 border border-white/20"
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
              {current.organizerName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                isBookmarked
                  ? 'bg-md-primary text-white shadow-xs'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              aria-label="Add to wishlist"
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* Billboard Content Stack */}
        <div className="relative z-10 px-4 sm:px-8 pb-6 sm:pb-8 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {/* Category, Rating & Social Proof */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2.5">
                <span className="px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium">
                  {current.category}
                </span>

                <div className="flex items-center gap-1 text-amber-300 text-xs font-bold bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  <span>4.9</span>
                  <span className="text-white/70 font-normal">(840+ reviews)</span>
                </div>

                <span className="text-white/90 text-xs flex items-center gap-1">
                  <Users className="h-3 w-3 text-emerald-400" />
                  <span className="font-semibold text-white">
                    {registeredCount}
                  </span>{' '}
                  registered
                </span>
              </div>

              {/* Event Title */}
              <h1 className="font-display font-bold text-2xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight mb-3">
                {current.title}
              </h1>

              {/* Event Elevator Pitch */}
              <p className="text-slate-200 text-xs sm:text-sm line-clamp-2 mb-4 max-w-2xl leading-relaxed">
                {current.subtitle || current.description}
              </p>

              {/* Quick Logistics Badges */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 font-medium mb-6">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-md-primary-container" />
                  <span>{formatDate(current.startsAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-md-primary-container" />
                  <span>{formatTime(current.startsAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emerald-300" />
                  <span>{current.venue.name}</span>
                </div>
                {current.certificateInfo && (
                  <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                    <Award className="h-3.5 w-3.5" />
                    <span>Certificate Included</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to={`/events/${current.slug}/register`}>
                  <Button variant="primary" size="md" arrow>
                    Book Free Pass
                  </Button>
                </Link>

                <Link to={`/events/${current.slug}`}>
                  <Button variant="secondary" size="md">
                    Event Details
                  </Button>
                </Link>

                <div className="text-xs text-white/80 font-medium pl-2 hidden sm:flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{spotsPercent}% spots booked</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Interactive Thumbnail Selector */}
        <div className="relative z-10 px-4 sm:px-8 pb-4 pt-2 border-t border-white/10 bg-slate-950/40 backdrop-blur-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
            {events.map((evt, idx) => (
              <button
                key={evt.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  idx === activeIndex
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: evt.organizerColor || '#1A73E8' }}
                />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {evt.title}
                </span>
                {idx === activeIndex && (
                  <span className="h-1.5 w-1.5 rounded-full bg-md-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="text-xs text-white/60 flex-shrink-0 hidden md:block">
            {activeIndex + 1} / {events.length}
          </div>
        </div>
      </div>
    </section>
  )
}
