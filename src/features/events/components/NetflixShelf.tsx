import React, { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { Event } from '@/api'
import { EventCardModern } from './EventCardModern'

export interface NetflixShelfProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  events: Event[]
  isRanked?: boolean
  exploreLink?: string
}

export const NetflixShelf: React.FC<NetflixShelfProps> = ({
  title,
  subtitle,
  icon,
  events,
  isRanked = false,
  exploreLink,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!events || events.length === 0) return null

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Shelf Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {icon && <span className="text-md-primary flex-shrink-0">{icon}</span>}
            <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && <p className="text-xs sm:text-sm text-slate-500 font-medium">{subtitle}</p>}
        </div>

        {/* Carousel Arrow Controls & View All */}
        <div className="flex items-center gap-3">
          {exploreLink && (
            <Link
              to={exploreLink}
              className="text-xs font-semibold text-md-primary hover:underline inline-flex items-center gap-1 mr-2"
            >
              <span>See All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}

          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScroll('left')}
              className="h-8 w-8 rounded-full border border-[#DADCE0] bg-white hover:bg-[#F1F3F4] text-slate-700 flex items-center justify-center shadow-2xs hover:shadow-sm active:scale-95 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll('right')}
              className="h-8 w-8 rounded-full border border-[#DADCE0] bg-white hover:bg-[#F1F3F4] text-slate-700 flex items-center justify-center shadow-2xs hover:shadow-sm active:scale-95 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto hide-scrollbar scroll-smooth pb-4 pt-1 -mx-4 px-4 sm:-mx-6 sm:px-6"
      >
        {events.map((evt, idx) => (
          <div
            key={evt.id}
            className={`flex-shrink-0 ${
              isRanked
                ? 'w-[300px] sm:w-[340px] flex items-center'
                : 'w-[280px] sm:w-[320px]'
            }`}
          >
            {isRanked ? (
              <div className="relative flex items-center w-full">
                {/* Netflix Iconic Giant Number (1-10) */}
                <span className="font-display font-black text-7xl sm:text-8xl lg:text-9xl text-slate-200/90 select-none -mr-4 sm:-mr-6 z-0 flex-shrink-0 tracking-tighter leading-none">
                  {idx + 1}
                </span>

                {/* Card Container */}
                <div className="relative z-10 flex-1">
                  <EventCardModern event={evt} rankNumber={idx + 1} />
                </div>
              </div>
            ) : (
              <EventCardModern event={evt} />
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
