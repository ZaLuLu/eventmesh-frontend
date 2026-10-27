import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkle } from '@/design-system/Icon'

export interface ThemeCategory {
  id: string
  title: string
  kicker: string
  tag: string
  countLabel: string
  href: string
  image: string
  gradientFallback: string
}

const THEME_CATEGORIES: ThemeCategory[] = [
  {
    id: 'tech',
    title: 'Tech & Hackathons',
    kicker: 'Engineering & Code',
    tag: 'High Velocity',
    countLabel: '18 Live Events · Hackathons & AI',
    href: '/explore?category=hackathon',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    gradientFallback: 'from-slate-900 via-indigo-950 to-slate-900',
  },
  {
    id: 'cultural',
    title: 'Cultural & Music',
    kicker: 'Live Arts & Stage',
    tag: 'Main Stage',
    countLabel: '12 Live Events · Concerts & Drama',
    href: '/explore?category=cultural',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    gradientFallback: 'from-purple-950 via-slate-900 to-indigo-950',
  },
  {
    id: 'workshops',
    title: 'Workshops & Talks',
    kicker: 'Masterclasses & Career',
    tag: 'Studio Labs',
    countLabel: '9 Live Events · Founders & Design',
    href: '/explore?category=workshop',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    gradientFallback: 'from-slate-900 via-neutral-900 to-slate-950',
  },
]

/**
 * ActiveThemeTrio (Phase 3: Denim Dept Spotlight Architecture)
 * - 3 High-Impact Featured Category Cards (Tech, Cultural, Workshops)
 * - 4:5 Portrait aspect ratio with unified 14px border radius.
 * - Monochromatic stone-tinted (#EEF1EA) tag badges.
 * - Linear dark overlay ensuring 100% WCAG contrast on text over photography.
 * - Micro-interaction: Subtle 1.05x image scale and 4px arrow cue shift on hover.
 */
export const ActiveThemeTrio: React.FC = () => {
  return (
    <section
      aria-labelledby="active-themes-heading"
      className="relative w-full py-10 sm:py-14 border-b border-[#E2E8F0]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header with Denim Dept 0.25em Uppercase Tracking */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <span className="block text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#64748B] dark:text-ink-muted mb-1">
              Curated Spotlight
            </span>
            <h2
              id="active-themes-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-ink"
            >
              Trending Themes
            </h2>
          </div>
          <Link
            to="/explore"
            className="group inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent hover:text-accent-hover transition-colors self-start sm:self-auto"
          >
            <span>Explore all categories</span>
            <ArrowRight
              size={13}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* 3-Column Spotlight Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {THEME_CATEGORIES.map((theme) => (
            <Link
              key={theme.id}
              to={theme.href}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-[#E2E8F0] dark:border-line bg-card shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
            >
              {/* Fallback Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${theme.gradientFallback}`}
              />

              {/* Full-bleed Photo with subtle 1.04x hover scale */}
              <img
                src={theme.image}
                alt={theme.title}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                onError={(e) => {
                  // Fall back smoothly to gradient if external image fails
                  e.currentTarget.style.display = 'none'
                }}
              />

              {/* Denim Dept Linear Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

              {/* Top-Left: Denim Dept Stone Tag (#EEF1EA) */}
              <div className="absolute left-3.5 top-3.5 z-10">
                <span className="inline-flex items-center gap-1.5 rounded-[4px] border border-black/20 bg-[#EEF1EA] px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-[0.14em] text-neutral-900 shadow-xs">
                  <Sparkle size={12} className="text-neutral-700" />
                  <span>{theme.tag}</span>
                </span>
              </div>

              {/* Bottom Content Dock */}
              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6 flex flex-col justify-end text-white">
                <span className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-white/80 mb-1">
                  {theme.kicker}
                </span>

                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-white transition-colors">
                      {theme.title}
                    </h3>
                    <p className="text-sm text-white/90 font-medium mt-1 truncate">
                      {theme.countLabel}
                    </p>
                  </div>

                  {/* 1.5px Stroke Micro-Arrow Cue */}
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 border border-white/20 text-white backdrop-blur-none group-hover:bg-white group-hover:text-black group-hover:translate-x-1 transition-all duration-200">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
