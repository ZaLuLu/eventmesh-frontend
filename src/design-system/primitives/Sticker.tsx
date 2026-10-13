import React from 'react'

export type StickerColor =
  | 'pink'
  | 'mint'
  | 'mustard'
  | 'tangerine'
  | 'sky'
  | 'lime'
  | 'cobalt'
  | 'lavender'
  | 'ink'
  | 'card'
  | 'outline'

export interface StickerProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  color?: StickerColor
  size?: 'sm' | 'md' | 'lg'
  tilt?: number | 'random'
  withShadow?: boolean
  className?: string
  icon?: React.ReactNode
}

const COLOR_MAP: Record<StickerColor, { bg: string; text: string; border: string }> = {
  pink: { bg: 'bg-pink', text: 'text-white', border: 'border-ink' },
  mint: { bg: 'bg-mint', text: 'text-ink', border: 'border-ink' },
  mustard: { bg: 'bg-mustard', text: 'text-ink', border: 'border-ink' },
  tangerine: { bg: 'bg-tangerine', text: 'text-white', border: 'border-ink' },
  sky: { bg: 'bg-sky', text: 'text-ink', border: 'border-ink' },
  lime: { bg: 'bg-lime', text: 'text-ink', border: 'border-ink' },
  cobalt: { bg: 'bg-cobalt', text: 'text-white', border: 'border-ink' },
  lavender: { bg: 'bg-lavender', text: 'text-ink', border: 'border-ink' },
  ink: { bg: 'bg-ink', text: 'text-lime', border: 'border-lime' },
  card: { bg: 'bg-card', text: 'text-ink', border: 'border-ink/20' },
  outline: { bg: 'bg-transparent', text: 'text-ink', border: 'border-ink' },
}

/**
 * Tactile Campus Funk Sticker / Chip Primitive
 * Features physical paper sticker styling with optional subtle tilt (±2° - ±4°)
 * and hard offset micro-shadow.
 */
export const Sticker: React.FC<StickerProps> = ({
  children,
  color = 'mustard',
  size = 'md',
  tilt = 0,
  withShadow = true,
  className = '',
  icon,
  style,
  ...rest
}) => {
  const colorStyles = COLOR_MAP[color] || COLOR_MAP.mustard

  // Resolve rotation angle within funk budget (max ±4°)
  let rotationDeg = 0
  if (typeof tilt === 'number') {
    rotationDeg = Math.max(-4, Math.min(4, tilt))
  } else if (tilt === 'random') {
    rotationDeg = (Math.random() * 6 - 3) // -3deg to +3deg
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-bold tracking-[0.03em]',
    md: 'text-xs px-2.5 py-1 font-bold tracking-[0.03em]',
    lg: 'text-sm px-3.5 py-1.5 font-bold tracking-[0.02em]',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none border font-sans font-bold transition-transform hover:scale-105 ${
        colorStyles.bg
      } ${colorStyles.text} ${colorStyles.border} ${sizeClasses} ${
        withShadow ? 'shadow-[1.5px_1.5px_0_#151130]' : ''
      } ${className}`}
      style={{
        transform: rotationDeg !== 0 ? `rotate(${rotationDeg}deg)` : undefined,
        ...style,
      }}
      {...rest}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
