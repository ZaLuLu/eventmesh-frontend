// Hallmark macrostructure: PageFooter
import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Sparkle } from '@/design-system/Icon'

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-paper border-t border-ink/10 pt-16 pb-8 select-none text-ink overflow-hidden">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top 3-Column Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-16 border-b border-ink/10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center font-display font-black text-xs shadow-offset group-hover:bg-cobalt transition-colors">
                EM
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight text-ink">
                Event<span className="font-accent italic text-cobalt font-normal text-2xl">M</span>esh
              </span>
            </Link>
            <p className="text-sm text-ink-soft leading-relaxed max-w-xs">
              The high-energy hub for campus symposiums, hackathons, and student-run collectives.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper-2 rounded-full border border-ink/15 text-xs font-semibold text-ink">
              <Sparkle size={13} weight="fill" className="text-mustard" />
              <span>Campus Funk Edition</span>
            </div>
          </div>

          {/* Col 1: Explore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/explore" className="text-ink hover:text-cobalt transition-colors">
                  All events & workshops
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="text-ink hover:text-cobalt transition-colors">
                  Clubs & societies
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-ink hover:text-cobalt transition-colors">
                  Campus calendar
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-ink hover:text-cobalt transition-colors">
                  Event polaroids & archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Organizers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Organizers
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/admin" className="text-ink hover:text-cobalt transition-colors">
                  Admin console
                </Link>
              </li>
              <li>
                <Link to="/admin/events/new" className="text-ink hover:text-cobalt transition-colors">
                  Create new event
                </Link>
              </li>
              <li>
                <Link to="/admin/checkin" className="text-ink hover:text-cobalt transition-colors">
                  Gate check-in desk
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-ink hover:text-cobalt transition-colors">
                  About EventMesh
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student Pass */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Student Pass
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/attendee/dashboard" className="text-ink hover:text-cobalt transition-colors">
                  My tickets & 3D badge
                </Link>
              </li>
              <li>
                <Link
                  to="/verify/TA-2026-001245"
                  className="text-ink hover:text-cobalt transition-colors inline-flex items-center gap-1"
                >
                  <span>Verify credential</span>
                  <ArrowUpRight size={13} weight="bold" className="text-cobalt" />
                </Link>
              </li>
              <li>
                <a
                  href="#how-tickets-work"
                  className="text-ink hover:text-cobalt transition-colors"
                >
                  How ticket check-in works
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-soft">
          <p>© 2026 EventMesh. Built for collegiate creators, hackers, and clubs.</p>
          <div className="flex items-center gap-4">
            <span className="font-mono text-ink/70">IST (UTC+05:30)</span>
            <span>·</span>
            <span>Natural paper & offset ink</span>
          </div>
        </div>

        {/* Giant Cropped Wordmark (V-05) */}
        <div className="mt-12 sm:mt-16 -mb-6 sm:-mb-10 text-center pointer-events-none select-none overflow-hidden">
          <span className="font-display font-black text-[clamp(4.5rem,19vw,17rem)] leading-[0.75] tracking-tighter text-ink/[0.06] block uppercase">
            EventMesh
          </span>
        </div>
      </div>
    </footer>
  )
}
