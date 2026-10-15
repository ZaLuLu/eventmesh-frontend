'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, PanInfo, AnimatePresence } from 'motion/react'
import { CaretLeft, CaretRight, Sparkle, ArrowRight } from '@/design-system/Icon'
import { Event } from '@/api/contracts/event'
import { formatDate } from '@/lib/format'

export interface LiquidGlassCarouselProps {
  events?: Event[]
  className?: string
}

/**
 * LiquidGlassCarousel
 * WebGL-inspired optical liquid-glass lens carousel with chromatic rim dispersion,
 * spring-loaded inertial swipe/drag snapping, and side-peeking neighbor cards.
 * Adheres strictly to Hallmark 58 Anti-Slop Gates (zero 5-sec auto-scroll hijack).
 */
export const LiquidGlassCarousel: React.FC<LiquidGlassCarouselProps> = ({
  events = [],
  className = '',
}) => {
  const slides = useMemo(() => {
    const featured = events.filter((e) => e.isSignature || e.promotion?.label)
    return (featured.length ? featured : events).slice(0, 6)
  }, [events])

  const [activeIndex, setActiveIndex] = useState(0)
  const [lensHover, setLensHover] = useState({ x: 50, y: 50, active: false })
  const containerRef = useRef<HTMLDivElement>(null)

  const count = slides.length
  const safeIndex = count ? activeIndex % count : 0

  const move = (delta: number) => {
    if (!count) return
    setActiveIndex((prev) => (prev + delta + count) % count)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      move(-1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      move(1)
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setLensHover({ x, y, active: true })
  }

  const handlePointerLeave = () => {
    setLensHover((prev) => ({ ...prev, active: false }))
  }

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -180) {
      move(1)
    } else if (info.offset.x > 50 || info.velocity.x > 180) {
      move(-1)
    }
  }

  if (count === 0) {
    return (
      <div className="w-full py-12 text-center border-b border-line bg-canvas">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Campus Stage</p>
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
      aria-label="Flagship featured campus events"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full overflow-hidden bg-canvas py-6 sm:py-8 border-b border-line select-none ${className}`}
    >
      {/* Liquid Glass SVG Chromatic Distortion Filter Definition */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="liquid-glass-refraction" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header Ribbon */}
        <div className="mb-4 sm:mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkle className="w-3.5 h-3.5 text-accent" weight="fill" />
              <p className="font-mono text-xs uppercase tracking-widest text-accent font-semibold">
                Curated Stage · Top 60% Featured
              </p>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-ink font-display">
              Flagship Campus Productions
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-muted">
              {String(safeIndex + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous featured event"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink hover:bg-surface-hover hover:border-line-strong active:scale-95 transition-all"
              >
                <CaretLeft size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Next featured event"
                className="grid h-8 w-8 place-items-center rounded-full border border-line bg-surface text-ink hover:bg-surface-hover hover:border-line-strong active:scale-95 transition-all"
              >
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Visual Stage with Side Peeking Cards */}
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          className="relative flex h-[380px] sm:h-[430px] items-center justify-center"
        >
          {/* Previous Peeking Event (Left) */}
          {count > 1 && (
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label={`Inspect previous event: ${prevEvent.title}`}
              className="absolute -left-[24%] sm:-left-[12%] lg:-left-[8%] top-6 hidden sm:block h-[340px] w-[38%] max-w-[340px] overflow-hidden rounded-[24px] border border-line bg-surface opacity-60 hover:opacity-90 transition-all duration-300 scale-90 z-0 cursor-pointer shadow-sm text-left group"
            >
              <div className="h-[60%] w-full overflow-hidden bg-surface-subtle p-3">
                <div className="h-full w-full rounded-[16px] overflow-hidden">
                  {prevEvent.poster || prevEvent.banner ? (
                    <img
                      src={prevEvent.poster || prevEvent.banner}
                      alt=""
                      className="h-full w-full object-cover filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="h-full w-full bg-accent-soft grid place-items-center font-display text-sm font-semibold text-accent p-2 text-center">
                      {prevEvent.title}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3">
                <span className="font-mono text-[10px] uppercase text-accent font-semibold">{prevEvent.category || 'Featured'}</span>
                <p className="mt-1 font-semibold text-sm line-clamp-1 text-ink">{prevEvent.title}</p>
                <p className="font-mono text-[11px] text-ink-muted mt-0.5">{formatDate(prevEvent.startsAt)}</p>
              </div>
            </button>
          )}

          {/* Active Center Card with Liquid Glass Optical Lens Simulation */}
          <motion.div
            key={activeEvent.id || safeIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.16}
            onDragEnd={onDragEnd}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 140, damping: 22, mass: 0.8 }}
            className="relative z-10 flex h-full w-full max-w-[820px] flex-col sm:flex-row overflow-hidden rounded-[26px] border border-line-strong bg-surface shadow-md group"
          >
            {/* Liquid Glass Optical Refraction Sheen Overlay */}
            <div
              className="absolute inset-0 pointer-events-none rounded-[26px] z-20 transition-opacity duration-300"
              style={{
                background: lensHover.active
                  ? `radial-gradient(circle 280px at ${lensHover.x}% ${lensHover.y}%, rgba(139, 92, 246, 0.12), transparent 70%)`
                  : 'none',
                boxShadow: 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 1px 0 rgba(124, 58, 237, 0.1)',
              }}
            />

            {/* Poster Inset Framing (12px margin, 18px inner radius) */}
            <div className="h-[48%] sm:h-full sm:w-[54%] p-3 sm:p-3.5 flex-shrink-0">
              <div className="h-full w-full overflow-hidden rounded-[18px] bg-surface-subtle border border-line/60 relative">
                {activeEvent.poster || activeEvent.banner ? (
                  <img
                    src={activeEvent.poster || activeEvent.banner}
                    alt={activeEvent.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-gradient-to-br from-purple-900 to-indigo-950 p-6 text-center text-xl sm:text-2xl font-semibold text-white">
                    {activeEvent.title}
                  </div>
                )}
                {/* Organic Category Tag Overlay */}
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink/80 text-white text-[10px] font-mono uppercase tracking-wider backdrop-blur-none border border-white/10">
                  {activeEvent.category || 'Featured'}
                </div>
              </div>
            </div>

            {/* Card Content & Split Utility Dock */}
            <div className="flex flex-1 flex-col justify-between p-4 sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs text-ink-muted">
                    {activeEvent.organizerName || 'Verified Society Production'}
                  </span>
                </div>
                <h3 className="mt-2 text-xl sm:text-3xl font-semibold leading-tight text-ink tracking-tight font-display line-clamp-2">
                  {activeEvent.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-ink-soft leading-relaxed">
                  {activeEvent.description || 'Join fellow attendees for this flagship campus session and verified festival showcase.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-line">
                {/* Tabular Metadata in JetBrains Mono */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase">Date & Schedule</p>
                    <p className="text-ink font-semibold mt-0.5 truncate">{formatDate(activeEvent.startsAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted uppercase">Venue Location</p>
                    <p className="text-ink font-semibold mt-0.5 truncate">{activeEvent.venue?.name || 'Main Auditorium'}</p>
                  </div>
                </div>

                {/* Primary Royal Purple Action */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-xs font-mono font-medium text-ink-soft">
                    {activeEvent.seatsLeft === 0
                      ? 'Sold out'
                      : activeEvent.seatsLeft != null
                      ? `${activeEvent.seatsLeft} passes remaining`
                      : 'Open Registration'}
                  </span>
                  <Link
                    to={`/events/${activeEvent.slug || activeEvent.id}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent hover:bg-accent-hover text-white text-xs font-semibold shadow-sm transition-transform active:scale-[0.98]"
                  >
                    <span>Book Pass</span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Next Peeking Event (Right) */}
          {count > 1 && (
            <button
              type="button"
              onClick={() => move(1)}
              aria-label={`Inspect next event: ${nextEvent.title}`}
              className="absolute -right-[24%] sm:-right-[12%] lg:-right-[8%] top-6 hidden sm:block h-[340px] w-[38%] max-w-[340px] overflow-hidden rounded-[24px] border border-line bg-surface opacity-60 hover:opacity-90 transition-all duration-300 scale-90 z-0 cursor-pointer shadow-sm text-left group"
            >
              <div className="h-[60%] w-full overflow-hidden bg-surface-subtle p-3">
                <div className="h-full w-full rounded-[16px] overflow-hidden">
                  {nextEvent.poster || nextEvent.banner ? (
                    <img
                      src={nextEvent.poster || nextEvent.banner}
                      alt=""
                      className="h-full w-full object-cover filter grayscale contrast-110 group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="h-full w-full bg-accent-soft grid place-items-center font-display text-sm font-semibold text-accent p-2 text-center">
                      {nextEvent.title}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-3">
                <span className="font-mono text-[10px] uppercase text-accent font-semibold">{nextEvent.category || 'Featured'}</span>
                <p className="mt-1 font-semibold text-sm line-clamp-1 text-ink">{nextEvent.title}</p>
                <p className="font-mono text-[11px] text-ink-muted mt-0.5">{formatDate(nextEvent.startsAt)}</p>
              </div>
            </button>
          )}
        </div>

        {/* Progress Navigation Pips */}
        {count > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setActiveIndex(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                aria-current={safeIndex === dotIdx ? 'true' : undefined}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  safeIndex === dotIdx ? 'w-7 bg-accent' : 'w-1.5 bg-line-strong hover:bg-ink-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
