import React from 'react'

export interface SectionHeaderProps {
  badge?: string
  badgeColor?: string
  sticker?: string
  stickerColor?: string
  title: string
  accentWord?: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  align?: 'left' | 'center'
}

/**
 * Modern-Minimal SectionHeader Primitive (Option B: Seamless Borderless)
 * Upright, disciplined Geist Sans headline, zero comic stickers, zero italic headers (Gate 38a).
 */
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  sticker,
  title,
  subtitle,
  action,
  className = '',
  align = 'left',
}) => {
  const activeBadge = badge || sticker
  const isCenter = align === 'center'

  return (
    <div
      className={`flex flex-col gap-2 ${isCenter ? 'items-center text-center' : 'items-start text-left'} ${className}`}
    >
      {activeBadge && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider text-accent bg-accent-soft">
          {activeBadge}
        </span>
      )}

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 w-full">
        <div>
          <h2 className="font-sans font-semibold text-2xl sm:text-3xl tracking-tight text-ink">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-ink-soft max-w-xl mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  )
}
