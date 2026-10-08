import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Users } from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'
import { Button } from '@/design-system/primitives/Button'

export const ClubsPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()

  return (
    <div className="w-full bg-paper text-ink min-h-screen">
      {/* Editorial Header */}
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
          Federation Directorate
        </span>
        <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
          The 9 Clubs
        </h1>
        <p className="font-body text-base text-ink-60 max-w-xl mt-3">
          Independent student collectives dedicated to software engineering, algorithmic competition, autonomous robotics, hardware telemetry, design, and cybersecurity.
        </p>
      </div>

      {/* Clubs List */}
      <div className="w-full border-b border-ink-15">
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs uppercase tracking-wide text-ink-60">
            Loading Collectives...
          </div>
        ) : (
          clubs.map((club, index) => (
            <Link
              key={club.id}
              to={`/clubs/${club.slug}`}
              className="group border-b border-ink-15 py-8 sm:py-10 px-[4vw] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-paper-deep transition-colors"
            >
              <div className="flex items-start sm:items-baseline gap-4 sm:gap-8 flex-1">
                <span className="font-mono text-xs sm:text-sm font-bold opacity-40 group-hover:opacity-100 flex-shrink-0 pt-1 sm:pt-0">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="inline-block h-3 w-3 flex-shrink-0"
                      style={{ backgroundColor: club.color }}
                    />
                    <span className="font-mono text-xs uppercase tracking-widecaps text-ink-60 font-semibold">
                      {club.followersCount} Followers
                    </span>
                    <span className="text-ink-15">·</span>
                    <span className="font-mono text-xs uppercase text-ink-60">
                      Join Mode: {club.joinMode}
                    </span>
                  </div>

                  <h2 className="font-display text-3xl sm:text-5xl uppercase text-ink group-hover:translate-x-2 transition-transform">
                    {club.name}
                  </h2>

                  <p className="font-body text-sm sm:text-base text-ink-60 mt-3 max-w-2xl">
                    {club.about}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-ink-15">
                <Button size="sm" variant="secondary" arrow>
                  Club Dossier
                </Button>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
