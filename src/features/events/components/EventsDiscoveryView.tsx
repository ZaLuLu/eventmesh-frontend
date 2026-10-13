import React from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Event } from '@/api/contracts'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { Sticker } from '@/design-system/primitives/Sticker'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import { MapPin, Ticket, ArrowDown } from '@/design-system/Icon'
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
 * Luma-style dense list row for EventMesh catalog (Section 7.3).
 */
const DenseEventRow: React.FC<{ event: Event }> = ({ event }) => {
  const clubId = event.organizerId || (event as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = event.isFree ?? (!event.price || event.price === 0)
  const isWaitlist = event.seatsLeft === 0 || (event as any).isWaitlist

  return (
    <article className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border-[1.5px] border-ink/15 hover:border-ink hover:shadow-offset transition-all duration-150 select-none">
      {/* Left: Date Block & Main Details */}
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        {/* Date Stamp Block */}
        <div className="w-14 h-14 rounded-xl bg-paper-2 border border-ink/15 flex flex-col items-center justify-center flex-shrink-0 text-center font-mono">
          <span className="text-[10px] uppercase font-bold text-cobalt tracking-wider">
            {new Date(event.startsAt).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="font-display font-extrabold text-lg text-ink leading-none">
            {new Date(event.startsAt).getDate()}
          </span>
        </div>

        {/* Text info */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubTheme.hex }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-ink-soft truncate">
              {event.club?.name || event.organizerName || 'Campus Club'}
            </span>
            <span className="text-xs font-mono text-ink-soft/70">·</span>
            <span className="text-xs font-mono text-ink-soft/70">
              {formatTime(event.startsAt)}
            </span>
          </div>

          <h3 className="font-display font-extrabold text-base sm:text-lg text-ink tracking-tight line-clamp-1 group-hover:text-cobalt transition-colors">
            <Link to={`/events/${event.slug || event.id}`} className="focus:outline-none">
              {event.title}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <MapPin size={12} weight="bold" className="text-cobalt flex-shrink-0" />
            <span className="truncate">{event.venue?.name || 'Campus Main Auditorium'}</span>
          </div>
        </div>
      </div>

      {/* Right: Badges & Action CTA */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sticker color={isFree ? 'mint' : 'mustard'} size="sm">
            {formatCurrency(event.price)}
          </Sticker>
          {isWaitlist && (
            <Sticker color="tangerine" size="sm">
              Waitlist
            </Sticker>
          )}
        </div>

        <Link
          to={`/events/${event.slug || event.id}`}
          className="btn-funk-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Ticket size={14} weight="bold" />
          <span>{isWaitlist ? 'Waitlist' : 'Grab seat'}</span>
        </Link>
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
  if (isLoading && (!events || events.length === 0)) {
    return (
      <div className={cn('w-full py-8', className)}>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-ticket bg-card border-[1.5px] border-ink/15 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card border border-ink/15 animate-pulse" />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!isLoading && events.length === 0) {
    return (
      <div className="w-full py-16">
        <EmptyState
          title="Nothing on yet. Try another club."
          description="Try clearing your category or date filters, or searching with broader keywords."
          actionLabel="Clear all filters"
          onAction={onResetFilters}
        />
      </div>
    )
  }

  return (
    <div className={cn('w-full py-8', className)}>
      <motion.div layout className="w-full transition-all duration-300">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <EventTicketCard event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <DenseEventRow event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-10 pb-6">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="btn-funk-secondary px-8 py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
          >
            <ArrowDown size={14} weight="bold" className={isLoadingMore ? 'animate-bounce' : ''} />
            <span>{isLoadingMore ? 'Loading more...' : 'Load more events'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
