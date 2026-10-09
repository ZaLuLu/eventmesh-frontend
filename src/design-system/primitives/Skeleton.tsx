import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string
  height?: string
  rounded?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = 'w-full',
  height = 'h-5',
  rounded = 'rounded-md',
  ...props
}) => {
  return (
    <div
      className={cn('bg-lavender-100/70 animate-pulse', rounded, width, height, className)}
      style={{ animationDuration: '1.8s' }}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  )
}

export const EventCardSkeleton: React.FC<{ aspect?: '4/5' | '5/4'; className?: string }> = ({
  aspect = '4/5',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-surface rounded-card-outer p-3 border border-line shadow-soft flex flex-col gap-3',
        className
      )}
    >
      {/* Image thumbnail placeholder */}
      <div
        className={cn(
          'w-full bg-lavender-100/70 rounded-card-inner relative overflow-hidden animate-pulse',
          aspect === '4/5' ? 'aspect-[4/5]' : 'aspect-[5/4]'
        )}
      >
        <div className="absolute top-2.5 left-2.5 w-12 h-14 bg-white/60 rounded-xl" />
        <div className="absolute top-2.5 right-2.5 w-16 h-6 bg-white/60 rounded-full" />
      </div>

      {/* Content lines */}
      <div className="flex flex-col gap-2 p-1">
        <Skeleton height="h-5" width="w-4/5" rounded="rounded-md" />
        <Skeleton height="h-4" width="w-full" rounded="rounded-md" />
        <Skeleton height="h-4" width="w-3/5" rounded="rounded-md" />
      </div>

      {/* Stats and Action */}
      <div className="mt-auto pt-2 flex items-center justify-between border-t border-line/60">
        <Skeleton height="h-4" width="w-20" rounded="rounded-full" />
        <Skeleton height="h-10" width="w-24" rounded="rounded-full" />
      </div>
    </div>
  )
}

export const EventCardRowSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'bg-surface rounded-card-row p-3 border border-line shadow-soft flex items-center gap-4',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="w-28 sm:w-36 h-24 sm:h-28 bg-lavender-100/70 rounded-[18px] flex-shrink-0 animate-pulse" />

      {/* Text Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton height="h-5" width="w-3/4" rounded="rounded-md" />
        <Skeleton height="h-4" width="w-1/2" rounded="rounded-md" />
        <Skeleton height="h-4" width="w-1/3" rounded="rounded-full" />
      </div>

      {/* Action CTA */}
      <div className="flex-shrink-0 hidden sm:block">
        <Skeleton height="h-10" width="w-28" rounded="rounded-full" />
      </div>
    </div>
  )
}
