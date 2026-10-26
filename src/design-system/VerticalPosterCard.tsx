import React from 'react'
import { Event } from '@/api'
import { EventLink } from './EventLink'
import { ArrowRight, Ticket, CalendarBlank } from '@/design-system/Icon'
import { cn } from '@/lib/utils'
import { PosterArt } from './visuals/PosterArt'
import { providerInfo, eventPriceLabel } from '@/lib/eventPresentation'
import { formatDate } from '@/lib/format'

export interface VerticalPosterCardProps {
  event: Event
  className?: string
  priority?: boolean
  onQuickRSVP?: (event: Event) => void
}

/**
 * VerticalPosterCard
 * Clean Architectural Standard (Option A2):
 * - Solitary 14px outer radius.
 * - Full 3:4 portrait image frame with 100% solid surfaces (zero glassmorphism).
 * - High-contrast metadata dock with price & single clear action button.
 */
export const VerticalPosterCard: React.FC<VerticalPosterCardProps> = ({
  event,
  className = '',
  priority = false,
  onQuickRSVP,
}) => {
  const pInfo = providerInfo(event.provider)
  const [imgError, setImgError] = React.useState(false)

  return (
    <article
      data-testid="vertical-poster-card"
      className={cn(
        'group relative flex flex-col w-full rounded-[14px] border border-line bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <EventLink
        event={event}
        aria-label={`View details for ${event.title}`}
        className="flex flex-col flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* 1. Full-on Image Poster Frame (3:4 ratio, 100% solid, uninterrupted artwork) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-subtle">
          {event.poster && !imgError ? (
            <img
              src={event.poster}
              alt={event.title}
              loading={priority ? 'eager' : 'lazy'}
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

          {/* Top Badges: Category + Source Provider (100% Solid) */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
            <span className="rounded-[4px] border border-line bg-card px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink shadow-xs">
              {event.category || 'Event'}
            </span>
            <span className={cn('rounded-[4px] border border-line px-2 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 bg-card text-ink', pInfo.badgeClass)}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pInfo.dotColor }} />
              {pInfo.name}
            </span>
          </div>
        </div>

        {/* 2. Clean Solid Architectural Info Dock */}
        <div className="p-3.5 flex flex-col flex-1">
          <div className="flex items-center justify-between gap-1 text-[11px] font-mono uppercase tracking-wider text-ink-muted truncate mb-1">
            <span className="truncate">{event.club?.name || event.organizerName || pInfo.name}</span>
            <span className="shrink-0 flex items-center gap-1 font-semibold text-accent">
              <CalendarBlank size={12} weight="bold" />
              <span>{formatDate(event.startsAt, 'compact')}</span>
            </span>
          </div>

          <h3 className="line-clamp-1 text-base font-bold text-ink group-hover:text-accent transition-colors tracking-tight font-display mb-3">
            {event.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-line">
            <div className="font-mono text-xs font-bold text-ink">
              <span>{eventPriceLabel(event)}</span>
            </div>

            {event.kind === 'imported' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                <span>View on {pInfo.name} ↗</span>
              </span>
            ) : onQuickRSVP ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickRSVP(event)
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-ink text-paper hover:bg-accent hover:text-white font-mono text-[11px] font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Ticket size={13} weight="bold" />
                <span>Get Pass</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                <span>Details</span>
                <ArrowRight size={12} weight="bold" />
              </span>
            )}
          </div>
        </div>
      </EventLink>
    </article>
  )
}
