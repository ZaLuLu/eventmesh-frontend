import React from 'react'
import { Event } from '@/api'
import { EventLink } from './EventLink'
import { eventPriceLabel, providerInfo } from '@/lib/eventPresentation'
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

export const EventTicketCard: React.FC<EventTicketCardProps> = ({
  event,
  onBookmark,
  isBookmarked = false,
  className = '',
}) => {
  const host = event.club?.name || event.organizerName || (event.kind === 'imported' ? event.provider : 'Organizer')
  const soldOut = event.seatsLeft === 0
  const price = eventPriceLabel(event)
  const isVerified = event.club?.verified ?? false
  const pInfo = providerInfo(event.provider)

  const [imgError, setImgError] = React.useState(false)

  return (
    <article
      data-testid="event-ticket-card"
      className={cn(
        'group flex min-w-0 flex-col rounded-[10px] sm:rounded-[14px] border border-line bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1',
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
          {event.poster && !imgError ? (
            <img
              src={event.poster}
              alt={event.title}
              loading="lazy"
              onError={() => setImgError(true)}
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

        {/* Top Badges: Category + Source Provider */}
        <div className="pointer-events-none absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-wrap items-center gap-1.5">
          <span className="rounded-[3px] sm:rounded-[4px] border border-black bg-white px-1.5 sm:px-2 py-0.5 font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-black shadow-xs">
            {event.category || 'Event'}
          </span>
          <span className={cn('rounded-[3px] sm:rounded-[4px] border px-1.5 sm:px-2 py-0.5 font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 bg-white/95', pInfo.badgeClass)}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pInfo.dotColor }} />
            {pInfo.name}
          </span>
        </div>

        {/* Tactile Bookmark Trigger */}
        {onBookmark && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBookmark(event.id)
            }}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark event'}
            className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 grid h-6 w-6 sm:h-8 sm:w-8 place-items-center rounded-[6px] sm:rounded-[8px] border border-black/15 bg-white text-zinc-900 hover:text-accent shadow-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <BookmarkSimple size={14} className="sm:hidden" weight={isBookmarked ? 'fill' : 'regular'} />
            <BookmarkSimple size={16} className="hidden sm:block" weight={isBookmarked ? 'fill' : 'regular'} />
          </button>
        )}
      </div>

      {/* 2. Typographic Core & Editorial Metadata Dock */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5">
        {/* Host / Organizer Track */}
        <div className="flex min-w-0 items-center justify-between gap-1 text-[9px] sm:text-[11px] font-medium tracking-[0.05em] sm:tracking-[0.08em] uppercase text-ink-muted">
          <div className="flex min-w-0 items-center gap-1 truncate">
            <span className="truncate">{host}</span>
            {isVerified && (
              <CheckCircle size={11} weight="fill" className="shrink-0 text-emerald-500 sm:hidden" aria-label="Verified organizer" />
            )}
            {isVerified && (
              <CheckCircle size={13} weight="fill" className="shrink-0 text-emerald-500 hidden sm:block" aria-label="Verified organizer" />
            )}
          </div>
          <span className="shrink-0 text-[8.5px] sm:text-[10px] font-mono font-medium text-ink-muted flex items-center gap-1">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: pInfo.dotColor }} />
            {pInfo.name}
          </span>
        </div>

        {/* Event Title */}
        <h3 className="line-clamp-2 text-xs sm:text-base font-bold leading-tight sm:leading-snug text-ink font-display group-hover:text-accent transition-colors">
          <EventLink event={event} className="hover:text-accent focus:outline-none">
            {event.title}
          </EventLink>
        </h3>

        {/* Optional Subtitle or Summary (Desktop & Tablet) */}
        {(event.subtitle || event.description) && (
          <p className="hidden sm:line-clamp-2 text-xs text-ink-soft leading-relaxed">
            {event.subtitle || event.description}
          </p>
        )}

        {/* Tabular Bottom Utility Dock */}
        <div className="mt-auto border-t border-line/60 pt-2 sm:pt-3 space-y-1.5 sm:space-y-2.5">
          <div className="flex items-center justify-between gap-1 font-mono text-xs">
            {/* Date & Location */}
            <div className="min-w-0 space-y-0.5 sm:space-y-1 text-[10px] sm:text-[11px] text-ink-soft">
              <div className="flex items-center gap-1 sm:gap-1.5 text-ink font-medium">
                <CalendarBlank size={11} className="shrink-0 text-accent sm:hidden" aria-hidden="true" />
                <CalendarBlank size={13} className="shrink-0 text-accent hidden sm:block" aria-hidden="true" />
                <span className="whitespace-nowrap sm:hidden">{formatDate(event.startsAt, 'compact')}</span>
                <span className="hidden sm:inline whitespace-nowrap">{formatDate(event.startsAt)}</span>
                <span className="hidden sm:inline text-ink-muted">·</span>
                <span className="hidden sm:inline whitespace-nowrap text-ink-muted font-normal">{formatTime(event.startsAt)}</span>
              </div>
              <p className="hidden sm:flex items-center gap-1.5 truncate text-ink-muted text-[10px]">
                <MapPin size={12} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{event.venue?.name || (event.isOnline ? 'Online' : 'Venue TBA')}</span>
              </p>
            </div>

            {/* Price / Pass Status */}
            <div className="shrink-0 text-right">
              {soldOut ? (
                <span className="inline-block rounded-[3px] sm:rounded-[4px] border border-red-500/30 bg-red-500/10 px-1 sm:px-2 py-0.5 font-mono text-[8.5px] sm:text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  Sold Out
                </span>
              ) : (
                <div className="text-right leading-none">
                  <span className="font-mono text-[11px] sm:text-xs font-bold text-ink">{price}</span>
                  {event.seatsLeft != null && event.seatsLeft <= 14 && (
                    <p className="font-mono text-[8px] sm:text-[9px] font-bold uppercase text-accent tracking-wider pt-0.5">{event.seatsLeft} left</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-line/30">
            <EventLink
              event={event}
              className="text-[10px] sm:text-[11px] font-mono font-semibold text-accent hover:text-accent-hover transition-colors inline-flex items-center gap-0.5 sm:gap-1 group-hover:translate-x-0.5"
            >
              <span>{event.kind === 'imported' ? `View on ${pInfo.name} ↗` : 'View Pass'}</span>
              <ArrowRight size={10} className="sm:hidden" weight="bold" />
              <ArrowRight size={11} className="hidden sm:block" weight="bold" />
            </EventLink>

            <EventLink
              event={event}
              aria-label={`Get pass for ${event.title}`}
              className="hidden sm:inline-flex items-center justify-center rounded-[8px] bg-accent hover:bg-accent-hover text-white px-3 py-1 text-xs font-mono font-semibold transition-all shadow-xs hover:shadow-sm active:scale-95"
            >
              {event.kind === 'imported' ? `${pInfo.name} ↗` : 'Get Pass →'}
            </EventLink>
          </div>
        </div>
      </div>
    </article>
  )
}
