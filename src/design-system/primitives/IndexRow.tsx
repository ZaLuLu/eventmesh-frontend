import React from 'react'
import { Link } from 'react-router-dom'
import { computeOnEventColor } from '@/lib/contrast'
import { ArrowUpRight } from 'lucide-react'

export interface IndexRowProps {
  id: string
  slug: string
  title: string
  category: string
  organizerName: string
  organizerColor?: string
  dateDisplay: string
  venueName?: string
  status?: string
  indexNumber?: string | number
  to?: string
  actionLabel?: string
  isSignature?: boolean
}

export const IndexRow: React.FC<IndexRowProps> = ({
  slug,
  title,
  category,
  organizerName,
  organizerColor = '#C66A4A',
  dateDisplay,
  venueName,
  status,
  indexNumber,
  to,
  actionLabel = 'Explore',
  isSignature = false,
}) => {
  const onEventColor = computeOnEventColor(organizerColor)
  const linkTo = to || `/events/${slug}`

  return (
    <Link
      to={linkTo}
      className="group relative block w-full border-b border-ink-15 overflow-hidden transition-colors duration-200"
      style={{
        // Define CSS variable for hover effect
        ['--row-color' as string]: organizerColor,
        ['--on-row-color' as string]: onEventColor,
      }}
    >
      {/* Background Color Wipe on Hover */}
      <div
        className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 pointer-events-none"
        style={{
          backgroundColor: organizerColor,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      <div className="relative z-10 px-4 sm:px-6 py-5 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200 group-hover:text-[var(--on-row-color)]">
        {/* Left: Index Number & Main Info */}
        <div className="flex items-start md:items-center gap-4 sm:gap-6 flex-1 min-w-0">
          {indexNumber && (
            <span className="font-mono text-xs sm:text-sm font-semibold opacity-60 flex-shrink-0 pt-1 md:pt-0 group-hover:opacity-100">
              {typeof indexNumber === 'number'
                ? String(indexNumber).padStart(2, '0')
                : indexNumber}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-block h-2 w-2 flex-shrink-0"
                style={{ backgroundColor: organizerColor }}
              />
              <span className="font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-widecaps opacity-75 group-hover:opacity-100">
                {organizerName}
              </span>
              <span className="opacity-40">·</span>
              <span className="font-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-widecaps opacity-75 group-hover:opacity-100">
                {category}
              </span>
              {isSignature && (
                <span className="ml-1 bg-premium text-paper font-mono text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5">
                  Signature
                </span>
              )}
            </div>

            <h3 className="font-display text-2xl sm:text-3xl md:text-4xl text-ink uppercase tracking-tight group-hover:text-[var(--on-row-color)] transition-all duration-200 group-hover:translate-x-2 truncate">
              {title}
            </h3>
          </div>
        </div>

        {/* Right: Date, Venue, Status, Arrow */}
        <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-ink-15/40">
          <div className="text-left md:text-right">
            <p className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-wide">
              {dateDisplay}
            </p>
            {venueName && (
              <p className="font-body text-xs opacity-75 truncate max-w-[180px]">
                {venueName}
              </p>
            )}
          </div>

          {status && (
            <span className="font-mono text-[10px] uppercase tracking-wide border px-2 py-0.5 border-current opacity-80">
              {status.replace(/_/g, ' ')}
            </span>
          )}

          <div className="flex items-center gap-1 font-mono text-xs uppercase tracking-wide font-semibold">
            <span className="hidden sm:inline">{actionLabel}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
