import React from 'react'
import { Link } from 'react-router-dom'
import { BookmarkSimple, MapPin, CalendarBlank, Users, ArrowUpRight } from '@/design-system/Icon'
import { PosterArt } from './visuals/PosterArt'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { getClubTheme } from './clubColors'
import { Event } from '@/api'
import { cn } from '@/lib/utils'

export interface EventTicketCardProps {
  event: Event
  onBookmark?: (eventId: string) => void
  isBookmarked?: boolean
  className?: string
}

/**
 * EventTicketCard: Option B Seamless Borderless Art Plate
 * Clean photographic plate with zero cartoon outlines, zero bite notches,
 * and razor-sharp Geist + JetBrains Mono typographic hierarchy.
 */
export const EventTicketCard: React.FC<EventTicketCardProps> = ({
  event,
  onBookmark,
  isBookmarked = false,
  className = '',
}) => {
  const clubId = event.organizerId || (event as any).clubId || (event as any).organizer?.slug
  const clubTheme = getClubTheme(clubId)
  const isFree = event.isFree ?? (!event.price || event.price === 0)
  const isWaitlist = event.seatsLeft === 0 || (event as any).isWaitlist
  const seatsLeft = event.seatsLeft

  const hasCustomCover = Boolean(
    event.poster &&
    !event.poster.includes('placeholder') &&
    !event.poster.includes('default') &&
    (event.poster.startsWith('http') || event.poster.startsWith('/images/'))
  )

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl bg-card transition-all duration-200 hover:bg-surface-subtle/60 p-2.5 -m-2.5 select-none',
        className
      )}
    >
      {/* 1. PHOTOGRAPHIC ART PLATE (16:10 aspect, borderless) */}
      <Link
        to={`/events/${event.slug || event.id}`}
        className="relative w-full aspect-[16/10] overflow-hidden rounded-xl bg-surface-subtle"
        tabIndex={-1}
      >
        {hasCustomCover ? (
          <img
            src={event.poster}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <PosterArt
            eventId={event.id}
            title={event.title}
            category={event.category}
            clubId={clubId}
          />
        )}

        {/* Minimal Category Pill (Top Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-black/60 text-white backdrop-blur-md uppercase tracking-wider">
            {event.category || 'Event'}
          </span>
          {isFree && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/90 text-white backdrop-blur-md">
              Free
            </span>
          )}
        </div>

        {/* Minimal Bookmark Button (Top Right) */}
        {onBookmark && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookmark(event.id)
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center transition-colors"
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
          >
            <BookmarkSimple
              size={15}
              weight={isBookmarked ? 'fill' : 'bold'}
              className={isBookmarked ? 'text-accent' : 'text-white'}
            />
          </button>
        )}
      </Link>

      {/* 2. METADATA STACK (Zero borders, pure typographic flow) */}
      <div className="pt-3.5 pb-1 px-1 flex flex-col flex-1 gap-2">
        {/* Date & Time in JetBrains Mono */}
        <div className="flex items-center justify-between text-xs font-mono text-accent">
          <span>{formatDate(event.startsAt)}</span>
          <span className="text-ink-muted">{formatTime(event.startsAt)}</span>
        </div>

        {/* Event Title */}
        <Link to={`/events/${event.slug || event.id}`} className="focus:outline-none">
          <h3 className="font-sans font-semibold text-base sm:text-lg text-ink group-hover:text-accent transition-colors line-clamp-1 leading-snug">
            {event.title}
          </h3>
        </Link>

        {/* Subtitle / Description */}
        {event.subtitle && (
          <p className="text-xs text-ink-soft line-clamp-1 leading-relaxed">
            {event.subtitle}
          </p>
        )}

        {/* Venue & Host Club */}
        <div className="mt-auto pt-2 flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-1.5 truncate pr-2">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubTheme.hex || 'var(--accent)' }}
            />
            <span className="truncate font-medium text-ink-soft">
              {event.organizerName || 'Campus Society'}
            </span>
          </div>

          {/* Pricing / Capacity indicator */}
          <div className="flex items-center gap-2 font-mono text-[11px] flex-shrink-0">
            {seatsLeft !== undefined && (
              <span className={seatsLeft <= 10 ? 'text-amber-600 font-semibold' : 'text-ink-muted'}>
                {seatsLeft} seats
              </span>
            )}
            <ArrowUpRight
              size={14}
              weight="bold"
              className="text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
