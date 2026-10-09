import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Club } from '@/api'

interface ClubSpotlightRowProps {
  clubs: Club[]
}

export const ClubSpotlightRow: React.FC<ClubSpotlightRowProps> = ({ clubs }) => {
  if (!clubs || clubs.length === 0) return null

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
            Clubs & Collectives
          </h2>
          <p className="text-small text-text-2">
            Technical collectives, developer societies, and guilds
          </p>
        </div>

        <Link
          to="/clubs"
          className="text-small font-semibold text-accent hover:underline inline-flex items-center gap-1"
        >
          <span>All clubs ({clubs.length})</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Compact row of club tiles with 10px dot, name, event count */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {clubs.slice(0, 10).map((club) => {
          const color = club.color || '#C93E27'
          return (
            <Link
              key={club.id}
              to={`/clubs/${club.slug}`}
              className="group flex items-center gap-3 p-3.5 rounded-[10px] bg-surface border border-line hover:border-text-3 transition-colors"
            >
              {/* 10px Club Dot */}
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-small text-text group-hover:underline truncate">
                  {club.name}
                </h4>
                <p className="text-caption text-text-2 truncate">
                  {club.followersCount ? `${club.followersCount} members` : 'Collective'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
