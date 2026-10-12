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
          <span className="absolute -top-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┌</span>
          <span className="absolute -top-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┐</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">└</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┘</span>

          <div className={`relative ${aspectClass} w-full overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] group-hover:border-[#0047FF] transition-colors`}>
            <PosterArtwork
              event={event}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
            />

            {/* Rank Number if Top Shelf */}
            {typeof rankNumber === 'number' && (
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/95 text-[#0047FF] font-mono text-xs font-bold border border-[#E2E8F0]">
                #{String(rankNumber).padStart(2, '0')}
              </div>
            )}

            {/* Quick Action Floating Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 font-mono text-xs">
              {onPeek && (
                <button
                  type="button"
                  onClick={handlePeekClick}
                  className="w-7 h-7 bg-white/95 border border-[#E2E8F0] text-slate-700 hover:text-[#0047FF] hover:border-[#0047FF] flex items-center justify-center transition-colors"
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
                    ? 'bg-[#0047FF]/10 text-[#0047FF] border-[#0047FF]'
                    : 'bg-white/95 border-[#E2E8F0] text-slate-700 hover:text-[#0047FF] hover:border-[#0047FF]'
                )}
                title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark event'}
                aria-label={`Bookmark ${event.title}`}
              >
                <Bookmark className={cn('w-3.5 h-3.5', isBookmarked && 'fill-[#0047FF]')} />
              </button>
            </div>

            {/* Free / Price Tag in bottom corner */}
            <div className="absolute bottom-2 right-2 pointer-events-none font-mono text-xs">
              <span className="px-2 py-0.5 bg-white/95 text-[#0A0A0A] border border-[#E2E8F0] text-[11px] font-semibold">
                {event.isFree ? 'FREE' : `₹${event.price || 0}`}
              </span>
            </div>
          </div>
        </div>

        {/* Card Details (Directly on canvas) */}
        <div className="flex flex-col gap-1.5">
          {/* Date Row */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span className="text-[#0047FF] font-semibold uppercase tracking-wider truncate">
              {dateFormatted}
            </span>
            {event.status && event.status !== 'published' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-[#F8FAFC] text-slate-600 border border-[#E2E8F0] uppercase flex-shrink-0">
                {event.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-[17px] font-bold leading-snug line-clamp-2 text-[#0A0A0A] group-hover:text-[#0047FF] transition-colors font-sans">
            {event.title}
          </h3>

          {/* Capacity Drafting Bar */}
          <div className="space-y-1 pt-0.5 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">
                <strong className="text-[#0047FF] font-semibold">{event.registrationsCount || 120}</strong> passholders
              </span>
              <span className="text-[10px] text-slate-500 uppercase">
                {event.isFree ? 'RSVP OPEN' : 'LIMITED'}
              </span>
            </div>

            {/* Drafting Line Gauge */}
            <div className="w-full h-[2px] bg-[#E2E8F0] overflow-hidden">
              <div
                className="h-full bg-[#0047FF] transition-all duration-300"
                style={{ width: `${Math.min(95, Math.max(30, ((event.registrationsCount || 75) % 80) + 20))}%` }}
              />
            </div>
          </div>

          {/* Club with dot & category */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0] mt-0.5 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="text-slate-700 truncate">
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
