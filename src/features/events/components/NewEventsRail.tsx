import React, { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react'
import { Event } from '@/api/contracts'
import { EventCard } from '@/design-system/EventCard'
import { EventPeekDrawer } from '@/design-system/EventPeekDrawer'
import { EventCardSkeleton } from '@/design-system/primitives/Skeleton'
import { cn } from '@/lib/utils'

export interface NewEventsRailProps {
  events: Event[]
  isLoading?: boolean
  className?: string
}

export const NewEventsRail: React.FC<NewEventsRailProps> = ({
  events,
  isLoading = false,
  className,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [peekEvent, setPeekEvent] = useState<Event | null>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -360 : 360
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <section
      aria-label="New Events"
      className={cn(
        'relative w-full bg-bg py-10 sm:py-14 select-none',
        'min-h-[50svh] flex flex-col justify-center',
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Rail Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[13px] font-semibold text-accent uppercase tracking-wider block mb-1">
              New Additions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text tracking-tight font-sans">
              Recently published across all collectives
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/explore?sort=newest"
              className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent hover:gap-2 transition-all mr-2"
            >
              <span>See all newest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Scroll Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll new events left"
                className="w-10 h-10 rounded-full bg-surface text-text hover:bg-surface-hover shadow-xs border border-line flex items-center justify-center transition-all duration-200"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll new events right"
                className="w-10 h-10 rounded-full bg-surface text-text hover:bg-surface-hover shadow-xs border border-line flex items-center justify-center transition-all duration-200"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Snap Rail Container */}
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            // Skeleton state
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-[0_0_280px] sm:flex-[0_0_320px] lg:flex-[0_0_330px] snap-start"
              >
                <EventCardSkeleton />
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="w-full py-12 text-center text-ink-muted text-[14px]">
              No new events published yet. Check back soon!
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="flex-[0_0_280px] sm:flex-[0_0_320px] lg:flex-[0_0_330px] snap-start transition-transform duration-200"
              >
                <EventCard
                  event={event}
                  variant="stacked"
                  aspectRatio="5/4"
                  onPeek={setPeekEvent}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Quick-Preview Peek Drawer */}
      <EventPeekDrawer
        event={peekEvent}
        isOpen={Boolean(peekEvent)}
        onClose={() => setPeekEvent(null)}
      />
    </section>
  )
}
