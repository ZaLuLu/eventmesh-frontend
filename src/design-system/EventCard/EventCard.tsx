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
          'bg-transparent border-b border-[#E2E8F0] py-4 transition-colors hover:border-[#0047FF]',
          className
        )}
      >
        {/* Left Thumbnail (Unboxed with Corner Registration Ticks) */}
        <div className="relative w-full sm:w-48 md:w-56 aspect-[16/10] sm:aspect-[4/3] border border-[#E2E8F0] group-hover:border-[#0047FF] transition-colors flex-shrink-0">
          <span className="absolute -top-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┌</span>
          <span className="absolute -top-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┐</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">└</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┘</span>

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
              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-semibold">
                Filling fast
              </span>
            )}
            {isFree ? (
              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-semibold">
                Free
              </span>
            ) : (
              <span className="px-1.5 py-0.5 bg-white/95 text-[#0A0A0A] border border-[#E2E8F0] text-[11px] font-semibold">
                {formatPrice(event)}
              </span>
            )}
          </div>
        </div>

        {/* Middle Content */}
        <div className="flex-1 min-w-0 pr-2">
          {/* Date & Category */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-mono font-semibold text-[#0047FF] uppercase tracking-wider">
              {dateFormatted}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono text-slate-500 uppercase">{event.category}</span>
          </div>

          {/* Title */}
          <h3 className="font-sans text-lg sm:text-xl text-[#0A0A0A] font-bold leading-tight line-clamp-2 mb-2 group-hover:text-[#0047FF] transition-colors">
            <Link
              to={eventLink}
              className="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
            >
              {event.title}
            </Link>
          </h3>

          {/* Club attribution */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubColor }}
              aria-hidden="true"
            />
            <span className="text-slate-700 truncate">
              {event.club?.name || event.organizerName || 'Autonomous Club'}
            </span>
            {isVerified && (
              <span title="Verified Club" className="inline-flex items-center text-[#0047FF]">
                <CheckCircle2 className="w-3 h-3 text-[#0047FF]" />
              </span>
            )}
            {event.venue?.name && (
              <>
                <span className="text-slate-300">·</span>
                <span className="truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#0047FF]" />
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
              'w-8 h-8 flex items-center justify-center border transition-all duration-150',
              isBookmarked
                ? 'bg-[#0047FF]/10 text-[#0047FF] border-[#0047FF]'
                : 'bg-[#F8FAFC] text-slate-500 border-[#E2E8F0] hover:border-[#0047FF] hover:text-[#0047FF]'
            )}
          >
            <Bookmark className={cn('w-3.5 h-3.5', isBookmarked && 'fill-[#0047FF]')} />
          </button>

          <Link
            to={eventLink}
            aria-hidden="true"
            tabIndex={-1}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[#0047FF] hover:text-[#0037CC] hover:gap-2 transition-all uppercase font-semibold"
          >
            <span>View event</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
          'group relative overflow-hidden bg-transparent border border-[#E2E8F0] group-hover:border-[#0047FF] transition-colors flex flex-col',
          className
        )}
      >
        <span className="absolute -top-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┌</span>
        <span className="absolute -top-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┐</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">└</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┘</span>

        <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F8FAFC]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

          {/* Top badges & actions */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between z-10 pointer-events-none font-mono text-xs">
            <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
              {isPromoted && (
                <span className="px-1.5 py-0.5 bg-white/95 text-[#0047FF] border border-[#E2E8F0] font-semibold text-[11px]">
                  PROMOTED
                </span>
              )}
              {isFillingFast && (
                <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-semibold">
                  Filling fast
                </span>
              )}
              {isFree ? (
                <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-semibold">
                  FREE
                </span>
              ) : (
                <span className="px-1.5 py-0.5 bg-white/95 text-[#0A0A0A] border border-[#E2E8F0] text-[11px] font-semibold">
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
                  className="w-8 h-8 flex items-center justify-center bg-white/95 border border-[#E2E8F0] text-slate-700 hover:text-[#0047FF] hover:border-[#0047FF] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleBookmarkClick}
                aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
                className={cn(
                  'w-8 h-8 flex items-center justify-center border transition-all duration-150',
                  isBookmarked
                    ? 'bg-[#0047FF]/10 text-[#0047FF] border-[#0047FF]'
                    : 'bg-white/95 text-slate-700 border-[#E2E8F0] hover:text-[#0047FF] hover:border-[#0047FF]'
                )}
              >
                <Bookmark className={cn('w-3.5 h-3.5', isBookmarked && 'fill-[#0047FF]')} />
              </button>
            </div>
          </div>

          {/* Bottom overlaid text */}
          <div className="absolute bottom-2.5 inset-x-2.5 p-1 z-10">
            <span className="block text-xs font-mono font-semibold text-[#0047FF] uppercase tracking-wider mb-1">
              {dateFormatted}
            </span>
            <h3 className="font-sans text-lg font-bold text-white leading-tight line-clamp-2 mb-1.5">
              <Link
                to={eventLink}
                className="after:absolute after:inset-0 focus:outline-none focus-visible:underline"
              >
                {event.title}
              </Link>
            </h3>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: clubColor }}
                aria-hidden="true"
              />
              <span className="text-white truncate">
                {event.club?.name || event.organizerName || 'Autonomous Club'}
              </span>
              {isVerified && (
                <span title="Verified Club" className="inline-flex items-center text-[#0047FF]">
                  <CheckCircle2 className="w-3 h-3 text-[#0047FF]" />
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    )
  }

  // -------------------------------------------------------------
  // VARIANT: STACKED (UNBOXED ARCHITECTURAL BLUEPRINT POSTER)
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
        'group relative flex flex-col justify-between bg-transparent p-0 transition-colors',
        className
      )}
    >
      <div>
        {/* Floating Poster with Corner Registration Ticks */}
        <div className="relative mb-3">
          <span className="absolute -top-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┌</span>
          <span className="absolute -top-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┐</span>
          <span className="absolute -bottom-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">└</span>
          <span className="absolute -bottom-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┘</span>

          <div
            className={cn(
              'relative w-full overflow-hidden bg-[#F8FAFC] border border-[#E2E8F0] group-hover:border-[#0047FF] transition-colors flex-shrink-0',
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

            {/* Top Badges & Actions */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10 font-mono text-xs">
              <div className="flex items-center gap-1.5 flex-wrap pointer-events-auto">
                {isPromoted && (
                  <span className="px-1.5 py-0.5 bg-white/95 text-[#0047FF] border border-[#E2E8F0] font-semibold text-[11px]">
                    PROMOTED
                  </span>
                )}
                {isFillingFast && (
                  <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 text-[11px] font-semibold">
                    Filling fast
                  </span>
                )}
                {isFree ? (
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-semibold">
                    Free
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-white/95 text-[#0A0A0A] border border-[#E2E8F0] text-[11px] font-semibold">
                    {formatPrice(event)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 pointer-events-auto">
                {onPeek && (
                  <button
                    type="button"
                    onClick={handlePeekClick}
                    title="Quick Preview"
                    aria-label="Quick preview event"
                    className="w-7 h-7 flex items-center justify-center bg-white/95 border border-[#E2E8F0] text-slate-700 hover:text-[#0047FF] hover:border-[#0047FF] transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleBookmarkClick}
                  aria-label={isBookmarked ? 'Remove from saved' : 'Save event'}
                  className={cn(
                    'w-7 h-7 flex items-center justify-center border transition-all duration-150',
                    isBookmarked
                      ? 'bg-[#0047FF]/10 text-[#0047FF] border-[#0047FF]'
                      : 'bg-white/95 text-slate-700 border-[#E2E8F0] hover:text-[#0047FF] hover:border-[#0047FF]'
                  )}
                >
                  <Bookmark className={cn('w-3.5 h-3.5', isBookmarked && 'fill-[#0047FF]')} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body (Directly on canvas) */}
        <div>
          {/* Date stamp */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold text-[#0047FF] uppercase tracking-wider">
              {dateFormatted}
            </span>
          </div>

          {/* Event Title */}
          <h3 className="font-sans text-base sm:text-[17px] text-[#0A0A0A] font-bold leading-snug line-clamp-2 mb-2 group-hover:text-[#0047FF] transition-colors">
            <Link
              to={eventLink}
              className="focus:outline-none focus-visible:underline"
            >
              {event.title}
            </Link>
          </h3>
        </div>
      </div>

      {/* Card Footer: Club attribution & Venue */}
      <div className="pt-2 mt-auto border-t border-[#E2E8F0] flex items-center justify-between text-xs font-mono text-slate-500">
        <div className="flex items-center gap-1.5 min-w-0 pr-2">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: clubColor }}
            aria-hidden="true"
          />
          <span className="text-slate-700 truncate">
            {event.club?.name || event.organizerName || 'Autonomous Club'}
          </span>
          {isVerified && (
            <span title="Verified Club" className="inline-flex items-center text-[#0047FF] flex-shrink-0">
              <CheckCircle2 className="w-3 h-3 text-[#0047FF]" />
            </span>
          )}
        </div>

        {event.venue?.name && (
          <span className="truncate flex items-center gap-1 text-slate-500 max-w-[40%] text-right">
            <MapPin className="w-3 h-3 text-[#0047FF] flex-shrink-0" />
            <span className="truncate">{event.venue.name}</span>
          </span>
        )}
      </div>
    </article>
  )
}
