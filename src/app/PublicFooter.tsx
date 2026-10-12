import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'

export const PublicFooter: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E2E8F0] py-12 select-none text-[#0A0A0A]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Colophon Masthead */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-10 border-b border-[#E2E8F0] mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#0047FF] text-white flex items-center justify-center font-black text-sm tracking-tighter">
              EM
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#0A0A0A] block">
                EVENTMESH ARCHIVE
              </span>
              <span className="text-xs font-mono text-slate-500">
                Autonomous Campus Engineering & Science Event Mesh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-slate-500">
            <div>
              <span className="text-slate-400 block text-[10px]">COORDINATE</span>
              <span className="text-[#0047FF] font-semibold">12.9716° N, 79.1585° E</span>
            </div>
            <div className="border-l border-[#E2E8F0] pl-6">
              <span className="text-slate-400 block text-[10px]">TIMEZONE</span>
              <span className="text-[#0A0A0A] font-semibold">UTC+05:30 · ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 4 Architectural Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#0047FF] uppercase tracking-wider mb-4">
              01 // EXPLORE
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/explore" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  All symposiums & talks
                </Link>
              </li>
              <li>
                <Link to="/clubs" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Autonomous collectives
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Academic run-of-show
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#0047FF] uppercase tracking-wider mb-4">
              02 // ORGANIZERS
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/admin" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Organizer dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/events/new" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Publish an event dossier
                </Link>
              </li>
              <li>
                <Link to="/admin/checkin" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Gate attendance scanner
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#0047FF] uppercase tracking-wider mb-4">
              03 // PROCEEDINGS
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link to="/about" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  About EventMesh
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Photo proceedings
                </Link>
              </li>
              <li>
                <Link to="/styleguide" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Design system styleguide
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-mono font-bold text-[#0047FF] uppercase tracking-wider mb-4">
              04 // VERIFICATION
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link
                  to="/verify/TA-2026-001245"
                  className="text-slate-600 hover:text-[#0047FF] transition-colors inline-flex items-center gap-1"
                >
                  <span>Verify credential</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#0047FF]" />
                </Link>
              </li>
              <li>
                <Link to="/dev/accounts" className="text-slate-600 hover:text-[#0047FF] transition-colors">
                  Developer test accounts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Hairline Colophon Strip */}
        <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
          <p>© 2026 EventMesh. Engineered for campus research, culture, and hackathon networks.</p>
          <div className="flex items-center gap-4">
            <span className="text-[#0047FF] font-semibold">ELECTRIC COBALT & PAPER WHITE SYSTEM</span>
            <span>·</span>
            <Link to="/styleguide" className="hover:text-[#0047FF] underline">
              DESIGN TOKENS
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
