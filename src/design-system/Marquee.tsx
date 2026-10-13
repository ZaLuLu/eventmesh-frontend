import React from 'react'

export interface MarqueeItem {
  text: string
  highlight?: boolean
  badge?: string
}

export interface MarqueeProps {
  items?: (string | MarqueeItem)[]
  speed?: number
  variant?: 'mustard' | 'ink' | 'cobalt'
  className?: string
  pauseOnHover?: boolean
}

const DEFAULT_ITEMS: MarqueeItem[] = [
  { text: 'Grand Turing Hackathon 2026', badge: 'This Saturday' },
  { text: '3 Seats Remaining', highlight: true },
  { text: 'Autonomous Drone Flight Workshop Tomorrow', badge: 'Hands-on' },
  { text: 'Verified Digital Passports Issued Instantly' },
  { text: 'DevCraft Open Source Sprint', badge: '₹50,000 Pool' },
  { text: 'Venue Gate Scan & Check-in Active' },
]

/**
 * Live Dynamic Campus Ticker Ribbon (Audit Bake & Soda DNA).
 * Full-bleed high-contrast banner with smooth seamless marquee animation,
 * hover pause, and automatic OS reduced-motion pause.
 */
export const Marquee: React.FC<MarqueeProps> = ({
  items = DEFAULT_ITEMS,
  speed = 35,
  variant = 'mustard',
  className = '',
  pauseOnHover = true,
}) => {
  const variantStyles = {
    mustard: 'bg-mustard text-ink border-y border-ink',
    ink: 'bg-ink text-paper border-y border-ink',
    cobalt: 'bg-cobalt text-white border-y border-ink',
  }[variant]

  const normalizedItems = items.map((item) =>
    typeof item === 'string' ? { text: item } : item
  )

  return (
    <div
      className={`relative w-full overflow-hidden select-none py-2.5 sm:py-3 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider ${variantStyles} ${className}`}
      role="region"
      aria-label="Campus Live Event Ticker"
    >
      <div
        className={`flex w-max items-center gap-8 ${
          pauseOnHover ? 'hover:[animation-play-state:paused]' : ''
        }`}
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {/* Render 3 repetitions for seamless looping */}
        {[0, 1, 2].map((repeat) => (
          <div key={repeat} className="flex items-center gap-8 flex-shrink-0">
            {normalizedItems.map((item, idx) => (
              <div key={`${repeat}-${idx}`} className="flex items-center gap-3">
                <span className="opacity-40 text-base">✦</span>
                <span className={item.highlight ? 'underline decoration-2' : ''}>
                  {item.text}
                </span>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-ink text-paper">
                    {item.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-33.333%); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="animation: marquee"] {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}
