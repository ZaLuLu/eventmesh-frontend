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
  pink: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  mint: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  mustard: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/20' },
  tangerine: { bg: 'bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/20' },
  sky: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  lime: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  cobalt: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  lavender: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  ink: { bg: 'bg-surface-subtle', text: 'text-ink', border: 'border-line/30' },
  card: { bg: 'bg-surface', text: 'text-ink', border: 'border-line/30' },
  outline: { bg: 'bg-transparent', text: 'text-ink-soft', border: 'border-line/30' },
}

/**
 * Modern-Minimal Status Pill Primitive (replaces old comic Sticker)
 */
export const Sticker: React.FC<StickerProps> = ({
  children,
  color = 'card',
  size = 'md',
  tilt = 0,
  withShadow = false,
  className = '',
  icon,
  style,
  ...rest
}) => {
  const colorStyles = COLOR_MAP[color] || COLOR_MAP.card

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wide',
    md: 'text-xs px-2.5 py-1 font-medium tracking-normal',
    lg: 'text-xs px-3 py-1.5 font-medium tracking-normal',
  }[size]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full select-none border font-sans ${
        colorStyles.bg
      } ${colorStyles.text} ${colorStyles.border} ${sizeClasses} ${className}`}
      style={style}
      {...rest}
    >
      {icon && <span className="flex-shrink-0 opacity-80">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
