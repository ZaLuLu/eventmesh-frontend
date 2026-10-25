import React from 'react'
import { Event } from '@/api'
import { EventLink } from './EventLink'
import { ArrowRight } from '@/design-system/Icon'
import { cn } from '@/lib/utils'
import { PosterArt } from './visuals/PosterArt'
import { providerInfo } from '@/lib/eventPresentation'

export interface VerticalPosterCardProps {
  event: Event
  className?: string
  priority?: boolean
}

/**
 * VerticalPosterCard
 * Hallmark & Denim Dept Standard:
 * - Solitary 14px outer radius (Gate 22).
 * - Full 3:4 portrait image frame with zero blur and 100% solid surfaces.
 * - Clean metadata with "Click for info →" or "View on [Provider] ↗" affordance.
 */
export const VerticalPosterCard: React.FC<VerticalPosterCardProps> = ({
  event,
  className = '',
  priority = false,
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
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

          {/* Top Badges: Category + Source Provider */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap items-center gap-1.5">
            <span className="rounded-[4px] border border-black bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-black shadow-xs">
              {event.category || 'Event'}
            </span>
            <span className={cn('rounded-[4px] border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 bg-white/95', pInfo.badgeClass)}>
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pInfo.dotColor }} />
              {pInfo.name}
            </span>
          </div>
        </div>

        {/* 2. Clean Solid Info Dock */}
        <div className="p-3.5 flex flex-col">
          <div className="flex items-center justify-between gap-1 text-[11px] font-medium tracking-[0.08em] uppercase text-ink-muted truncate mb-1">
            <span className="truncate">{event.club?.name || event.organizerName || pInfo.name}</span>
            <span className="shrink-0 text-[10px] font-mono font-medium flex items-center gap-1">
              <span className="w-1 h-1 rounded-full" style={{ backgroundColor: pInfo.dotColor }} />
              {pInfo.name}
            </span>
          </div>
          <h3 className="line-clamp-1 text-base font-bold text-ink group-hover:text-accent transition-colors tracking-tight font-display">
            {event.title}
          </h3>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span>{event.kind === 'imported' ? `View on ${pInfo.name} ↗` : 'Click for info'}</span>
            <ArrowRight size={13} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </EventLink>
    </article>
  )
}

