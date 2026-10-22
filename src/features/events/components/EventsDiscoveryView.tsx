import { EventLink } from '@/design-system/EventLink'
import { eventPriceLabel } from '@/lib/eventPresentation'
import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Event } from '@/api/contracts'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { GhostEventGrid, GhostEventRow } from '@/design-system/primitives/GhostLoader'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import { MapPin, Ticket, ArrowDown, ArrowUpRight } from '@/design-system/Icon'
import { cn } from '@/lib/utils'

export interface EventsDiscoveryViewProps {
  events: Event[]
  viewMode: 'grid' | 'list'
  isLoading?: boolean
  isLoadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  onResetFilters?: () => void
  className?: string
}

/**
 * Modern-Minimal dense list row for EventMesh catalog.
 */
const DenseEventRow: React.FC<{ event: Event }> = ({ event }) => {
  const clubId = event.organizerId || (event as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = event.isFree ?? (!event.price || event.price === 0)

  return (
    <article className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl bg-card hover:bg-surface-subtle transition-colors duration-150 select-none border border-line/60">
      {/* Left: Date Block & Main Details */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
        {/* Date Stamp Block */}
        <div className="w-12 h-12 rounded-xl bg-surface-subtle flex flex-col items-center justify-center flex-shrink-0 text-center font-mono">
          <span className="text-[10px] uppercase font-bold text-accent tracking-wider">
            {new Date(event.startsAt).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="font-sans font-bold text-base text-ink leading-none">
            {new Date(event.startsAt).getDate()}
          </span>
        </div>

        {/* Text info */}
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubTheme.hex || 'var(--accent)' }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-ink-soft truncate">
              {event.club?.name || event.organizerName || 'Organizer'}
            </span>
            <span className="text-xs font-mono text-ink-muted">·</span>
            <span className="text-xs font-mono text-ink-muted">
              {formatTime(event.startsAt)}
            </span>
          </div>

          <EventLink event={event} className="focus:outline-none block">
            <h4 className="font-sans font-semibold text-base text-ink group-hover:text-accent transition-colors truncate">
              {event.title}
            </h4>
          </EventLink>

          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <MapPin size={12} weight="bold" className="text-accent flex-shrink-0" />
            <span className="truncate">{event.venue?.name || 'Venue to be announced'}</span>
          </div>
        </div>
      </div>

      {/* Right: Capacity, Pricing, Action */}
      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 border-t sm:border-t-0 border-line/40 pt-2 sm:pt-0">
        <div className="text-left sm:text-right font-mono text-xs">
          <span className="font-semibold text-ink">
            {eventPriceLabel(event)}
          </span>
          {event.seatsLeft != null && (
            <p className="text-[11px] text-ink-muted">
              {event.seatsLeft} left
            </p>
          )}
        </div>

        <EventLink
          event={event}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-accent text-ink hover:text-white font-medium text-xs transition-colors"
        >
          <span>View</span>
          <ArrowUpRight size={12} weight="bold" />
        </EventLink>
      </div>
    </article>
  )
}

export const EventsDiscoveryView: React.FC<EventsDiscoveryViewProps> = ({
  events,
  viewMode,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onResetFilters,
  className,
}) => {
  if (isLoading && events.length === 0) {
    if (viewMode === 'grid') {
      return (
        <GhostEventGrid
          count={6}
          className={cn('w-full', className)}
        />
      )
    }
    return (
      <div
        role="status"
        aria-live="polite"
        aria-label="Loading events list"
        className={cn('flex flex-col gap-2.5 max-w-4xl mx-auto w-full', className)}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <GhostEventRow key={`ghost-row-${i}`} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <EmptyState
          title="No events found"
          description="Try adjusting your filter criteria or search keyword to discover campus events."
          actionLabel="Clear filters"
          onAction={onResetFilters}
        />
      </div>
    )
  }

  return (
    <div className={cn('w-full flex flex-col gap-8', className)}>
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8"
          >
            {events.map((evt) => (
              <EventTicketCard key={evt.id} event={evt} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col gap-2.5 max-w-4xl mx-auto w-full"
          >
            {events.map((evt) => (
              <DenseEventRow key={evt.id} event={evt} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Infinite Scroll / Load More Action */}
      {hasMore && (
        <div className="pt-6 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-surface-subtle hover:bg-accent-soft text-ink hover:text-accent border border-line text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? (
              <span className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowDown size={14} weight="bold" />
            )}
            <span>{isLoadingMore ? 'Loading sessions...' : 'Load more sessions'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
