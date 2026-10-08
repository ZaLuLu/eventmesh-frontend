import React from 'react'
import { motion } from 'framer-motion'
import { computeOnEventColor } from '@/lib/contrast'

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

export const Band: React.FC<BandProps> = ({
  color = '#C66A4A',
  height = 'h-32 sm:h-40',
  chipLabel,
  tagline,
  metaRight,
  className = '',
  children,
  animate = true,
}) => {
  const onEventColor = computeOnEventColor(color)

  const content = (
    <div
      className={`relative w-full overflow-hidden flex items-center ${height} ${className}`}
      style={{
        backgroundColor: color,
        color: onEventColor,
      }}
    >
      <div className="w-full px-[4vw] flex flex-wrap items-center justify-between gap-4">
        {chipLabel && (
          <div className="flex items-center gap-3">
            <span className="inline-block bg-paper text-ink font-mono text-[10px] sm:text-[11px] font-semibold uppercase tracking-widecaps px-2.5 py-1">
              {chipLabel}
            </span>
            {tagline && (
              <span className="font-body text-xs sm:text-sm font-medium tracking-wide uppercase opacity-90 truncate max-w-xs sm:max-w-md">
                {tagline}
              </span>
            )}
          </div>
        )}

        {children}

        {metaRight && (
          <div className="font-mono text-[11px] uppercase tracking-widecaps font-medium opacity-80">
            {metaRight}
          </div>
        )}
      </div>
    </div>
  )

  if (!animate) {
    return content
  }

  return (
    <motion.div
      initial={{ scaleX: 0, originX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {content}
    </motion.div>
  )
}
