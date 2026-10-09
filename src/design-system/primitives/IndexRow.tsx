import React from 'react'
import { Link } from 'react-router-dom'
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
  organizerColor = '#C93E27',
  dateDisplay,
  venueName,
  status,
  indexNumber,
  to,
  actionLabel = 'Explore',
  isSignature = false,
}) => {
  const linkTo = to || `/events/${slug}`

  return (
    <Link
      to={linkTo}
      className="group block w-full border-b border-line bg-surface hover:bg-subtle transition-colors duration-150"
    >
      <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Index Number & Main Info */}
        <div className="flex items-start md:items-center gap-4 flex-1 min-w-0">
          {indexNumber && (
            <span className="font-mono text-small text-text-3 flex-shrink-0 pt-0.5 md:pt-0">
              {typeof indexNumber === 'number'
                ? String(indexNumber).padStart(2, '0')
                : indexNumber}
            </span>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* 10px Club Dot */}
              <span
                className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: organizerColor }}
                aria-hidden="true"
              />
              <span className="text-caption font-medium text-text-2">
                {organizerName}
              </span>
              <span className="text-line">·</span>
              <span className="text-caption text-text-2">
                {category}
              </span>
              {isSignature && (
                <span className="ml-1 bg-accent-soft text-accent text-caption font-semibold px-2 py-0.5 rounded-full">
                  Signature
                </span>
              )}
            </div>

            <h3 className="font-semibold text-lg text-text group-hover:underline truncate">
              {title}
            </h3>
          </div>
        </div>

        {/* Right: Date, Venue, Status, Arrow */}
        <div className="flex items-center justify-between md:justify-end gap-6 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line">
          <div className="text-left md:text-right">
            <p className="text-small font-semibold text-text">
              {dateDisplay}
            </p>
            {venueName && (
              <p className="text-caption text-text-2 truncate max-w-[180px]">
                {venueName}
              </p>
            )}
          </div>

          {status && (
            <span className="text-caption font-medium rounded-full bg-subtle text-text-2 px-2.5 py-0.5 border border-line">
              {status.replace(/_/g, ' ')}
            </span>
          )}

          <div className="flex items-center gap-1 text-small font-semibold text-accent">
            <span className="hidden sm:inline">{actionLabel}</span>
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  )
}
