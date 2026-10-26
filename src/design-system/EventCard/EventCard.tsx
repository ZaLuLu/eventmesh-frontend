import { EventLink } from '@/design-system/EventLink'
import { eventPriceLabel } from '@/lib/eventPresentation'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkSimple, CheckCircle, MapPin, CalendarBlank, ArrowRight, Eye, Sparkle } from '@phosphor-icons/react'
import { Event } from '../../api/contracts'
import { Badge } from '../primitives/Badge'
import { PosterArtwork } from '../PosterArtwork'
import { triggerConfetti } from '../../lib/confetti'
import { cn } from '../../lib/utils'

export interface EventCardProps {
  event: Event
  variant?: 'stacked' | 'overlay' | 'list-row'
  aspectRatio?: '5/4' | '4/3' | '16/9' | '1/1'
  isBookmarked?: boolean
  onBookmarkToggle?: (eventId: string, bookmarked: boolean) => void
  onPeek?: (event: Event) => void
  className?: string
  priority?: boolean
}

export function formatCardDate(isoString: string): string {
  try {
    const d = new Date(isoString)
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    const day = d.getDate()
    const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    return `${month} ${day} · ${time}`
  } catch {
    return isoString
  }
}

export const formatPrice = eventPriceLabel

export const EventCard: React.FC<EventCardProps> = ({
  event,
  variant = 'stacked',
  aspectRatio = '5/4',
  isBookmarked: controlledBookmarked,
  onBookmarkToggle,
  onPeek,
  className,
  priority = false,
}) => {
  const [internalBookmarked, setInternalBookmarked] = useState(false)
  const isBookmarked = controlledBookmarked !== undefined ? controlledBookmarked : internalBookmarked

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nextState = !isBookmarked
    setInternalBookmarked(nextState)
    if (nextState) triggerConfetti()
    onBookmarkToggle?.(event.id, nextState)
  }

  const handlePeekClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPeek?.(event)
  }

  const clubColor = event.club?.color || event.organizerColor || '#2F4BD6'
  const isVerified = event.club?.verified ?? false
  const eventLink = `/events/${event.slug || event.id}`
  const dateFormatted = formatCardDate(event.startsAt)
  const isFillingFast =
    event.seatsLeft != null && event.seatsLeft > 0 && event.seatsLeft <= 10
  const seatsLeftLabel = event.seatsLeft != null && event.seatsLeft > 0 ? `${event.seatsLeft} left` : 'Filling fast'
  const isPromoted = Boolean(event.promotion?.label || event.isSignature)
  const isFree = event.isFree || event.price === 0 || !event.features?.paid
  const hasImage = Boolean(event.poster && event.poster.trim().length > 0)

  const getCardCtaLabel = () => {
    if (event.kind !== 'imported') return 'Get Pass'
    const prov = (event.provider || '').toLowerCase()
    const url = (event.sourceUrl || '').toLowerCase()
    if (prov.includes('eventbrite') || url.includes('eventbrite')) return 'Register on Eventbrite ↗'
    if (prov.includes('meetup') || url.includes('meetup')) return 'View on Meetup ↗'
    if (prov.includes('luma') || url.includes('lu.ma')) return 'Register on Luma ↗'
    if (event.provider) return `Register on ${event.provider} ↗`
    return 'Book ↗'
  }

  // -------------------------------------------------------------
  // VARIANT: LIST-ROW
  // -------------------------------------------------------------
  if (variant === 'list-row') {
    return (
      <article
        data-testid="event-card-list-row"
        className={cn(
          'group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6',
          'bg-transparent border-b border-line py-4 transition-colors hover:border-accent',
          className
        )}
      >
        {/* Left Thumbnail */}
        <div className="relative w-full sm:w-48 md:w-56 aspect-[16/10] sm:aspect-[4/3] rounded-lg overflow-hidden border border-line group-hover:border-accent transition-colors flex-shrink-0">
          <PosterArtwork
            id={event.id}
            title={event.title}
            category={event.category}
            clubName={event.club?.name || event.organizerName}
            clubColor={clubColor}
            imageUrl={event.poster}
            priority={priority}
          />

          {/* Badges on thumbnail */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none font-mono text-xs">
            {isFillingFast && (
              <span className="px-2 py-0.5 bg-warning-soft text-warning border border-warning/30 rounded-full text-[10px] font-medium">
                {seatsLeftLabel}
              </span>
            )}
            {isFree ? (
              <span className="px-2 py-0.5 bg-success-soft text-success border border-success/30 rounded-full text-[10px] font-medium">
                Free
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-card text-ink border border-line rounded-full text-[10px] font-medium shadow-xs">
                {formatPrice(event)}
              </span>
            )}
          </div>
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Date & Category */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-medium text-accent uppercase tracking-wider">
              {dateFormatted}
            </span>
            <span className="text-ink-muted">·</span>
            <span className="text-xs font-mono text-ink-soft uppercase">{event.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg sm:text-xl text-ink font-semibold leading-tight line-clamp-2 mb-2 group-hover:text-accent transition-colors">
            <EventLink
              event={event}
              className="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
            >
              {event.title}
            </EventLink>
          </h3>

          {/* Club attribution */}
          <div className="flex items-center gap-2 text-xs font-mono text-ink-soft">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubColor }}
              aria-hidden="true"
            />
            <span className="text-ink truncate">
              {event.club?.name || event.organizerName || 'Autonomous Club'}
            </span>
            {isVerified && (
              <span title="Verified Club" className="inline-flex items-center text-accent">
                <CheckCircle className="w-3.5 h-3.5 text-accent" />
              </span>
            )}
            {event.venue?.name && (
              <>
                <span className="text-ink-muted">·</span>
                <span className="truncate flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  {event.venue.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 relative z-10">
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-150',
              isBookmarked
                ? 'bg-accent/10 text-accent border-accent'
                : 'bg-surface text-ink-soft border-line hover:border-accent hover:text-accent'
            )}
          >
            <BookmarkSimple className={cn('w-3.5 h-3.5', isBookmarked && 'fill-accent')} />
          </button>

          <EventLink
            event={event}
            aria-hidden="true"
            tabIndex={-1}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:underline uppercase font-medium"
          >
            <span>View event</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </EventLink>
        </div>
      </article>
    )
  }

  // -------------------------------------------------------------
  // VARIANT: OVERLAY
  // -------------------------------------------------------------
  if (variant === 'overlay') {
    return (
      <article
        data-testid="event-card-overlay"
        className={cn(
          'group relative overflow-hidden bg-card rounded-xl border border-line hover:border-accent transition-all shadow-xs flex flex-col',
          className
        )}
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-surface-subtle">
          <PosterArtwork
            id={event.id}
            title={event.title}
            category={event.category}
            clubName={event.club?.name || event.organizerName}
            clubColor={clubColor}
            imageUrl={event.poster}
            priority={priority}
          />

          {/* Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

          {/* Top badges & actions */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none font-mono text-xs">
            <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
              {isFillingFast && (
                <span className="px-2 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/40 text-[10px] font-medium">
                  {seatsLeftLabel}
                </span>
              )}
              {isFree ? (
                <span className="px-2 py-0.5 rounded-full bg-success-soft text-success border border-success/40 text-[10px] font-medium">
                  FREE
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-card text-ink border border-line text-[10px] font-medium shadow-xs">
                  {formatPrice(event)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {onPeek && (
                <button
                  type="button"
                  onClick={handlePeekClick}
                  title="Quick Preview"
                  aria-label="Quick preview event"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-surface border border-line text-ink hover:text-accent hover:border-accent transition-colors shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleBookmarkClick}
                aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border transition-colors duration-150 shadow-xs',
                  isBookmarked
                    ? 'bg-accent/15 text-accent border-accent'
                    : 'bg-surface text-ink border-line hover:text-accent hover:border-accent'
                )}
              >
                <BookmarkSimple className={cn('w-3.5 h-3.5', isBookmarked && 'fill-accent')} />
              </button>
            </div>
          </div>

          {/* Bottom overlaid text */}
          <div className="absolute bottom-2.5 inset-x-2.5 p-1 z-10">
            <span className="block text-xs font-mono font-medium text-accent uppercase tracking-wider mb-1">
              {dateFormatted}
            </span>
            <h3 className="font-display text-lg font-semibold text-white leading-tight line-clamp-2 mb-1.5">
              <EventLink
                event={event}
                className="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
              >
                {event.title}
              </EventLink>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-white/80">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="text-white truncate">
                {event.club?.name || event.organizerName || 'Autonomous Club'}
              </span>
              {isVerified && (
                <span title="Verified Club" className="inline-flex items-center text-accent">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    )
  }

  // -------------------------------------------------------------
  // VARIANT: STACKED (CLEAN ARCHITECTURAL BENTO POSTER)
  // -------------------------------------------------------------
  const aspectClass =
    aspectRatio === '4/3'
      ? 'aspect-[4/3]'
      : aspectRatio === '16/9'
      ? 'aspect-[16/9]'
      : aspectRatio === '1/1'
      ? 'aspect-square'
      : 'aspect-[5/4]'

  return (
    <article
      data-testid="event-card-stacked"
      className={cn(
        'group relative flex flex-col justify-between bg-card rounded-[24px] border border-line p-3 hover:border-line-strong transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5',
        className
      )}
    >
      <div>
        {/* Inset Framed Poster (18px inner radius, 12px margin) */}
        <div className="relative mb-3">
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-[18px] bg-surface-subtle border border-line/40 transition-colors flex-shrink-0',
              aspectClass
            )}
          >
            <PosterArtwork
              id={event.id}
              title={event.title}
              category={event.category}
              clubName={event.club?.name || event.organizerName}
              clubColor={clubColor}
              imageUrl={event.poster}
              priority={priority}
            />

            {/* Top Badges & Actions (Max 2 badges: date/time or filling fast, and price) */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10 font-mono text-xs">
              <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
                {isFillingFast ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-warning-soft text-warning border border-warning/40 text-[10px] font-mono font-medium shadow-xs">
                    {seatsLeftLabel}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-card text-accent border border-line text-[10px] font-mono font-medium shadow-xs">
                    {dateFormatted}
                  </span>
                )}
                {isFree ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-success-soft text-success border border-success/40 text-[10px] font-mono font-medium shadow-xs">
                    Free
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-card text-ink border border-line text-[10px] font-mono font-medium shadow-xs">
                    {formatPrice(event)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 pointer-events-auto">
                {onPeek && (
                  <button
                    type="button"
                    onClick={handlePeekClick}
                    title="Quick Preview"
                    aria-label="Quick preview event"
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-card border border-line text-ink hover:text-accent hover:border-accent transition-colors shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBookmarkClick}
                  aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center border transition-colors duration-150 shadow-xs',
                    isBookmarked
                      ? 'bg-accent/15 text-accent border-accent'
                      : 'bg-card text-ink-soft border-line hover:text-accent hover:border-accent'
                  )}
                >
                  <BookmarkSimple className={cn('w-3.5 h-3.5', isBookmarked && 'fill-accent')} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-1 space-y-1.5">
          {/* Host & Verified */}
          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubColor }}
              aria-hidden="true"
            />
            <span className="text-ink truncate font-medium">
              {event.club?.name || event.organizerName || 'Autonomous Club'}
            </span>
            {isVerified && (
              <span title="Verified Club" className="inline-flex items-center text-emerald-500 flex-shrink-0">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3 className="font-display text-base sm:text-lg text-ink font-semibold leading-tight tracking-tight line-clamp-2 group-hover:text-accent transition-colors">
            <EventLink
              event={event}
              className="focus:outline-none focus-visible:underline"
            >
              {event.title}
            </EventLink>
          </h3>

          {/* Category & Source subtle text under title */}
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-ink-muted">
            <span className="capitalize">{event.category}</span>
            {(event.provider || event.sourceUrl || event.kind === 'imported') && (
              <>
                <span>·</span>
                <span className="capitalize">{event.provider || 'External'}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Split Utility Dock */}
      <div className="pt-3 mt-4 border-t border-line px-1 flex items-center justify-between text-xs font-mono text-ink-soft">
        <div className="min-w-0 space-y-0.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-accent">
            <CalendarBlank className="w-3 h-3 text-accent" />
            <span className="truncate">{dateFormatted}</span>
          </div>
          {event.venue?.name && (
            <div className="flex items-center gap-1.5 text-ink-muted">
              <MapPin className="w-3 h-3 text-ink-muted flex-shrink-0" />
              <span className="truncate max-w-[130px]">{event.venue.name}</span>
            </div>
          )}
        </div>

        <EventLink
          event={event}
          className="flex-shrink-0 rounded-full bg-ink px-4 py-1.5 font-mono text-xs font-semibold text-paper hover:bg-accent hover:text-white active:scale-[0.98] transition-all shadow-xs"
        >
          {getCardCtaLabel()}
        </EventLink>
      </div>
    </article>
  )
}
