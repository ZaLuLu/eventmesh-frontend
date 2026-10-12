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
  rounded = 'rounded-none',
  ...props
}) => {
  return (
    <div
      className={cn('bg-slate-200/70 animate-pulse', rounded, width, height, className)}
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
        'bg-transparent p-0 flex flex-col gap-3',
        className
      )}
    >
      {/* Image thumbnail placeholder with corner registration ticks */}
      <div className="relative">
        <span className="absolute -top-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┌</span>
        <span className="absolute -top-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┐</span>
        <span className="absolute -bottom-1.5 -left-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">└</span>
        <span className="absolute -bottom-1.5 -right-1.5 text-[#0047FF] text-xs font-mono pointer-events-none z-20">┘</span>
        <div
          className={cn(
            'w-full bg-[#F1F5F9] border border-[#E2E8F0] relative overflow-hidden animate-pulse',
            aspect === '4/5' ? 'aspect-[4/5]' : 'aspect-[5/4]'
          )}
        />
      </div>

      {/* Content lines */}
      <div className="flex flex-col gap-2 pt-1">
        <Skeleton height="h-3" width="w-1/3" />
        <Skeleton height="h-5" width="w-4/5" />
        <Skeleton height="h-3" width="w-1/2" />
      </div>

      {/* Stats and Action */}
      <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
        <Skeleton height="h-3" width="w-24" />
        <Skeleton height="h-3" width="w-16" />
      </div>
    </div>
  )
}

export const EventCardRowSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'bg-transparent py-4 border-b border-[#E2E8F0] flex items-center gap-4',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="w-28 sm:w-36 h-20 sm:h-24 bg-[#F1F5F9] border border-[#E2E8F0] flex-shrink-0 animate-pulse" />

      {/* Text Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <Skeleton height="h-3" width="w-1/4" />
        <Skeleton height="h-5" width="w-3/4" />
        <Skeleton height="h-3" width="w-1/3" />
      </div>

      {/* Action CTA */}
      <div className="flex-shrink-0 hidden sm:block">
        <Skeleton height="h-8" width="w-24" />
      </div>
    </div>
  )
}
