import React, { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'

export interface PosterArtworkProps {
  id?: string
  title?: string
  category?: string
  clubName?: string
  clubColor?: string
  imageUrl?: string
  dateStr?: string
  aspectRatio?: '5/4' | '4/3' | '16/9' | '16/10' | '1/1'
  className?: string
  priority?: boolean
  showOverlayBadges?: boolean
  event?: any
}

// Simple deterministic string hasher to derive numeric visual seeds
function hashString(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i)
  }
  return Math.abs(hash)
}

export const PosterArtwork: React.FC<PosterArtworkProps> = (props) => {
  const {
    event,
    id = event?.id || 'evt',
    title = event?.title || 'Event',
    category = event?.category || 'hackathon',
    clubName = event?.organizerName || 'Campus Collective',
    clubColor = event?.organizerColor || '#2F4BD6',
    imageUrl = event?.banner || event?.poster || props.imageUrl,
    dateStr = event?.startsAt || props.dateStr,
    aspectRatio = '5/4',
    className,
    priority = false,
  } = props
  const [imageLoaded, setImageLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Check if image is one of the generic placeholder circle webp files
  const isGenericCirclePlaceholder = useMemo(() => {
    return Boolean(imageUrl && imageUrl.includes('/images/events/event-'))
  }, [imageUrl])

  // Deterministic seed computation
  const seed = useMemo(() => hashString(id + title), [id, title])

  // Mathematical parameters for algorithmic SVG generation
  const patternData = useMemo(() => {
    const s1 = seed % 360
    const s2 = (seed >> 3) % 100
    const cat = category.toLowerCase()

    // Color palette calculation based on club color + category harmonics
    const primaryHue = s1
    const secondaryHue = (s1 + 45) % 360

    return {
      angle: s1,
      variant: seed % 4, // 0: Telemetry grid, 1: Neural Fourier waves, 2: Cybernetic polygons, 3: Orbital rings
      subtleSeed: s2,
      primaryColor: clubColor,
      category: cat,
    }
  }, [seed, clubColor, category])

  // SVG Artwork Generator based on theme
  const renderGenerativeArt = () => {
    const { angle, variant, primaryColor } = patternData

    return (
      <svg
        className="w-full h-full object-cover select-none pointer-events-none"
        viewBox="0 0 500 400"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0047FF" />
            <stop offset="100%" stopColor="#0035BE" />
          </linearGradient>

          <pattern id={`grid-${seed}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path
              d="M 24 0 L 0 0 0 24"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="0.75"
            />
          </pattern>
        </defs>

        {/* Electric Cobalt Base Canvas */}
        <rect width="100%" height="100%" fill={`url(#grad-${seed})`} />
        <rect width="100%" height="100%" fill={`url(#grid-${seed})`} />

        {/* Dynamic Pattern Elements based on variant */}
        {variant === 0 && (
          // Vector Vectors & Crosshairs
          <g opacity="0.9">
            <line x1="50" y1="50" x2="450" y2="350" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeDasharray="4 8" />
            <line x1="50" y1="350" x2="450" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <circle cx="250" cy="200" r="110" fill="none" stroke="white" strokeWidth="1.5" />
            <circle cx="250" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" strokeDasharray="6 6" />
            <circle cx="250" cy="200" r="45" fill="white" fillOpacity="0.2" />
            <polygon points="250,90 350,260 150,260" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" />
          </g>
        )}

        {variant === 1 && (
          // Geometric Waves
          <g opacity="0.95">
            {Array.from({ length: 6 }).map((_, i) => (
              <path
                key={i}
                d={`M -20 ${140 + i * 22} Q 120 ${80 + i * 30}, 250 ${200 + i * 15} T 520 ${160 + i * 20}`}
                fill="none"
                stroke="white"
                strokeWidth={i === 2 ? '2' : '1'}
                strokeOpacity={0.3 + i * 0.12}
              />
            ))}
            <circle cx="380" cy="120" r="70" fill="white" fillOpacity="0.15" />
            <circle cx="120" cy="280" r="90" fill="white" fillOpacity="0.08" />
          </g>
        )}

        {variant === 2 && (
          // Isometric Prisms
          <g opacity="0.9">
            <polygon
              points="250,60 380,140 380,290 250,370 120,290 120,140"
              fill="none"
              stroke="white"
              strokeWidth="2"
            />
            <polygon
              points="250,110 330,160 330,250 250,300 170,250 170,160"
              fill="white"
              fillOpacity="0.15"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1"
            />
            <line x1="250" y1="60" x2="250" y2="370" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="120" y1="140" x2="380" y2="290" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          </g>
        )}

        {variant === 3 && (
          // Modernist Rings
          <g opacity="0.9">
            <ellipse cx="250" cy="200" rx="180" ry="70" fill="none" stroke="white" strokeWidth="1.8" transform={`rotate(${angle % 45} 250 200)`} />
            <ellipse cx="250" cy="200" rx="160" ry="90" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" transform={`rotate(-${(angle * 1.5) % 60} 250 200)`} />
            <ellipse cx="250" cy="200" rx="120" ry="120" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" strokeDasharray="4 6" />
            <circle cx="250" cy="200" r="30" fill="white" fillOpacity="0.3" />
          </g>
        )}

        {/* Precision Modernist Tech Coordinates & Exhibition Watermark */}
        <g fill="rgba(255,255,255,0.85)" fontSize="10" fontFamily="monospace" letterSpacing="2">
          <text x="32" y="38">M//ESH.2026</text>
          <text x="380" y="38">#{(seed % 999).toString().padStart(3, '0')}</text>
          <text x="32" y="375">{category.toUpperCase()}</text>
          <text x="360" y="375">SYS.LIVE</text>
        </g>
      </svg>
    )
  }

  // Use generative art if it's the generic circle placeholder or if error/no image
  const shouldRenderGenerative = !imageUrl || hasError || isGenericCirclePlaceholder

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden bg-[#0047FF] flex items-center justify-center group',
        className
      )}
    >
      {/* Background Animated Shimmer Loading Skeleton */}
      {!imageLoaded && !shouldRenderGenerative && (
        <div className="absolute inset-0 bg-gradient-to-r from-surface/20 via-surface/40 to-surface/20 animate-pulse" />
      )}

      {shouldRenderGenerative ? (
        <div className="w-full h-full relative">
          {renderGenerativeArt()}

          {/* Holographic Subtle Glass Sheen on Hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background:
                'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0.08) 45%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.08) 55%, transparent 75%)',
            }}
          />
        </div>
      ) : (
        <>
          <img
            src={imageUrl}
            alt={title}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={() => setImageLoaded(true)}
            onError={() => setHasError(true)}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-300 ease-out',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
          />

          {/* Ambient Card Shadow Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </>
      )}
    </div>
  )
}
