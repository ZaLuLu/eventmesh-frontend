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
 * Category-coded chromatic accent mapping (Refactoring UI + Hallmark)
 * Injects vivid personality and high contrast into badges and tags.
 */
export function getCategoryAccent(category?: string) {
  const cat = (category || '').toLowerCase()
  if (
    cat.includes('hack') ||
    cat.includes('tech') ||
    cat.includes('code') ||
    cat.includes('ai') ||
    cat.includes('cyber') ||
    cat.includes('dev')
  ) {
    return {
      badgeClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
      dotColor: '#8B5CF6',
      accentColor: 'text-violet-600 dark:text-violet-400',
    }
  }
  if (
    cat.includes('music') ||
    cat.includes('cultur') ||
    cat.includes('art') ||
    cat.includes('dance') ||
    cat.includes('drama') ||
    cat.includes('fest') ||
    cat.includes('theat')
  ) {
    return {
      badgeClass: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      dotColor: '#F59E0B',
      accentColor: 'text-amber-600 dark:text-amber-400',
    }
  }
  if (
    cat.includes('work') ||
    cat.includes('acad') ||
    cat.includes('talk') ||
    cat.includes('seminar') ||
    cat.includes('lecture') ||
    cat.includes('design')
  ) {
    return {
      badgeClass: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      dotColor: '#10B981',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
    }
  }
  if (
    cat.includes('sport') ||
    cat.includes('game') ||
    cat.includes('esport') ||
    cat.includes('tourn') ||
    cat.includes('fit')
  ) {
    return {
      badgeClass: 'bg-rose-500/15 text-rose-800 dark:text-rose-300 border-rose-500/30',
      dotColor: '#F43F5E',
      accentColor: 'text-rose-600 dark:text-rose-400',
    }
  }
  return {
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    dotColor: '#7C3AED',
    accentColor: 'text-accent',
  }
}

/**
 * VerticalPosterCard
 * Electric Editorial Standard (Refactoring UI + Hallmark):
 * - Responsive 2-column mobile to 4-column desktop density.
 * - Solid 3:4 portrait image frame with zero glassmorphism.
 * - Chromatic category badge signatures.
 * - High-contrast metadata dock with crisp font hierarchy.
 */
export const VerticalPosterCard: React.FC<VerticalPosterCardProps> = ({
  event,
  className = '',
  priority = false,
  onQuickRSVP,
}) => {
  const pInfo = providerInfo(event.provider)
  const catAccent = getCategoryAccent(event.category)
  const [imgError, setImgError] = React.useState(false)

  return (
    <article
      data-testid="vertical-poster-card"
      className={cn(
        'group relative flex flex-col w-full rounded-xl sm:rounded-[14px] border border-[#E2E8F0] dark:border-line bg-white dark:bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      <EventLink
        event={event}
        aria-label={`View details for ${event.title}`}
        className="flex flex-col flex-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {/* 1. Full-on Image Poster Frame (3:4 ratio, 100% solid, uninterrupted artwork) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F1F5F9] dark:bg-surface-subtle">
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

          {/* Top Badges: Chromatic Category + Source Provider (100% Solid) */}
          <div className="pointer-events-none absolute left-2 top-2 sm:left-3 sm:top-3 z-10 flex flex-wrap items-center gap-1 sm:gap-1.5">
            <span
              className={cn(
                'rounded-[4px] border px-2 py-0.5 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs',
                catAccent.badgeClass
              )}
            >
              {event.category || 'Event'}
            </span>
            {event.kind === 'imported' && (
              <span
                className={cn(
                  'rounded-[4px] border border-[#E2E8F0] dark:border-line px-2 py-0.5 font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs flex items-center gap-1 bg-white dark:bg-card text-[#0F172A] dark:text-ink',
                  pInfo.badgeClass
                )}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pInfo.dotColor }} />
                <span>{pInfo.name}</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Clean Solid Architectural Info Dock */}
        <div className="p-3 sm:p-3.5 flex flex-col flex-1 bg-white dark:bg-card">
          <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs font-mono uppercase tracking-wider text-[#64748B] dark:text-ink-muted truncate mb-1.5">
            <span className="truncate font-medium">{event.club?.name || event.organizerName || pInfo.name}</span>
            <span className="shrink-0 flex items-center gap-1 font-bold text-accent">
              <CalendarBlank size={12} weight="bold" />
              <span>{formatDate(event.startsAt, 'compact')}</span>
            </span>
          </div>

          <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-[#0F172A] dark:text-ink group-hover:text-accent transition-colors tracking-tight font-display mb-2.5 sm:mb-3 leading-snug">
            {event.title}
          </h3>

          <div className="mt-auto flex items-center justify-between gap-2 pt-2.5 border-t border-[#E2E8F0] dark:border-line">
            <div className="font-mono text-xs sm:text-sm font-bold text-[#0F172A] dark:text-ink">
              <span>{eventPriceLabel(event)}</span>
            </div>

            {event.kind === 'imported' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform">
                <span>{pInfo.name} ↗</span>
              </span>
            ) : onQuickRSVP ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onQuickRSVP(event)
                }}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[6px] sm:rounded-[8px] bg-[#0F172A] dark:bg-ink text-white dark:text-paper hover:bg-accent dark:hover:bg-accent hover:text-white font-mono text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Ticket size={13} weight="bold" />
                <span>Pass</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-accent group-hover:translate-x-0.5 transition-transform">
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
