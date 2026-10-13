import React from 'react'
import { Link } from 'react-router-dom'
import { BookmarkSimple, MapPin, CalendarBlank, Users } from '@/design-system/Icon'
import { PosterArt } from './visuals/PosterArt'
import { Sticker } from './primitives/Sticker'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { getClubTheme } from './clubColors'
import { Event } from '@/api'

export interface EventTicketCardProps {
  event: Event
  onBookmark?: (eventId: string) => void
  isBookmarked?: boolean
  className?: string
}

/**
 * EventTicketCard: Core Campus Funk Ticket-Object Component
 * Renders an event as a physical perforated ticket stub with genuine bite notches,
 * price/free stickers, generative PosterArt, and 2-tap RSVP access.
 * Kills V-02, V-04, and V-07.
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
  const attendeesCount = event.capacity ? Math.max(0, event.capacity - (event.seatsLeft ?? 0)) : 24
  const seatsLeft = event.seatsLeft
  const hasCustomCover = Boolean(
    event.poster &&
    !event.poster.includes('placeholder') &&
    !event.poster.includes('default') &&
    (event.poster.startsWith('http') || event.poster.startsWith('/images/'))
  )

  return (
    <article
      className={`group relative flex flex-col bg-card border-[1.5px] border-ink rounded-ticket overflow-hidden shadow-offset transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-offset-lg select-none ${className}`}
    >
      {/* 1. TOP COVER / POSTER STAGE */}
      <div className="relative w-full h-48 sm:h-52 overflow-hidden bg-paper-2 border-b border-ink">
        {hasCustomCover ? (
          <img
            src={event.poster}
            alt={event.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <PosterArt
            eventId={event.id}
            title={event.title}
            category={event.category}
            clubId={clubId}
            aspectRatio="video"
          />
        )}

        {/* Top Floating Badge Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <Sticker
              color={isFree ? 'mint' : 'mustard'}
              size="sm"
              tilt={-2}
            >
              {formatCurrency(event.price)}
            </Sticker>
            {isWaitlist && (
              <Sticker color="tangerine" size="sm" tilt={2}>
                Waitlist
              </Sticker>
            )}
            {seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 15 && (
              <Sticker color="pink" size="sm">
                {seatsLeft} left
              </Sticker>
            )}
          </div>

          {/* Bookmark Button */}
          {onBookmark && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onBookmark(event.id)
              }}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
              className="pointer-events-auto p-1.5 rounded-full bg-card/90 border border-ink text-ink hover:bg-cobalt hover:text-white transition-colors shadow-[1px_1px_0_var(--ink)]"
            >
              <BookmarkSimple
                size={16}
                weight={isBookmarked ? 'fill' : 'bold'}
              />
            </button>
          )}
        </div>
      </div>

      {/* 2. PHYSICAL PERFORATION LINE WITH BITE NOTCHES */}
      <div className="relative flex items-center justify-between h-4 bg-card -my-2 z-20">
        <div className="w-4 h-4 rounded-full bg-paper border-r-[1.5px] border-ink -ml-2.5 flex-shrink-0" />
        <div className="flex-1 border-t-[1.5px] border-dashed border-ink/40 mx-2" />
        <div className="w-4 h-4 rounded-full bg-paper border-l-[1.5px] border-ink -mr-2.5 flex-shrink-0" />
      </div>

      {/* 3. TICKET BODY / PARTICULARS */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Club Chip & Date Row */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            <span
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-bold text-xs uppercase border"
              style={{
                backgroundColor: clubTheme.color,
                color: clubTheme.textColor,
                borderColor: '#151130',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {(event as any).organizer?.name || clubTheme.name}
            </span>

            <span className="text-ink-soft font-semibold flex items-center gap-1">
              <CalendarBlank size={13} weight="bold" />
              {formatDate(event.startsAt, 'compact')}
            </span>
          </div>

          {/* Title in Title Case Display Font */}
          <h3 className="font-display font-extrabold text-lg sm:text-xl text-ink leading-snug line-clamp-2 group-hover:text-cobalt transition-colors">
            <Link
              to={`/events/${event.slug || event.id}`}
              className="focus:outline-none focus-visible:underline"
            >
              {event.title}
            </Link>
          </h3>

          {/* Venue with Tooltip wrapping */}
          <div
            className="flex items-center gap-1.5 text-xs text-ink-soft"
            title={event.venue?.name || 'Campus Main Auditorium'}
          >
            <MapPin size={14} weight="bold" className="text-cobalt flex-shrink-0" />
            <span className="truncate">
              {event.venue?.name || 'Campus Main Auditorium'}
            </span>
          </div>
        </div>

        {/* 4. BOTTOM ACTION & ATTENDEE BAR */}
        <div className="pt-3 border-t border-ink/15 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-ink-soft">
            <Users size={14} weight="bold" className="text-ink/60" />
            <span>{attendeesCount} going</span>
          </div>

          <Link
            to={`/events/${event.slug || event.id}`}
            className="btn-funk-primary px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider"
          >
            {isWaitlist ? 'Waitlist' : 'Grab seat'}
          </Link>
        </div>
      </div>
    </article>
  )
}
