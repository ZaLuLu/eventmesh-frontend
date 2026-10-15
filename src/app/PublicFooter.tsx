// Hallmark macrostructure: PageFooter / Ft2 Minimal Inline Footer
import React from 'react'
import { Link } from 'react-router-dom'

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-paper border-t border-line py-12 select-none text-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Tagline */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/" aria-label="EventMesh home" className="font-semibold text-sm tracking-[-0.03em] text-ink hover:text-accent transition-colors">
            eventmesh
          </Link>
          <span className="text-ink-muted text-xs">·</span>
          <p className="text-xs text-ink-muted">
            Discover events and organizers.
          </p>
        </div>

        {/* Right: Discrete Links */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-ink-soft">
          <Link to="/explore" className="hover:text-ink transition-colors">
            Explore
          </Link>
          <Link to="/clubs" className="hover:text-ink transition-colors">
            Clubs
          </Link>
          <Link to="/schedule" className="hover:text-ink transition-colors">
            Calendar
          </Link>
          <Link to="/about" className="hover:text-ink transition-colors">
            About
          </Link>
          <span className="text-ink-muted">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  )
}
