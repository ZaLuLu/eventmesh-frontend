import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Bookmark } from 'lucide-react'
import { Event } from '@/api'
import { formatDate } from '@/lib/dates'
import { PosterArtwork } from '@/design-system/PosterArtwork'
import { fireCelebrationConfetti } from '@/lib/confetti'
import { useCardTilt } from '@/hooks/useCardTilt'

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
      className="group relative flex flex-col w-full bg-surface border border-line rounded-panel overflow-hidden transition-colors duration-200 hover:border-line-focus hover:shadow-card-hover select-none will-change-transform"
      style={{
        ...tiltStyle,
        ['--card-club-color' as any]: clubColor,
      }}
    >
      {/* Specular glare sheen overlay */}
      <div style={glareStyle} aria-hidden="true" />

      {/* 4px solid top edge in club color with subtle ambient halo */}
      <div
        className="h-1 w-full transition-all duration-300 group-hover:h-1.5"
        style={{ backgroundColor: clubColor }}
        aria-hidden="true"
      />

      {/* Main clickable area to event details */}
      <Link
        to={`/events/${event.slug}`}
        className="block w-full focus-visible:outline-2 focus-visible:outline-text"
      >
        {/* Generative Poster Container */}
        <div className={`relative ${aspectClass} w-full overflow-hidden bg-subtle`}>
          <PosterArtwork
            event={event}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Rank Number if Top Shelf */}
          {typeof rankNumber === 'number' && (
            <div className="absolute top-2.5 left-2.5 h-7 w-7 rounded-full bg-surface/90 backdrop-blur-md text-text font-bold text-caption flex items-center justify-center border border-line shadow-sm">
              #{rankNumber}
            </div>
          )}

          {/* Quick Action Floating Overlay */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
            {onPeek && (
              <button
                type="button"
                onClick={handlePeekClick}
                className="h-8 w-8 rounded-full bg-surface/90 backdrop-blur-md border border-line text-text hover:text-accent hover:border-accent flex items-center justify-center shadow-sm transition-all hover:scale-110 active:scale-95"
                title="Quick Peek preview"
                aria-label={`Quick peek for ${event.title}`}
              >
                <Eye className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleBookmarkClick}
              className={`h-8 w-8 rounded-full backdrop-blur-md border shadow-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                isBookmarked
                  ? 'bg-accent text-on-accent border-accent'
                  : 'bg-surface/90 border-line text-text hover:text-accent'
              }`}
              title={isBookmarked ? 'Saved to bookmarks' : 'Bookmark event'}
              aria-label={`Bookmark ${event.title}`}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Free / Price Tag in bottom corner */}
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-caption font-semibold bg-surface/90 backdrop-blur-md text-text border border-line shadow-sm">
              {event.isFree ? 'Free admission' : `₹${event.price || 0}`}
            </span>
          </div>
        </div>

        {/* Card Details */}
        <div className="p-4 flex flex-col gap-2">
          {/* Date Row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-small text-text-2 font-normal truncate">
              {dateFormatted}
            </span>
            {event.status && event.status !== 'published' && (
              <span className="text-caption font-medium px-2 py-0.5 rounded-full bg-subtle text-text-2 border border-line flex-shrink-0">
                {event.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-[18px] sm:text-[19px] font-semibold leading-snug line-clamp-2 text-text group-hover:text-accent transition-colors">
            {event.title}
          </h3>

          {/* Club with 10px dot & category */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-line/60 mt-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0 shadow-xs"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="text-small text-text-2 truncate font-medium">
                {event.organizerName || 'Technical Collective'}
              </span>
            </div>

            <span className="text-caption text-text-3 font-medium flex-shrink-0">
              {event.category}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}

export const EventCard = EventCardModern
