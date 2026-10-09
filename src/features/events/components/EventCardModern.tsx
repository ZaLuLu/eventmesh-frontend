import React from 'react'
import { Link } from 'react-router-dom'
import { Event } from '@/api'
import { formatDate } from '@/lib/dates'

export interface EventCardModernProps {
  event: Event
  rankNumber?: number
  layout?: 'standard' | 'compact' | 'widescreen'
  aspectRatio?: '16/10' | '4/5'
}

/**
 * EventCard component built strictly to Calm Coral specifications:
 * - Image (4:5 or 16:10, radius 14px, 4px club top edge)
 * - Date (14px, --text-2)
 * - Title (18 to 20px, weight 600, 2 lines max)
 * - Club with 10px dot
 * - Price or "Free"
 * - Status tag (13px solid pill)
 * - Whole card is one link; hover = title underline only; no shadow, no lift.
 */
export const EventCardModern: React.FC<EventCardModernProps> = ({
  event,
  rankNumber,
  layout = 'standard',
  aspectRatio = '16/10',
}) => {
  const fallbackCover =
    event.banner ||
    event.poster ||
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'

  const clubColor = event.organizerColor || '#C93E27'
  const dateFormatted = formatDate(event.startsAt, 'EEE, MMM d · h:mm a')

  const aspectClass = aspectRatio === '4/5' ? 'aspect-[4/5]' : 'aspect-[16/10]'

  return (
    <Link
      to={`/events/${event.slug}`}
      className="group block w-full bg-surface border border-line rounded-panel overflow-hidden transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-text select-none"
    >
      {/* 4px solid top edge in club color */}
      <div
        className="h-1 w-full"
        style={{ backgroundColor: clubColor }}
        aria-hidden="true"
      />

      {/* Cover Image Container */}
      <div className={`relative ${aspectClass} w-full overflow-hidden bg-subtle`}>
        <img
          src={fallbackCover}
          alt={event.title}
          className="h-full w-full object-cover"
          loading="lazy"
        />

        {/* Rank Number if Top Shelf */}
        {typeof rankNumber === 'number' && (
          <div className="absolute top-2.5 left-2.5 h-7 w-7 rounded-full bg-surface text-text font-bold text-caption flex items-center justify-center border border-line">
            #{rankNumber}
          </div>
        )}

        {/* Free / Price Tag in corner */}
        <div className="absolute bottom-2.5 right-2.5">
          <span className="inline-block px-2.5 py-0.5 rounded-full text-caption font-semibold bg-surface text-text border border-line">
            {event.isFree ? 'Free' : `₹${event.price || 0}`}
          </span>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex flex-col gap-2">
        {/* Date Row (14px, --text-2) */}
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

        {/* Title (18-20px, weight 600, 2 lines max, hover underline only) */}
        <h3 className="text-[18px] sm:text-[20px] font-semibold leading-snug line-clamp-2 text-text group-hover:underline">
          {event.title}
        </h3>

        {/* Club with 10px dot & category */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-line/60">
          <div className="flex items-center gap-2 min-w-0">
            {/* 10px Club Dot */}
            <span
              className="h-2.5 w-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubColor }}
              aria-hidden="true"
            />
            <span className="text-small text-text-2 truncate font-medium">
              {event.organizerName}
            </span>
          </div>

          <span className="text-caption text-text-3 flex-shrink-0">
            {event.category}
          </span>
        </div>
      </div>
    </Link>
  )
}

export const EventCard = EventCardModern
