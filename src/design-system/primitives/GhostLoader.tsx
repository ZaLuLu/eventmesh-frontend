import React from 'react'
import { cn } from '@/lib/utils'

export interface GhostBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  rounded?: string
}

/**
 * GhostBlock
 * Foundational zero-CLS wireframe unit utilizing the Hallmark directional shimmer engine.
 */
export const GhostBlock: React.FC<GhostBlockProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded-[4px]',
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'bg-surface-subtle ghost-shimmer relative overflow-hidden',
        rounded,
        width,
        height,
        className
      )}
      {...props}
    />
  )
}

/**
 * GhostEventCard
 * Exact 1:1 geometry match for EventTicketCard (Phase 4):
 * - Solitary 14px outer radius frame (10px on mobile).
 * - Exact 3:4 portrait aspect ratio container.
 * - Hairline rectangular tag placeholder (4px radius).
 * - Tactile 8px bookmark button placeholder.
 * - Typography dock with organizer, dual-line title, and bottom tabular date/price strip.
 * Guarantees zero Cumulative Layout Shift (CLS) when real data mounts.
 */
export const GhostEventCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <article
      aria-busy="true"
      aria-label="Loading event details..."
      className={cn(
        'group flex min-w-0 flex-col rounded-[10px] sm:rounded-[14px] border border-line bg-card overflow-hidden shadow-xs select-none',
        className
      )}
    >
      {/* 1. Portrait Media Frame (Solitary 3:4 aspect ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-subtle ghost-shimmer">
        {/* Denim Dept Signature Rectangular Tag Placeholder */}
        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 h-4 sm:h-5 w-14 sm:w-16 rounded-[3px] sm:rounded-[4px] border border-black/10 bg-white/80" />

        {/* Tactile Bookmark Trigger Placeholder (8px radius) */}
        <div className="absolute right-2 top-2 sm:right-3 sm:top-3 z-10 h-6 w-6 sm:h-8 sm:w-8 rounded-[6px] sm:rounded-[8px] border border-black/10 bg-white/80" />
      </div>

      {/* 2. Typographic Core & Metadata Dock */}
      <div className="flex flex-1 flex-col p-2.5 sm:p-4 space-y-1.5 sm:space-y-2.5">
        {/* Organizer Row */}
        <div className="flex items-center justify-between gap-1">
          <GhostBlock height="h-2.5 sm:h-3" width="w-20 sm:w-28" rounded="rounded-[3px] sm:rounded-[4px]" />
          <GhostBlock height="h-2.5 sm:h-3" width="w-10 sm:w-14" rounded="rounded-[3px] sm:rounded-[4px]" />
        </div>

        {/* Title Lines */}
        <div className="space-y-1 sm:space-y-1.5 py-0.5">
          <GhostBlock height="h-3.5 sm:h-5" width="w-11/12" rounded="rounded-[3px] sm:rounded-[4px]" />
          <GhostBlock height="h-3.5 sm:h-5" width="w-2/3" rounded="rounded-[3px] sm:rounded-[4px]" />
        </div>

        {/* Subtitle Line (hidden on smallest screens to match EventTicketCard) */}
        <div className="hidden sm:block pt-0.5">
          <GhostBlock height="h-3" width="w-4/5" rounded="rounded-[3px]" />
        </div>

        {/* Tabular Bottom Utility Dock */}
        <div className="mt-auto border-t border-line/60 pt-2 sm:pt-3 space-y-1.5 sm:space-y-2.5">
          <div className="flex items-center justify-between gap-1">
            <div className="space-y-1">
              <GhostBlock height="h-3 sm:h-3.5" width="w-16 sm:w-24" rounded="rounded-[3px] sm:rounded-[4px]" />
              <GhostBlock height="h-2.5" width="w-28" rounded="rounded-[3px]" className="hidden sm:block" />
            </div>
            <GhostBlock height="h-3.5 sm:h-4" width="w-12 sm:w-14" rounded="rounded-[3px] sm:rounded-[4px]" />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-line/30">
            <GhostBlock height="h-2.5 sm:h-3" width="w-14 sm:w-16" rounded="rounded-[3px] sm:rounded-[4px]" />
            <GhostBlock height="h-6" width="w-20" rounded="rounded-[8px]" className="hidden sm:block" />
          </div>
        </div>
      </div>
    </article>
  )
}

/**
 * GhostEventRow
 * Wireframe loader matching DenseEventRow for list views.
 */
export const GhostEventRow: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <article
      aria-busy="true"
      aria-label="Loading event item..."
      className={cn(
        'group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-xl border border-line bg-card shadow-xs select-none',
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <GhostBlock height="h-12" width="w-12" rounded="rounded-lg" className="shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <GhostBlock height="h-2.5" width="w-2" rounded="rounded-full" />
            <GhostBlock height="h-3" width="w-24" rounded="rounded-[3px]" />
            <GhostBlock height="h-3" width="w-12" rounded="rounded-[3px]" />
          </div>
          <GhostBlock height="h-4 sm:h-5" width="w-3/4" rounded="rounded-[4px]" />
          <GhostBlock height="h-3" width="w-1/2" rounded="rounded-[3px]" />
        </div>
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 border-line/40 pt-2 sm:pt-0">
        <GhostBlock height="h-4" width="w-14" rounded="rounded-[4px]" />
        <GhostBlock height="h-7" width="w-16" rounded="rounded-full" />
      </div>
    </article>
  )
}

/**
 * GhostPosterCard
 * Wireframe loader matching VerticalPosterCard for premiere grids.
 */
export const GhostPosterCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <article
      aria-busy="true"
      aria-label="Loading premiere details..."
      className={cn(
        'group relative flex flex-col w-full rounded-[14px] border border-line bg-card overflow-hidden shadow-xs select-none',
        className
      )}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-subtle ghost-shimmer">
        <div className="absolute left-3 top-3 z-10 h-5 w-16 rounded-[4px] border border-black/10 bg-white/80" />
      </div>
      <div className="p-3.5 flex flex-col space-y-2">
        <GhostBlock height="h-3" width="w-24" rounded="rounded-[3px]" />
        <GhostBlock height="h-5" width="w-4/5" rounded="rounded-[4px]" />
        <div className="pt-1">
          <GhostBlock height="h-3.5" width="w-28" rounded="rounded-[3px]" />
        </div>
      </div>
    </article>
  )
}

/**
 * GhostEventGrid
 * Renders the responsive 2-column mobile / 3-column desktop discovery grid
 * filled with directional shimmer wireframes.
 */
export const GhostEventGrid: React.FC<{ count?: number; className?: string }> = ({
  count = 6,
  className = '',
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading events catalog"
      className={cn(
        'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <GhostEventCard key={`ghost-card-${idx}`} />
      ))}
      <span className="sr-only">Loading {count} events...</span>
    </div>
  )
}

/**
 * GhostThemeTrio
 * Wireframe loader for the 3-column ActiveThemeTrio spotlight section.
 */
export const GhostThemeTrio: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading curated themes"
      className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6', className)}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={`ghost-trio-${i}`}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-line bg-surface-subtle ghost-shimmer shadow-xs"
        >
          {/* Top Tag Wireframe */}
          <div className="absolute left-3.5 top-3.5 h-5 w-24 rounded-[4px] bg-black/15" />
          {/* Bottom Editorial Content Wireframe */}
          <div className="absolute bottom-4 left-4 right-4 space-y-2">
            <GhostBlock height="h-2.5" width="w-24" rounded="rounded-[3px]" className="bg-black/15" />
            <GhostBlock height="h-5 sm:h-6" width="w-44" rounded="rounded-[4px]" className="bg-black/25" />
            <GhostBlock height="h-3" width="w-32" rounded="rounded-[3px]" className="bg-black/15" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * GhostHeroStage
 * Wireframe loader for the PanoramicHeroCarousel flagship cover stage.
 */
export const GhostHeroStage: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading featured stage"
      className={cn(
        'relative w-full overflow-hidden bg-card border-b border-line py-4 sm:py-6',
        className
      )}
    >
      <div className="w-full flex justify-center px-4">
        <div className="relative h-[340px] sm:h-[400px] md:h-[450px] w-full max-w-5xl rounded-[14px] border border-line bg-surface-subtle ghost-shimmer shadow-md overflow-hidden">
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="h-5 w-28 rounded-[4px] bg-black/15" />
            <GhostBlock height="h-8 sm:h-10" width="w-3/4" rounded="rounded-[4px]" className="bg-black/25" />
            <GhostBlock height="h-4 sm:h-5" width="w-1/2" rounded="rounded-[3px]" className="bg-black/15" />
          </div>
        </div>
      </div>
    </div>
  )
}
