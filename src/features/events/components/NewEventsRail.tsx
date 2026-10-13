import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CaretLeft, CaretRight, ArrowRight } from '@/design-system/Icon'
import { Event } from '@/api/contracts'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { SectionHeader } from '@/design-system/SectionHeader'
import { EventCardSkeleton } from '@/design-system/primitives/Skeleton'
import { cn } from '@/lib/utils'

export interface NewEventsRailProps {
  events: Event[]
  isLoading?: boolean
  className?: string
}

/**
 * NewEventsRail: Physical EventTicketCard grid/rail with genuine perforations and PosterArt.
 * Kills V-02, V-03, and V-04.
 */
export const NewEventsRail: React.FC<NewEventsRailProps> = ({
  events,
  isLoading = false,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -380 : 380
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section
      aria-label="New Events"
      className={cn('relative w-full py-10 sm:py-14 select-none', className)}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Section Header with Campus Funk Display Typography */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-ink/10 mb-8">
          <SectionHeader
            title="Newest across campus"
            subtitle="Freshly scheduled hackathons, design salons, and technical symposia"
            sticker="New Drops"
            stickerColor="mint"
            accentWord="campus"
          />

          <div className="flex items-center gap-3">
            <Link
              to="/explore?sort=newest"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-cobalt hover:text-ink transition-colors"
            >
              <span>See all events</span>
              <ArrowRight size={14} weight="bold" />
            </Link>

            {/* Scroll Navigation */}
            <div className="hidden sm:flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll new events left"
                className="w-9 h-9 rounded-full border border-ink/20 bg-card text-ink hover:bg-paper-2 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:translate-y-0.5"
              >
                <CaretLeft size={16} weight="bold" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll new events right"
                className="w-9 h-9 rounded-full border border-ink/20 bg-card text-ink hover:bg-paper-2 flex items-center justify-center transition-colors cursor-pointer shadow-sm active:translate-y-0.5"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Responsive Grid on Desktop / Snap Rail on Mobile (Section 7.1 directive 4) */}
        <div
          ref={scrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-ticket bg-card border-[1.5px] border-ink/15 animate-pulse" />
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full py-12 text-center text-ink-soft text-sm">
              Nothing on yet. Try checking back tomorrow!
            </div>
          ) : (
            events.slice(0, 6).map((event) => (
              <EventTicketCard key={event.id} event={event} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
