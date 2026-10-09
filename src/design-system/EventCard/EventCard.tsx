import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, CheckCircle2, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { Event } from '../../api/contracts'
import { Badge } from '../primitives/Badge'
import { cn } from '../../lib/utils'

export interface EventCardProps {
  event: Event
  variant?: 'stacked' | 'overlay' | 'list-row'
  aspectRatio?: '5/4' | '4/3' | '16/9' | '1/1'
  isBookmarked?: boolean
  onBookmarkToggle?: (eventId: string, bookmarked: boolean) => void
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
    onBookmarkToggle?.(event.id, nextState)
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
          {hasImage ? (
            <img
              src={event.poster}
              alt={event.title}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]"
            />
          ) : (
            /* Typographic Fallback Thumbnail */
            <div
              className="w-full h-full p-4 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${clubColor}18 0%, #FFFFFF 100%)`,
                borderLeft: `4px solid ${clubColor}`,
              }}
            >
              <span className="text-[13px] font-semibold uppercase tracking-wider text-ink-muted">
                {event.category}
              </span>
              <span className="font-serif italic text-lg leading-snug text-ink line-clamp-2">
                {event.title}
              </span>
              <span className="text-[13px] font-medium text-ink-muted">{dateFormatted}</span>
            </div>
          )}

          {/* Badges on thumbnail */}
          <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
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
          {hasImage ? (
            <img
              src={event.poster}
              alt={event.title}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="w-full h-full p-6 flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, ${clubColor}30 0%, #151130 100%)`,
              }}
            >
              <span className="text-[13px] font-semibold uppercase tracking-wider text-white/80">
                {event.category}
              </span>
              <span className="font-serif italic text-2xl leading-tight text-white line-clamp-3">
                {event.title}
              </span>
              <span className="text-[13px] font-medium text-white/70">{dateFormatted}</span>
            </div>
          )}

          {/* Dark gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

          {/* Top badges & bookmark */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1.5 flex-wrap">
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

            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                isBookmarked
                  ? 'bg-champion text-white shadow-sm'
                  : 'bg-white/90 backdrop-blur-sm text-ink hover:bg-white hover:text-champion'
              )}
            >
              <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-white')} />
            </button>
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
          {hasImage ? (
            <img
              src={event.poster}
              alt={event.title}
              loading={priority ? 'eager' : 'lazy'}
              className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]"
            />
          ) : (
            /* Typographic Fallback Poster (No image) */
            <div
              className="w-full h-full p-5 flex flex-col justify-between relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${clubColor}14 0%, #FFFFFF 100%)`,
                borderLeft: `5px solid ${clubColor}`,
              }}
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-wider text-ink-muted">
                  {event.category}
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: clubColor }}
                  aria-hidden="true"
                />
              </div>

              {/* Center Title in Instrument Serif */}
              <div className="my-auto py-2">
                <span className="font-serif italic text-2xl font-normal leading-tight text-ink line-clamp-3">
                  {event.title}
                </span>
              </div>

              {/* Bottom Stamp */}
              <div className="flex items-center justify-between text-[13px] text-ink-muted border-t border-line/60 pt-2">
                <span className="font-semibold text-ink truncate">
                  {event.club?.name || event.organizerName}
                </span>
                <span className="font-mono text-[12px]">{dateFormatted.split('·')[0]}</span>
              </div>
            </div>
          )}

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

            {/* Bookmark Button */}
            <button
              type="button"
              onClick={handleBookmarkClick}
              aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
              className={cn(
                'pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200',
                isBookmarked
                  ? 'bg-champion text-white shadow-sm'
                  : 'bg-white/95 backdrop-blur-sm text-ink hover:bg-white hover:text-champion shadow-xs'
              )}
            >
              <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-white')} />
            </button>
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
