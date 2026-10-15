import { EventLink } from './EventLink'
import { eventPriceLabel } from '@/lib/eventPresentation'
import React from 'react'
import { BookmarkSimple, CheckCircle, MapPin, CalendarBlank } from '@/design-system/Icon'
import { Event } from '@/api'
import { formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { PosterArt } from './visuals/PosterArt'

export interface EventTicketCardProps {
  event: Event
  onBookmark?: (eventId: string) => void
  isBookmarked?: boolean
  className?: string
}

/**
 * EventTicketCard
 * Implements Section 4.3 Inset-Frame Solid Card (Hallmark Study DNA):
 * - 100% Solid opaque surface with rounded-[24px] outer frame and 1px border.
 * - Inset 12px margin framing the rounded-[18px] poster container.
 * - Typographic core with verified organizer checkmark.
 * - Bottom Split Utility Dock: Tabular metadata left + Rounded-full Pill CTA right.
 */
export const EventTicketCard: React.FC<EventTicketCardProps> = ({
  event,
  onBookmark,
  isBookmarked = false,
  className = '',
}) => {
  const host = event.club?.name || event.organizerName || 'Organizer'
  const soldOut = event.seatsLeft === 0
  const price = eventPriceLabel(event)
  const isVerified = event.club?.verified ?? false

  return (
    <article
      data-testid="event-ticket-card"
      className={cn(
        'group flex min-w-0 flex-col rounded-[24px] border border-line bg-card p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Inset Media Frame (18px inner radius with 12px margin) */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-surface-subtle border border-line/40">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
          />
        ) : (
          <PosterArt
            eventId={event.id}
            title={event.title}
            category={event.category}
            clubId={event.organizerId}
          />
        )}

        {/* Category Pill Tag */}
        <span className="absolute left-2.5 top-2.5 rounded-full bg-card/90 backdrop-blur-xs px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink border border-line/40 shadow-xs">
          {event.category || 'Event'}
        </span>

        {/* Bookmark Trigger */}
        {onBookmark && (
          <button
            type="button"
            onClick={() => onBookmark(event.id)}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
            className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-card/90 backdrop-blur-xs text-ink hover:text-accent border border-line/40 shadow-xs transition-colors"
          >
            <BookmarkSimple size={15} weight={isBookmarked ? 'fill' : 'regular'} />
          </button>
        )}
      </div>

      {/* Typographic Core */}
      <div className="flex flex-1 flex-col px-1 pb-1 pt-3.5 space-y-1.5">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-ink-soft">
          <span className="truncate font-medium">{host}</span>
          {isVerified && (
            <CheckCircle size={14} weight="fill" className="shrink-0 text-emerald-500" aria-label="Verified organizer" />
          )}
        </div>

        <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-ink font-display group-hover:text-accent transition-colors">
          <EventLink event={event} className="hover:text-accent">
            {event.title}
          </EventLink>
        </h3>

        {event.kind === 'imported' && (
          <p className="text-xs text-ink-muted">On {event.provider || 'event provider'}</p>
        )}

        {(event.subtitle || event.description) && (
          <p className="line-clamp-2 text-xs sm:text-sm text-ink-soft leading-relaxed">
            {event.subtitle || event.description}
          </p>
        )}

        {/* Split Utility Dock */}
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line/60 pt-3 text-xs">
          <div className="min-w-0 space-y-1 font-mono text-ink-soft text-[11px]">
            <p className="flex items-center gap-1.5 truncate">
              <CalendarBlank size={13} className="shrink-0 text-accent" aria-hidden="true" />
              <span>{formatDate(event.startsAt)} · {formatTime(event.startsAt)}</span>
            </p>
            <p className="flex items-center gap-1.5 truncate">
              <MapPin size={13} className="shrink-0 text-ink-muted" aria-hidden="true" />
              <span className="truncate">{event.venue?.name || (event.isOnline ? 'Online' : 'Venue TBA')}</span>
            </p>
            <p className="font-semibold text-ink pt-0.5">
              {soldOut ? (
                <span className="text-red-500 font-bold uppercase tracking-wider text-[10px]">Sold Out</span>
              ) : event.seatsLeft != null && event.seatsLeft <= 14 ? (
                <span className="text-accent font-semibold">{event.seatsLeft} passes left</span>
              ) : (
                price
              )}
            </p>
          </div>

          <EventLink
            event={event}
            className="btn-minimal-primary shrink-0 px-4 py-1.5 text-xs font-mono font-medium shadow-xs"
          >
            {event.kind === 'imported' ? 'Inspect ↗' : 'View Pass'}
          </EventLink>
        </div>
      </div>
    </article>
  )
}
