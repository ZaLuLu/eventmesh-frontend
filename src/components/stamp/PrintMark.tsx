import React, { useId, useMemo } from 'react'
import { STAMP_INKS, STATUS_WORDS, type PrintData, type StampInk } from './types'

export interface PrintMarkProps {
  print: PrintData
  className?: string
  scale?: number
  animate?: boolean
  onClick?: () => void
  title?: string
}

/**
 * Organic Analog Rubber Stamp SVG Mark.
 * Uses SVG turbulence noise, color matrix grain filtering, and displacement mapping
 * to reproduce authentic analog worn rubber stamp ink with porous bleeding and wobbly borders.
 * Based on mortspace/stamp reverse engineering.
 */
export const PrintMark: React.FC<PrintMarkProps> = ({
  print,
  className = '',
  scale = 1,
  animate = false,
  onClick,
  title,
}) => {
  const reactId = useId().replace(/:/g, '')
  const seed = useMemo(() => print.seed ?? Math.floor(Math.random() * 899) + 11, [print.seed])
  const filterId = `em-stamp-filter-${reactId}-${seed}`

  const statusConfig = STATUS_WORDS[print.status] || { word: print.status.toUpperCase(), defaultInk: 'red' }
  const headline = statusConfig.word
  const inkKey: StampInk = print.ink || statusConfig.defaultInk
  const inkColor = STAMP_INKS[inkKey]?.color || '#D8342B'

  const dateStr =
    print.dateText ||
    new Date()
      .toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      .toUpperCase()

  const rotateDeg = print.rotate ?? -3.5

  return (
    <div
      onClick={onClick}
      title={title}
      className={`inline-block select-none ${
        onClick ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'
      } transform-gpu ${
        animate ? 'animate-stamp-impact' : ''
      } ${className}`}
      style={{
        transform: `rotate(${rotateDeg}deg) scale(${scale})`,
        transformOrigin: 'center center',
      }}
      aria-label={`Official Stamp: ${headline} - ${dateStr}`}
    >
      <svg
        width="176"
        height="84"
        viewBox="0 0 176 84"
        className="overflow-visible"
        style={{ color: inkColor }}
      >
        <defs>
          <filter id={filterId} x="-6%" y="-10%" width="112%" height="120%">
            {/* Grain speckle */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.55"
              numOctaves={2}
              seed={seed}
              result="grain"
            />
            <feColorMatrix
              in="grain"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -7 0 0 0 5.15"
              result="speck"
            />
            <feComposite in="SourceGraphic" in2="speck" operator="in" result="inked" />

            {/* Edge displacement & tactile bleed */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.045"
              numOctaves={2}
              seed={seed + 13}
              result="wander"
            />
            <feDisplacementMap
              in="inked"
              in2="wander"
              scale={2.2}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g filter={`url(#${filterId})`} opacity="0.94">
          {/* Outer Border */}
          <rect
            x="3.5"
            y="3.5"
            width="169"
            height="77"
            rx="9"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.8"
          />

          {/* Inner Inset Border */}
          <rect
            x="8.5"
            y="8.5"
            width="159"
            height="67"
            rx="6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />

          {/* Stamp Primary Status Headline */}
          <text
            x="88"
            y="33"
            textAnchor="middle"
            fill="currentColor"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '19px',
              fontWeight: 800,
              letterSpacing: '0.18em',
              lineHeight: 1,
            }}
          >
            {headline}
          </text>

          {/* Subtitle / Verification Tag */}
          <text
            x="88"
            y="49"
            textAnchor="middle"
            fill="currentColor"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.22em',
              opacity: 0.85,
            }}
          >
            {print.subtitle || 'EVENTMESH REGISTRY'}
          </text>

          {/* Dynamic Date */}
          <text
            x="88"
            y="66"
            textAnchor="middle"
            fill="currentColor"
            style={{
              fontFamily: 'var(--font-mono), monospace',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.14em',
            }}
          >
            {dateStr}
          </text>
        </g>
      </svg>
    </div>
  )
}
