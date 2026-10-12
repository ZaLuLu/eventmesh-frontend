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
        'relative w-full py-12 sm:py-16 select-none',
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Unboxed Chapter Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-6 border-b border-[#1A2E4C] mb-8">
          <div>
            <span className="text-xs font-mono text-sky-400 font-semibold tracking-wider block mb-1">
              04 // RECENT RELEASES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
              Recently Published Across Campus
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/explore?sort=newest"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>See all newest</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Architectural Drafting Scroll Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleScroll('left')}
                aria-label="Scroll new events left"
                className="w-8 h-8 border border-[#1A2E4C] text-slate-400 hover:text-white hover:border-sky-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleScroll('right')}
                aria-label="Scroll new events right"
                className="w-8 h-8 border border-[#1A2E4C] text-slate-400 hover:text-white hover:border-sky-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
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
