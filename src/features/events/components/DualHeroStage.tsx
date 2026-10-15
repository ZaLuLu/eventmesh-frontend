// Hallmark macrostructure: DualHeroStage / 50-50 Top & Bottom Split Hero
import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarBlank,
  MapPin,
  Ticket,
  Sparkle,
  ArrowRight,
  CaretLeft,
  CaretRight,
  Users,
} from '@/design-system/Icon'
import { Event } from '@/api/contracts'
import { PosterArtwork } from '@/design-system/PosterArtwork'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'

interface DualHeroStageProps {
  events: Event[]
}

export const DualHeroStage: React.FC<DualHeroStageProps> = ({ events }) => {
  const navigate = useNavigate()

  // Partition into Premium/Paid vs Normal/Community events
  const { premiumEvents, normalEvents } = useMemo(() => {
    const paidList: Event[] = []
    const communityList: Event[] = []

    events.forEach((ev) => {
      const isPaid = ev.features?.paid || (ev.price && ev.price > 0) || ev.isSignature
      if (isPaid) {
        paidList.push(ev)
      } else {
        communityList.push(ev)
      }
    })

    // Fallback if no events explicitly marked paid in seed data: promote first 2 as featured premium
    if (paidList.length === 0 && events.length > 0) {
      paidList.push(...events.slice(0, 2))
      communityList.push(...events.slice(2))
    }

    return {
      premiumEvents: paidList.length > 0 ? paidList : events.slice(0, 2),
      normalEvents: communityList.length > 0 ? communityList : events.slice(2),
    }
  }, [events])

  const [activePremiumIndex, setActivePremiumIndex] = useState(0)
  const currentPremium = premiumEvents[activePremiumIndex] || events[0]

  const handleNextPremium = () => {
    setActivePremiumIndex((prev) => (prev + 1) % premiumEvents.length)
  }

  const handlePrevPremium = () => {
    setActivePremiumIndex((prev) => (prev - 1 + premiumEvents.length) % premiumEvents.length)
  }

  if (!events || events.length === 0) return null

  const premiumPriceDisplay = currentPremium?.price
    ? `$${currentPremium.price.toFixed(2)}`
    : currentPremium?.features?.paid
    ? '$19.00'
    : 'PREMIUM PASS'

  return (
    <section className="w-full bg-paper py-8 sm:py-12 border-b border-line">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">

        {/* =========================================================================
            TOP HALF (50%): FEATURED & PAID PREMIUM STAGE (Modern-Minimal Bento)
            ========================================================================= */}
        <div className="w-full bg-card rounded-2xl border border-line p-6 sm:p-8 shadow-sm relative overflow-hidden">
          {/* Header row with status & carousel controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-line">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent font-mono text-xs font-medium tracking-wide border border-accent/20">
                <Sparkle size={13} weight="fill" className="text-accent" />
                Featured Spotlight
              </span>
              <span className="font-mono text-xs text-ink-muted">
                [{activePremiumIndex + 1} / {premiumEvents.length}]
              </span>
            </div>

            {premiumEvents.length > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevPremium}
                  aria-label="Previous featured session"
                  className="p-2 rounded-full border border-line bg-surface hover:border-ink hover:text-ink text-ink-soft transition-colors shadow-xs"
                >
                  <CaretLeft size={14} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPremium}
                  aria-label="Next featured session"
                  className="p-2 rounded-full border border-line bg-surface hover:border-ink hover:text-ink text-ink-soft transition-colors shadow-xs"
                >
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            )}
          </div>

          {/* Featured Premium Content Stage */}
          <AnimatePresence mode="wait">
            {currentPremium && (
              <motion.div
                key={currentPremium.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6"
              >
                {/* Visual Artwork Column */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-full max-w-[340px] aspect-[4/3] rounded-xl overflow-hidden border border-line shadow-sm">
                    <PosterArtwork
                      event={currentPremium}
                      aspectRatio="4/3"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-ink text-paper font-mono text-xs font-semibold shadow-sm border border-white/10">
                      {premiumPriceDisplay}
                    </div>
                  </div>
                </div>

                {/* Details & Registration Column */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle border border-line text-ink-soft font-mono text-xs font-medium uppercase">
                      {currentPremium.category}
                    </span>
                    <span className="text-xs font-mono text-ink-muted">
                      Organized by {currentPremium.organizerName || 'Campus Guild'}
                    </span>
                  </div>

                  <h1 className="font-display font-semibold text-2xl sm:text-3xl lg:text-4xl text-ink tracking-tight leading-tight">
                    {currentPremium.title}
                  </h1>

                  <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
                    {currentPremium.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink-soft pt-1">
                    <div className="flex items-center gap-1.5">
                      <CalendarBlank size={14} weight="bold" className="text-accent" />
                      <span>{formatDate(currentPremium.startsAt)} · {formatTime(currentPremium.startsAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} weight="bold" className="text-accent" />
                      <span>{currentPremium.venue?.name || 'Main Auditorium'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Ticket size={14} weight="bold" className="text-accent" />
                      <span>{currentPremium.seatsLeft} passes left</span>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/events/${currentPremium.slug}/register`}
                      className="px-6 py-2.5 rounded-full bg-ink text-paper font-sans font-medium text-sm flex items-center gap-2 hover:bg-accent hover:text-white transition-all shadow-sm active:translate-y-0.5"
                    >
                      <Ticket size={16} weight="bold" />
                      <span>Get Pass · {premiumPriceDisplay}</span>
                    </Link>

                    <Link
                      to={`/events/${currentPremium.slug}`}
                      className="px-4 py-2.5 rounded-full border border-line bg-surface hover:bg-surface-subtle text-ink font-medium text-sm transition-colors"
                    >
                      <span>Session Details</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* =========================================================================
            ARCHITECTURAL STAGE SEAM / DIVIDER
            ========================================================================= */}
        <div className="relative py-2 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-line" />
          </div>
          <div className="relative z-10 px-4 py-1 rounded-full border border-line bg-paper text-ink font-mono text-[11px] font-medium tracking-wider uppercase flex items-center gap-2 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>CAMPUS COMMUNITY & GUILD SESSIONS</span>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM HALF (50%): NORMAL & COMMUNITY SESSIONS STAGE
            ========================================================================= */}
        <div>
          <div className="flex items-center justify-between pb-4">
            <div>
              <h2 className="font-display font-semibold text-xl sm:text-2xl text-ink tracking-tight">
                Regular Campus Gatherings & Workshops
              </h2>
              <p className="text-xs text-ink-soft mt-0.5 font-sans">
                Open sessions across student laboratories, developer circles, and arts collectives.
              </p>
            </div>
            <Link
              to="/explore"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-mono font-medium text-accent hover:underline uppercase"
            >
              <span>Explore All</span>
              <ArrowRight size={13} weight="bold" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {normalEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="bg-card rounded-xl border border-line p-5 flex flex-col justify-between hover:border-border-strong transition-all shadow-xs group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-ink-soft">
                    <span className="px-2 py-0.5 rounded-md bg-surface-subtle text-ink font-medium uppercase border border-line">
                      {event.category}
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      FREE ENTRY
                    </span>
                  </div>

                  <Link to={`/events/${event.slug}`} className="block">
                    <h3 className="font-display font-medium text-base text-ink group-hover:text-accent transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-line mt-4 flex items-center justify-between text-xs font-mono">
                  <span className="text-ink-muted truncate max-w-[160px]">
                    {formatDate(event.startsAt)}
                  </span>
                  <Link
                    to={`/events/${event.slug}/register`}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-subtle hover:bg-ink hover:text-paper text-ink transition-colors font-medium text-xs border border-line"
                  >
                    <span>Register</span>
                    <ArrowRight size={11} weight="bold" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
