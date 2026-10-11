import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, CheckCircle2, MapPin, Calendar, ArrowRight, Eye, Sparkles } from 'lucide-react'
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

export function formatPrice(event: Event): string {
  if (event.isFree || event.price === 0 || !event.features?.paid) {
    return 'Free'
  }
  if (event.price) {
    return `₹${event.price}`
  }
  return 'Free'
}

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
  const isVerified = event.club?.verified ?? true
  const eventLink = `/events/${event.slug || event.id}`
  const dateFormatted = formatCardDate(event.startsAt)
  const isFillingFast =
    event.seatsLeft !== undefined && event.seatsLeft > 0 && event.seatsLeft <= 5
  const isPromoted = Boolean(event.promotion?.label || event.isSignature)
  const isFree = event.isFree || event.price === 0 || !event.features?.paid
  const hasImage = Boolean(event.poster && event.poster.trim().length > 0)

  // -------------------------------------------------------------
  // VARIANT: LIST-ROW
  // -------------------------------------------------------------
  if (variant === 'list-row') {
    return (
      <article
        data-testid="event-card-list-row"
        className={cn(
          'group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6',
          'bg-surface border border-line rounded-[22px] p-3 sm:p-4',
          'transition-all duration-300 ease-out hover:shadow-card hover:border-champion/30',
          className
        )}
      >
        {/* Left Thumbnail */}
        <div className="relative w-full sm:w-48 md:w-56 aspect-[16/10] sm:aspect-[4/3] rounded-[18px] overflow-hidden bg-surface-sunken flex-shrink-0">
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
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10 pointer-events-none">
            {isFillingFast && <Badge variant="filling">Filling fast</Badge>}
            {isFree ? (
              <Badge variant="free">Free</Badge>
            ) : (
              <Badge variant="outline">{formatPrice(event)}</Badge>
            )}
          </div>
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Date & Category */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[13px] font-semibold text-champion uppercase tracking-wider">
              {dateFormatted}
            </span>
            <span className="text-ink-subtle">·</span>
            <span className="text-[13px] text-ink-muted capitalize">{event.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl sm:text-2xl text-ink leading-tight font-normal line-clamp-2 mb-2 group-hover:text-champion transition-colors">
            <Link
              to={eventLink}
              className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-champion rounded-[22px]"
            >
              {event.title}
            </Link>
          </h3>

          {/* Club attribution */}
          <div className="flex items-center gap-2 text-[13px] text-ink-muted">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubColor }}
              aria-hidden="true"
            />
            <span className="font-medium text-ink truncate">
              {event.club?.name || event.organizerName || 'Autonomous Club'}
            </span>
            {isVerified && (
              <span title="Verified Club" className="inline-flex items-center text-[#1FA34A]">
                <CheckCircle2 className="w-3.5 h-3.5 fill-[#1FA34A] text-white" />
              </span>
            )}
            {event.venue?.name && (
              <>
                <span className="text-ink-subtle">·</span>
                <span className="truncate flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {event.venue.name}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-4 relative z-10">
          <button
            type="button"
            onClick={handleBookmarkClick}
            aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-200',
              isBookmarked
                ? 'bg-champion text-white border-champion shadow-sm'
                : 'bg-white text-ink border-line hover:border-champion hover:text-champion'
            )}
          >
            <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-white')} />
          </button>

          <Link
            to={eventLink}
            aria-hidden="true"
            tabIndex={-1}
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-champion hover:gap-2 transition-all"
          >
            <span>View event</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
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
          'group relative overflow-hidden rounded-[28px] p-3 bg-surface border border-line',
          'transition-all duration-300 ease-out hover:shadow-card hover:border-champion/30 flex flex-col',
          className
        )}
      >
        <div className="relative w-full aspect-[4/3] rounded-[22px] overflow-hidden bg-surface-sunken">
          <PosterArtwork
            id={event.id}
            title={event.title}
            category={event.category}
            clubName={event.club?.name || event.organizerName}
            clubColor={clubColor}
            imageUrl={event.poster}
            priority={priority}
          />

          {/* Dark gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* Top badges & actions */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
              {isPromoted && <Badge variant="promoted">Promoted</Badge>}
              {isFillingFast && <Badge variant="filling">Filling fast</Badge>}
              {isFree ? (
                <Badge variant="free">Free</Badge>
              ) : (
                <Badge variant="outline" className="bg-white/90 text-ink border-transparent">
                  {formatPrice(event)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {onPeek && (
                <button
                  type="button"
                  onClick={handlePeekClick}
                  title="Quick Preview"
                  aria-label="Quick preview event"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm text-ink hover:bg-white hover:text-champion shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleBookmarkClick}
                aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  isBookmarked
                    ? 'bg-champion text-white shadow-sm'
                    : 'bg-white/90 backdrop-blur-sm text-ink hover:bg-white hover:text-champion shadow-xs'
                )}
              >
                <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-white')} />
              </button>
            </div>
          </div>

          {/* Bottom overlaid text */}
          <div className="absolute bottom-3 inset-x-3 p-2 z-10">
            <span className="block text-[13px] font-semibold text-white/90 uppercase tracking-wider mb-1">
              {dateFormatted}
            </span>
            <h3 className="font-serif text-2xl text-white font-normal leading-tight line-clamp-2 mb-2 drop-shadow-sm">
              <Link
                to={eventLink}
                className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-[22px]"
              >
                {event.title}
              </Link>
            </h3>
            <div className="flex items-center gap-2 text-[13px] text-white/80">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="font-medium text-white truncate">
                {event.club?.name || event.organizerName || 'Autonomous Club'}
              </span>
              {isVerified && (
                <span title="Verified Club" className="inline-flex items-center text-[#1FA34A]">
                  <CheckCircle2 className="w-3.5 h-3.5 fill-[#1FA34A] text-white" />
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    )
  }

  // -------------------------------------------------------------
  // VARIANT: STACKED (DEFAULT - 28px outer, 12px padding, 22px inner)
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
        'group relative flex flex-col justify-between',
        'bg-surface border border-line rounded-[28px] p-3',
        'transition-all duration-300 ease-out hover:shadow-card hover:border-champion/30',
        className
      )}
    >
      <div>
        {/* Inner Image Container (22px radius) */}
        <div
          className={cn(
            'relative w-full rounded-[22px] overflow-hidden bg-surface-sunken flex-shrink-0 mb-3.5',
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

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
              {isPromoted && <Badge variant="promoted">Promoted</Badge>}
              {isFillingFast && <Badge variant="filling">Filling fast</Badge>}
              {isFree ? (
                <Badge variant="free">Free</Badge>
              ) : (
                <Badge variant="outline" className="bg-white/95 text-ink shadow-xs">
                  {formatPrice(event)}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              {onPeek && (
                <button
                  type="button"
                  onClick={handlePeekClick}
                  title="Quick Preview"
                  aria-label="Quick preview event"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-white/95 backdrop-blur-sm text-ink hover:bg-champion hover:text-white shadow-xs transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleBookmarkClick}
                aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                  isBookmarked
                    ? 'bg-champion text-white shadow-sm'
                    : 'bg-white/95 backdrop-blur-sm text-ink hover:bg-white hover:text-champion shadow-xs'
                )}
              >
                <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-white')} />
              </button>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="px-1 pb-1">
          {/* Date stamp */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[13px] font-semibold text-champion uppercase tracking-wider">
              {dateFormatted}
            </span>
          </div>

          {/* Event Title in Instrument Serif */}
          <h3 className="font-serif text-xl sm:text-[22px] text-ink font-normal leading-snug line-clamp-2 mb-2 group-hover:text-champion transition-colors">
            <Link
              to={eventLink}
              className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-champion rounded-[28px]"
            >
              {event.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Card Footer: Club attribution & Venue */}
      <div className="px-1 pt-2 mt-auto border-t border-line/60 flex items-center justify-between text-[13px] text-ink-muted">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: clubColor }}
            aria-hidden="true"
          />
          <span className="font-medium text-ink truncate">
            {event.club?.name || event.organizerName || 'Autonomous Club'}
          </span>
          {isVerified && (
            <span title="Verified Club" className="inline-flex items-center text-[#1FA34A] flex-shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 fill-[#1FA34A] text-white" />
            </span>
          )}
        </div>

        {event.venue?.name && (
          <span className="truncate flex items-center gap-1 text-[13px] text-ink-muted max-w-[40%] text-right">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{event.venue.name}</span>
          </span>
        )}
      </div>
    </article>
  )
}
