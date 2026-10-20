import React from 'react'
import { Event } from '@/api'
import { EventLink } from './EventLink'
import { ArrowRight } from '@/design-system/Icon'
import { cn } from '@/lib/utils'
import { PosterArt } from './visuals/PosterArt'

export interface VerticalPosterCardProps {
  event: Event
  className?: string
  priority?: boolean
}

/**
 * VerticalPosterCard
 * Uncluttered, light-mode-first premiere card featuring a full-on image poster,
 * clean title, and a subtle "Click for info →" affordance redirecting to the event detail page.
 * Strictly 0 blur, 0 glassmorphism, 100% solid surfaces.
 */
export const VerticalPosterCard: React.FC<VerticalPosterCardProps> = ({
  event,
  className = '',
  priority = false,
}) => {
  return (
    <article
      data-testid="vertical-poster-card"
      className={cn(
        'group relative flex flex-col w-full rounded-[22px] border border-line bg-card p-3 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <EventLink
        event={event}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[16px]"
      >
        {/* 1. Full-on Image Poster Frame (Zero blur, 100% solid, uninterrupted artwork) */}
        <div className="relative aspect-[3/4] sm:aspect-[2/3] w-full overflow-hidden rounded-[16px] bg-surface-subtle border border-line/60">
          {event.poster ? (
            <img
              src={event.poster}
              alt={event.title}
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
            />
          ) : (
            <PosterArt
              eventId={event.id}
              title={event.title}
              category={event.category}
              clubId={event.organizerId}
              className="h-full w-full"
            />
          )}
        </div>

        {/* 2. Clean Solid Info Dock (Light-mode first: crisp dark text on solid card) */}
        <div className="pt-3 pb-0.5 px-0.5 flex flex-col">
          <h3 className="line-clamp-1 text-base font-bold text-ink group-hover:text-accent transition-colors tracking-tight">
            {event.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-accent">
            <span>Click for info</span>
            <ArrowRight size={13} weight="bold" className="transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </EventLink>
    </article>
  )
}

