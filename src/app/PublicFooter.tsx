// Hallmark macrostructure: PageFooter / Ft2 Minimal Inline Footer
import React from 'react'
import { Link } from 'react-router-dom'

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[var(--color-paper)] border-t border-[var(--color-line)] py-12 select-none text-[var(--color-ink)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center font-sans font-bold text-[10px]">
              EM
            </div>
            <span className="font-sans font-semibold text-sm tracking-tight text-ink">
              EventMesh
            </span>
          </Link>
          <span className="text-ink-muted text-xs">·</span>
          <p className="text-xs text-ink-muted">
            The live index for campus collectives.
          </p>
        </div>

        {/* Center: System Status */}
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-[11px]">Systems Operational</span>
        </div>

        {/* Right: Discrete Links */}
        <div className="flex items-center gap-5 text-xs text-ink-soft">
          <Link to="/explore" className="hover:text-ink transition-colors">
            Explore
          </Link>
          <Link to="/clubs" className="hover:text-ink transition-colors">
            Clubs
          </Link>
          <Link to="/calendar" className="hover:text-ink transition-colors">
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
