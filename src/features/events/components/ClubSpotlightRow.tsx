import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { Club } from '@/api'

interface ClubSpotlightRowProps {
  clubs: Club[]
}

export const ClubSpotlightRow: React.FC<ClubSpotlightRowProps> = ({ clubs }) => {
  if (!clubs || clubs.length === 0) return null

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-end justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
            Explore by Technical Collective
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            9 specialized engineering clubs and creative guilds
          </p>
        </div>

        <Link
          to="/clubs"
          className="neo-pill px-3.5 py-1 text-xs font-bold text-indigo-600 hover:text-purple-600 inline-flex items-center gap-1 transition-all"
        >
          <span>All Clubs</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {clubs.map((club) => {
          const color = club.color || '#6366F1'
          return (
            <Link
              key={club.id}
              to={`/clubs/${club.slug}`}
              className="flex-shrink-0 group flex items-center gap-3 px-4 py-3.5 rounded-2xl neo-card min-w-[210px] select-none"
            >
              {/* Club Avatar Dot / Icon */}
              <div
                className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-neo-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: color }}
              >
                {club.name.slice(0, 3).toUpperCase()}
              </div>

              <div>
                <h4 className="font-display font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[130px]">
                  {club.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mt-0.5">
                  <Users className="h-3 w-3 text-indigo-500" />
                  <span>{club.followersCount || 40}+ members</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
