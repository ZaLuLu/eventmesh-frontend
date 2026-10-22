import React from 'react'
import { Event } from '@/api'
import { EventLink } from './EventLink'
import { eventPriceLabel } from '@/lib/eventPresentation'
import { BookmarkSimple, CheckCircle, MapPin, CalendarBlank, ArrowRight } from '@/design-system/Icon'
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
 * Implements Denim Dept & Hallmark Anti-Slop Card Architecture (Phase 4):
 * - Solitary 14px outer radius frame (Gate 22: eliminated nested 24px/18px clunkiness).
 * - Authentic 3:4 vertical portrait ratio (high content-to-chrome ratio).
 * - Rectangular 1px hairline bordered badge with 4px radius (Denim Dept signature).
 * - Clean non-circular bookmark trigger (8px control radius).
 * - Structured metadata hierarchy: Club Tracker -> Bold Display Title -> Tabular Date/Price Dock.
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
        'group flex min-w-0 flex-col rounded-[14px] border border-line bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* 1. Portrait Media Frame (Solitary 3:4 aspect ratio, full-bleed top) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-subtle">
        <EventLink
          event={event}
          aria-label={`View details for ${event.title}`}
          className="block h-full w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {event.poster ? (
            <img
              src={event.poster}
              alt={event.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
            />
          ) : (
            <PosterArt
              eventId={event.id}
              title={event.title}
              category={event.category}
              clubId={event.organizerId}
              aspectRatio="poster"
              className="h-full w-full"
            />
          )}
        </EventLink>

        {/* Denim Dept Signature Rectangular Tag (1px solid border, 4px radius, pure contrast) */}
        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-[4px] border border-black bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-xs">
          {event.category || 'Event'}
        </span>

        {/* Tactile Bookmark Trigger (Normalized 8px control radius, solid white surface) */}
        {onBookmark && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookmark(event.id)
            }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
            className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-[8px] border border-black/15 bg-white text-zinc-900 hover:text-accent shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <BookmarkSimple size={16} weight={isBookmarked ? 'fill' : 'regular'} />
          </button>
        )}
      </div>

      {/* 2. Typographic Core & Editorial Metadata Dock */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4 space-y-2.5">
        {/* Host / Organizer Track */}
        <div className="flex min-w-0 items-center justify-between gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted">
          <div className="flex min-w-0 items-center gap-1.5 truncate">
            <span className="truncate">{host}</span>
            {isVerified && (
              <CheckCircle size={13} weight="fill" className="shrink-0 text-emerald-500" aria-label="Verified organizer" />
            )}
          </div>
          {event.kind === 'imported' && (
            <span className="shrink-0 text-[10px] font-mono text-ink-muted">via {event.provider}</span>
          )}
        </div>

        {/* Event Title */}
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-ink font-display group-hover:text-accent transition-colors">
          <EventLink event={event} className="hover:text-accent focus:outline-none">
            {event.title}
          </EventLink>
        </h3>

        {/* Optional Subtitle or Summary */}
        {(event.subtitle || event.description) && (
          <p className="line-clamp-2 text-xs text-ink-soft leading-relaxed">
            {event.subtitle || event.description}
          </p>
        )}

        {/* Tabular Bottom Utility Dock */}
        <div className="mt-auto border-t border-line/60 pt-3 space-y-2.5">
          <div className="flex items-end justify-between gap-2 font-mono text-xs">
            {/* Date & Location */}
            <div className="min-w-0 space-y-1 text-[11px] text-ink-soft">
              <div className="flex items-center gap-1.5 text-ink font-medium">
                <CalendarBlank size={13} className="shrink-0 text-accent" aria-hidden="true" />
                <span className="whitespace-nowrap">{formatDate(event.startsAt)}</span>
                <span className="text-ink-muted">·</span>
                <span className="whitespace-nowrap text-ink-muted font-normal">{formatTime(event.startsAt)}</span>
              </div>
              <p className="flex items-center gap-1.5 truncate text-ink-muted text-[10px]">
                <MapPin size={12} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{event.venue?.name || (event.isOnline ? 'Online' : 'Venue TBA')}</span>
              </p>
            </div>

            {/* Price / Pass Status */}
            <div className="shrink-0 text-right">
              {soldOut ? (
                <span className="inline-block rounded-[4px] border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Sold Out
                </span>
              ) : event.seatsLeft != null && event.seatsLeft <= 14 ? (
                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-ink">{price}</span>
                  <p className="font-mono text-[9px] font-bold uppercase text-accent tracking-wider">{event.seatsLeft} left</p>
                </div>
              ) : (
                <span className="font-mono text-xs font-bold text-ink">{price}</span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-line/30">
            <EventLink
              event={event}
              className="text-[11px] font-mono font-semibold text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-1 group-hover:translate-x-0.5"
            >
              <span>{event.kind === 'imported' ? 'Inspect Details' : 'View Pass'}</span>
              <ArrowRight size={11} weight="bold" />
            </EventLink>

            <EventLink
              event={event}
              aria-label={`Get pass for ${event.title}`}
              className="inline-flex items-center justify-center rounded-[8px] bg-accent hover:bg-accent-hover text-white px-3 py-1 text-xs font-mono font-semibold transition-all shadow-xs hover:shadow-sm active:scale-95"
            >
              {event.kind === 'imported' ? 'Inspect ↗' : 'Get Pass →'}
            </EventLink>
          </div>
        </div>
      </div>
    </article>
  )
}
