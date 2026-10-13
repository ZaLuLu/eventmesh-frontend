import React from 'react'
import { Sticker } from './primitives/Sticker'

export interface SectionHeaderProps {
  badge?: string
  badgeColor?: 'pink' | 'mint' | 'mustard' | 'tangerine' | 'sky' | 'lime' | 'cobalt' | 'lavender'
  sticker?: string
  stickerColor?: 'pink' | 'mint' | 'mustard' | 'tangerine' | 'sky' | 'lime' | 'cobalt' | 'lavender'
  title: string
  /**
   * The single word inside the title that should receive the Instrument Serif italic flourish
   */
  accentWord?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  align?: 'left' | 'center'
}

/**
 * SectionHeader Primitive
 * Renders bold Bricolage Grotesque headlines with exactly ONE italic serif flourish word,
 * following the Campus Funk typography rules (Section 6.4).
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  badgeColor,
  sticker,
  stickerColor,
  title,
  accentWord,
  subtitle,
  action,
  className = '',
  align = 'left',
}) => {
  const activeBadge = badge || sticker
  const activeBadgeColor = badgeColor || stickerColor || 'mustard'
  // Render title with the accent word highlighted in Roman accent font and brand color (Gate 38a: No italic headers)
  const renderTitle = () => {
    if (!accentWord) return title

    const parts = title.split(new RegExp(`(${accentWord})`, 'gi'))
    return parts.map((part, index) => {
      if (part.toLowerCase() === accentWord.toLowerCase()) {
        return (
          <span
            key={index}
            className="font-accent font-normal not-italic px-1 text-cobalt inline-block"
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10 ${
        isCenter ? 'text-center items-center justify-center' : ''
      } ${className}`}
    >
      <div className={`space-y-2 max-w-2xl ${isCenter ? 'mx-auto' : ''}`}>
        {activeBadge && (
          <div className="mb-2">
            <Sticker color={activeBadgeColor} size="sm" tilt={-2}>
              {activeBadge}
            </Sticker>
          </div>
        )}
        <h2 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight leading-[1.05]">
          {renderTitle()}
        </h2>
        {subtitle && (
          <p className="text-ink-soft text-base sm:text-lg leading-relaxed font-sans">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="flex-shrink-0 pt-2 md:pt-0">{action}</div>}
    </div>
  )
}
