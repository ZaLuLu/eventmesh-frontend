import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-surface border-t border-line py-10 select-none text-ink">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1 */}
          <div>
            <h4 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link to="/explore" className="text-ink hover:text-champion transition-colors">
                  All symposiums & talks
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="text-ink hover:text-champion transition-colors">
                  Autonomous collectives
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-ink hover:text-champion transition-colors">
                  Academic schedule
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Collectives
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link to="/admin" className="text-ink hover:text-champion transition-colors">
                  Organizer dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/events/new" className="text-ink hover:text-champion transition-colors">
                  Publish an event
                </Link>
              </li>
              <li>
                <Link to="/admin/checkin" className="text-ink hover:text-champion transition-colors">
                  Gate attendance scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link to="/about" className="text-ink hover:text-champion transition-colors">
                  About EventMesh
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-ink hover:text-champion transition-colors">
                  Photo proceedings
                </Link>
              </li>
              <li>
                <Link to="/styleguide" className="text-ink hover:text-champion transition-colors">
                  Design system styleguide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider mb-3">
              Verifications
            </h4>
            <ul className="space-y-2 text-[14px]">
              <li>
                <Link
                  to="/verify/TA-2026-001245"
                  className="text-ink hover:text-champion transition-colors inline-flex items-center gap-1"
                >
                  <span>Verify credential</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </Link>
              </li>
              <li>
                <Link to="/dev/accounts" className="text-ink hover:text-champion transition-colors">
                  Developer test accounts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 border-t border-line/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[13px] text-ink-muted">
          <p>© 2026 EventMesh. Autonomous Campus Engineering & Science Event Mesh.</p>
          <div className="flex items-center gap-4">
            <span>Champion & Lavender Visual System</span>
            <span>·</span>
            <Link to="/styleguide" className="hover:text-champion underline">
              Design Tokens
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
