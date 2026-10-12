import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Bookmark } from 'lucide-react'
import { Event } from '@/api'
import { formatDate } from '@/lib/dates'
import { PosterArtwork } from '@/design-system/PosterArtwork'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { useCardTilt } from '@/hooks/useCardTilt'
import { cn } from '@/lib/utils'

export interface EventCardModernProps {
  event: Event
  rankNumber?: number
  layout?: 'standard' | 'compact' | 'widescreen'
  aspectRatio?: '16/10' | '4/5'
  onPeek?: (event: Event) => void
}

/**
 * EventCardModern:
 * High-craft card combining Calm Coral typography with enchanting generative art,
 * 3D perspective tilt physics, specular cursor glare, dynamic club halo, Quick Peek,
 * and celebratory micro-interactions.
 */
export const EventCardModern: React.FC<EventCardModernProps> = ({
  event,
  rankNumber,
  aspectRatio = '16/10',
  onPeek,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const { ref: cardRef, tiltProps, style: tiltStyle, glareStyle } = useCardTilt(6)
  const clubColor = event.organizerColor || '#C93E27'
  const dateFormatted = formatDate(event.startsAt, 'EEE, MMM d · h:mm a')
  const aspectClass = aspectRatio === '4/5' ? 'aspect-[4/5]' : 'aspect-[16/10]'

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nextState = !isBookmarked
    setIsBookmarked(nextState)
    if (nextState) {
      fireCelebrationConfetti()
    }
  }

  const handlePeekClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onPeek) {
      onPeek(event)
    }
  }

  return (
    <div
      ref={cardRef}
      {...tiltProps}
      className="group relative flex flex-col w-full bg-transparent select-none will-change-transform"
      style={{
        ...tiltStyle,
        ['--card-club-color' as any]: clubColor,
      }}
    >
      {/* Specular glare sheen overlay */}
      <div style={glareStyle} aria-hidden="true" />

      {/* Main clickable area to event details */}
      <Link
        to={`/events/${event.slug || event.id}`}
        className="block w-full focus-visible:outline-none focus-visible:underline"
      >
        {/* Floating Poster with Corner Registration Ticks */}
        <div className="relative mb-2.5">
          <span className="absolute -top-1.5 -left-1.5 text-sky-400 text-xs font-mono pointer-events-none z-20">┌</span>
          <span className="absolute -top-1.5 -right-1.5 text-sky-400 text-xs font-mono pointer-events-none z-20">┐</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-sky-400 text-xs font-mono pointer-events-none z-20">└</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-sky-400 text-xs font-mono pointer-events-none z-20">┘</span>

          <div className={`relative ${aspectClass} w-full overflow-hidden bg-[#0D192E] border border-[#1A2E4C] group-hover:border-sky-400 transition-colors`}>
            <PosterArtwork
              event={event}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            />

            {/* Rank Number if Top Shelf */}
            {typeof rankNumber === 'number' && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-[#08101E]/90 text-sky-400 font-mono text-xs font-bold border border-[#1A2E4C]">
                #{String(rankNumber).padStart(2, '0')}
              </div>
            )}

            {/* Quick Action Floating Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 font-mono text-xs">
              {onPeek && (
                <button
                  type="button"
                  onClick={handlePeekClick}
                  className="w-7 h-7 bg-[#08101E]/90 border border-[#1A2E4C] text-slate-300 hover:text-sky-300 hover:border-sky-400 flex items-center justify-center transition-colors"
                  title="Quick Peek preview"
                  aria-label={`Quick peek for ${event.title}`}
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleBookmarkClick}
                className={cn(
                  'w-7 h-7 border flex items-center justify-center transition-colors',
                  isBookmarked
                    ? 'bg-sky-500/20 text-sky-400 border-sky-400'
                    : 'bg-[#08101E]/90 border-[#1A2E4C] text-slate-300 hover:text-sky-300 hover:border-sky-400'
                )}
                title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark event'}
                aria-label={`Bookmark ${event.title}`}
              >
                <Bookmark className={cn('w-3.5 h-3.5', isBookmarked && 'fill-sky-400')} />
              </button>
            </div>

            {/* Free / Price Tag in bottom corner */}
            <div className="absolute bottom-2 right-2 pointer-events-none font-mono text-xs">
              <span className="px-2 py-0.5 bg-[#08101E]/90 text-slate-200 border border-[#1A2E4C] text-[11px]">
                {event.isFree ? 'FREE' : `₹${event.price || 0}`}
              </span>
            </div>
          </div>
        </div>

        {/* Card Details (Directly on canvas) */}
        <div className="flex flex-col gap-1.5">
          {/* Date Row */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-sky-400 font-semibold uppercase tracking-wider truncate">
              {dateFormatted}
            </span>
            {event.status && event.status !== 'published' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#0D192E] text-slate-400 border border-[#1A2E4C] uppercase flex-shrink-0">
                {event.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-[17px] font-bold leading-snug line-clamp-2 text-white group-hover:text-sky-300 transition-colors font-sans">
            {event.title}
          </h3>

          {/* Capacity Drafting Bar */}
          <div className="space-y-1 pt-0.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">
                <strong className="text-sky-300 font-semibold">{event.registrationsCount || 120}</strong> passholders
              </span>
              <span className="text-[10px] text-slate-500 uppercase">
                {event.isFree ? 'RSVP OPEN' : 'LIMITED'}
              </span>
            </div>

            {/* Drafting Line Gauge */}
            <div className="w-full h-[2px] bg-[#1A2E4C] overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-300"
                style={{ width: `${Math.min(95, Math.max(30, ((event.registrationsCount || 75) % 80) + 20))}%` }}
              />
            </div>
          </div>

          {/* Club with dot & category */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1A2E4C] mt-0.5 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="text-slate-300 truncate">
                {event.organizerName || 'Autonomous Club'}
              </span>
            </div>

            <span className="text-slate-500 uppercase flex-shrink-0 text-[11px]">
              {event.category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export const EventCard = EventCardModern
