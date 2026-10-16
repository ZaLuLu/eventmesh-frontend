import React from 'react'
import { Event } from '@/api'
import { EventLink } from './EventLink'
import { formatDate, formatTime } from '@/lib/format'
import { eventPriceLabel } from '@/lib/eventPresentation'
import { CheckCircle, MapPin, CalendarBlank, ArrowRight } from '@/design-system/Icon'
import { cn } from '@/lib/utils'
import { PosterArt } from './visuals/PosterArt'

export interface VerticalPosterCardProps {
  event: Event
  className?: string
  priority?: boolean
}

/**
 * VerticalPosterCard
 * Cinematic Vertical Poster (`aspect-[2/3]`) with details overlaid directly
 * on top of the poster artwork via a bottom dark gradient scrim.
 * Designed for flagship premiere showcases on the Homepage.
 */
export const VerticalPosterCard: React.FC<VerticalPosterCardProps> = ({
  event,
  className = '',
  priority = false,
}) => {
  const host = event.club?.name || event.organizerName || 'Organizer'
  const isVerified = event.club?.verified ?? true
  const price = eventPriceLabel(event)
  const soldOut = event.seatsLeft === 0
  const venue = event.venue?.name || (event.isOnline ? 'Online Event' : 'Venue TBA')

  return (
    <article
      data-testid="vertical-poster-card"
      className={cn(
        'group relative flex flex-col aspect-[2/3] w-full overflow-hidden rounded-[22px] border border-line bg-card shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* 1. Full-Bleed Vertical Poster Image or Fallback */}
      <div className="absolute inset-0 h-full w-full bg-surface-subtle overflow-hidden">
        {event.poster ? (
          <img
            src={event.poster}
            alt={event.title}
            loading={priority ? 'eager' : 'lazy'}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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

      {/* 2. Top Edge Floating Badges */}
      <div className="relative z-10 flex items-center justify-between p-3.5">
        <span className="rounded-full bg-black/75 backdrop-blur-md px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white border border-white/15 shadow-sm">
          {event.category || 'Special'}
        </span>

        <span
          className={cn(
            'rounded-full px-3 py-1 font-mono text-xs font-bold shadow-sm backdrop-blur-md border',
            soldOut
              ? 'bg-red-500/90 text-white border-red-400/40 uppercase text-[10px]'
              : 'bg-black/75 text-amber-300 border-amber-400/30'
          )}
        >
          {soldOut ? 'Sold Out' : price}
        </span>
      </div>

      {/* 3. Bottom Gradient Scrim Overlay with Event Details */}
      <div className="relative z-10 mt-auto flex flex-col justify-end p-4 pt-16 bg-gradient-to-t from-black via-black/85 via-55% to-transparent text-white">
        {/* Host / Organizer attribution */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-300 mb-1">
          <span className="truncate font-medium text-[11px] tracking-wide uppercase font-mono">{host}</span>
          {isVerified && (
            <CheckCircle size={13} weight="fill" className="shrink-0 text-emerald-400" aria-label="Verified host" />
          )}
        </div>

        {/* Event Title */}
        <h3 className="line-clamp-2 text-base sm:text-lg font-bold leading-tight text-white font-display group-hover:text-accent-hover transition-colors mb-2">
          <EventLink event={event} className="hover:underline text-white">
            {event.title}
          </EventLink>
        </h3>

        {/* Tabular Metadata: Date, Time & Venue */}
        <div className="space-y-1 font-mono text-[11px] text-neutral-300 mb-3.5">
          <div className="flex items-center gap-1.5">
            <CalendarBlank size={13} className="shrink-0 text-accent" aria-hidden="true" />
            <span className="font-semibold text-white whitespace-nowrap">{formatDate(event.startsAt)}</span>
            <span className="text-neutral-500">·</span>
            <span className="whitespace-nowrap text-neutral-300">{formatTime(event.startsAt)}</span>
          </div>

          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="shrink-0 text-neutral-400" aria-hidden="true" />
            <span className="truncate text-neutral-300">{venue}</span>
          </div>
        </div>

        {/* Action Button: Get Pass → */}
        <div className="pt-1">
          <EventLink
            event={event}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white py-2 text-xs font-mono font-semibold transition-all shadow-md active:scale-95 group/btn"
          >
            <span>{event.kind === 'imported' ? 'Inspect Details' : 'Get Pass'}</span>
            <ArrowRight size={13} weight="bold" className="transition-transform group-hover/btn:translate-x-0.5" />
          </EventLink>
        </div>
      </div>
    </article>
  )
}
