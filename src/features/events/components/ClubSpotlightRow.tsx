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
          className="text-xs font-semibold text-md-primary hover:underline inline-flex items-center gap-1"
        >
          <span>All Clubs</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        {clubs.map((club) => {
          const color = club.color || '#1A73E8'
          return (
            <Link
              key={club.id}
              to={`/clubs/${club.slug}`}
              className="flex-shrink-0 group flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#DADCE0] shadow-subtle hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 min-w-[200px]"
            >
              {/* Club Avatar Dot / Icon */}
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-xs transition-transform group-hover:scale-105"
                style={{ backgroundColor: color }}
              >
                {club.name.slice(0, 3).toUpperCase()}
              </div>

              <div>
                <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-md-primary transition-colors truncate max-w-[130px]">
                  {club.name}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Users className="h-3 w-3" />
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
