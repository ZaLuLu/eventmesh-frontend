import React from 'react'

export interface BandProps {
  color?: string
  height?: string
  chipLabel?: string
  tagline?: string
  metaRight?: string
  className?: string
  children?: React.ReactNode
  animate?: boolean
}

/**
 * Band primitive: In Calm Coral, club color is strictly restricted to:
 * - a 10px dot
 * - a small solid chip (computed contrast)
 * - a 4px solid top edge
 * Never rendered as huge page backgrounds or heavy decorative blocks.
 */
export const Band: React.FC<BandProps> = ({
  color = '#C93E27',
  chipLabel,
  tagline,
  metaRight,
  className = '',
  children,
}) => {
  return (
    <div className={`w-full bg-surface border-y border-line py-3 px-4 sm:px-6 relative ${className}`}>
      {/* 4px solid accent top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-small">
        <div className="flex items-center gap-2.5">
          {/* 10px club dot */}
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />

          {chipLabel && (
            <span className="font-semibold text-text text-small">
              {chipLabel}
            </span>
          )}

          {tagline && (
            <span className="text-text-2 text-small">
              {tagline}
            </span>
          )}
        </div>

        {children}

        {metaRight && (
          <div className="text-caption text-text-3 font-medium">
            {metaRight}
          </div>
        )}
      </div>
    </div>
  )
}
