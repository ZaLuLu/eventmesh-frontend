import React from 'react'
import { getClubTheme } from '@/design-system/clubColors'

export interface PosterArtProps {
  eventId: string
  title: string
  category?: string
  clubId?: string
  date?: string
  className?: string
  aspectRatio?: 'square' | 'video' | 'poster'
}

/**
 * Deterministic PRNG based on Mulberry32
 */
export function createSeededRandom(seedStr: string) {
  let h = 0
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0
  }
  return function () {
    h |= 0
    h = h + 0x6D2B79F5 | 0
    let t = Math.imul(h ^ h >>> 15, 1 | h)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

/**
 * Seeded geometry generator for unit testability (Audit P-04)
 */
export function generatePosterGeometry(seed: string) {
  const prng = createSeededRandom(seed)
  return {
    circleRadius: 40 + Math.floor(prng() * 50),
    circleX: 80 + Math.floor(prng() * 140),
    circleY: 70 + Math.floor(prng() * 100),
    starburstPoints: 6 + Math.floor(prng() * 6),
    accentAngle: Math.floor(prng() * 360),
    hasStripes: prng() > 0.4,
    hasDots: prng() > 0.5,
    shapeCount: 3 + Math.floor(prng() * 3),
  }
}

/**
 * PosterArt: Generative Seeded SVG Gig Poster Engine (Audit V-02).
 * Renders bold, non-stock, deterministic vector artwork from event ID + club theme.
 * Completely eliminates generic placeholder images across the platform.
 */
export const PosterArt: React.FC<PosterArtProps> = ({
  eventId,
  title,
  category = 'hackathon',
  clubId,
  date,
  className = '',
  aspectRatio = 'poster',
}) => {
  const clubTheme = getClubTheme(clubId)
  const geom = generatePosterGeometry(`${eventId}-${title}-${category}`)
  const prng = createSeededRandom(`${eventId}-${clubId || 'default'}`)

  // ViewBox dimensions based on aspect ratio
  const dimensions = {
    square: { width: 400, height: 400 },
    video: { width: 480, height: 270 },
    poster: { width: 400, height: 500 },
  }[aspectRatio]

  const { width, height } = dimensions

  // Generate 2 complementary colors from club theme
  const bgFill = clubTheme.color
  const shapeFill1 = clubTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.22)' : 'rgba(21,17,48,0.18)'
  const shapeFill2 = clubTheme.textColor === '#FFFFFF' ? 'rgba(255,255,255,0.38)' : 'rgba(21,17,48,0.32)'
  const inkText = clubTheme.textColor

  return (
    <div
      role="img"
      aria-label={`Poster for ${title}${date ? `, ${date}` : ''}`}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
      style={{ backgroundColor: bgFill }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Dot Grid Pattern */}
          <pattern id={`dots-${eventId}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={shapeFill1} />
          </pattern>
          {/* Diagonal Stripes */}
          <pattern id={`stripes-${eventId}`} width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke={shapeFill1} strokeWidth="4" />
          </pattern>
        </defs>

        {/* Base Background */}
        <rect width={width} height={height} fill={bgFill} />

        {/* Pattern Underlay */}
        {geom.hasDots && (
          <rect width={width} height={height} fill={`url(#dots-${eventId})`} opacity="0.6" />
        )}
        {geom.hasStripes && !geom.hasDots && (
          <rect width={width} height={height} fill={`url(#stripes-${eventId})`} opacity="0.5" />
        )}

        {/* Flat Bold Geometric Shapes */}
        {/* Shape 1: Big Graphic Circle / Half Circle */}
        <circle
          cx={geom.circleX}
          cy={geom.circleY}
          r={geom.circleRadius + 40}
          fill={shapeFill1}
        />

        {/* Shape 2: Tilted Graphic Rect / Block */}
        <rect
          x={width - 160}
          y={height - 200}
          width="180"
          height="180"
          rx="32"
          transform={`rotate(${geom.accentAngle % 45} ${width - 70} ${height - 110})`}
          fill={shapeFill2}
        />

        {/* Shape 3: Geometric Arc / Starburst Motif */}
        <circle
          cx={width * 0.8}
          cy={height * 0.25}
          r={geom.circleRadius}
          fill="none"
          stroke={shapeFill2}
          strokeWidth="12"
          strokeDasharray="8 12"
        />

        {/* Category-Specific Architectural Glyph */}
        <g opacity="0.25">
          <circle cx="40" cy={height - 40} r="60" fill="none" stroke={inkText} strokeWidth="2" />
          <circle cx="40" cy={height - 40} r="40" fill="none" stroke={inkText} strokeWidth="1" strokeDasharray="4 4" />
        </g>
      </svg>

      {/* Gig Poster Typography Overlay */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between pointer-events-none">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-2">
          <span
            className="px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider rounded-full shadow-sm"
            style={{
              backgroundColor: inkText === '#FFFFFF' ? '#151130' : '#FFFDF8',
              color: inkText === '#FFFFFF' ? '#F6F1E7' : '#151130',
            }}
          >
            {category.toUpperCase()}
          </span>
          <span
            className="text-[12px] font-mono font-bold tracking-tight opacity-75"
            style={{ color: inkText }}
          >
            #{eventId.slice(0, 4).toUpperCase()}
          </span>
        </div>

        {/* Center / Bottom Large Display Typography */}
        <div className="mt-auto space-y-1">
          <h2
            className="font-display font-extrabold text-xl sm:text-2xl leading-[1.05] line-clamp-3 tracking-tight drop-shadow-xs"
            style={{ color: inkText }}
          >
            {title}
          </h2>
          {date && (
            <p
              className="text-[13px] font-mono font-semibold tracking-wide opacity-85"
              style={{ color: inkText }}
            >
              {date}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
