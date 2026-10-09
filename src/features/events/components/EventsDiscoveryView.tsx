import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Event } from '@/api/contracts'
import { EventCard } from '@/design-system/EventCard'
import { EventCardSkeleton, EventCardRowSkeleton } from '@/design-system/primitives/Skeleton'
import { Button } from '@/design-system/primitives/Button'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { Loader2, ArrowDown } from 'lucide-react'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardRowSkeleton key={i} />
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
          title="No events match your criteria"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <EventCard event={event} variant="stacked" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <EventCard event={event} variant="list-row" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Skeletons while loading more */}
      {isLoadingMore && (
        <div className="w-full pt-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <EventCardSkeleton key={`more-${i}`} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <EventCardRowSkeleton key={`more-${i}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cursor Pagination "Load More" Button */}
      {hasMore && (
        <div className="flex justify-center pt-12 pb-6">
          <Button
            variant="secondary"
            size="lg"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="h-12 px-8 rounded-full border border-line bg-surface hover:bg-surface-sunken text-ink font-semibold shadow-xs transition-all text-[14px]"
            icon={
              isLoadingMore ? (
                <Loader2 className="w-4 h-4 animate-spin text-champion" />
              ) : (
                <ArrowDown className="w-4 h-4 text-champion" />
              )
            }
          >
            {isLoadingMore ? 'Loading events...' : 'Load more events'}
          </Button>
        </div>
      )}
    </div>
  )
}
