import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowRight } from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'

export const ClubsPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()

  return (
    <div className="w-full bg-canvas text-slate-900 min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#EEF2F6] border-b border-white/70 shadow-neo-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 tracking-normal block mb-1">
              Autonomous Collectives & Guilds
            </span>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
              The 9 Technical Clubs
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
              Specialized engineering collectives dedicated to software, AI research, robotics, embedded hardware, and cybersecurity.
            </p>
          </div>
        </div>
      </div>

      {/* Modern 3-Column Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-56 rounded-3xl neo-card animate-pulse border border-white/60" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubs.map((club, index) => {
              const color = club.color || '#6366F1'
              return (
                <Link
                  key={club.id}
                  to={`/clubs/${club.slug}`}
                  className="group relative flex flex-col justify-between p-7 rounded-3xl neo-card border border-white/80 shadow-neo-card hover:shadow-neo-card-hover transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Accent Top Stripe */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: color }}
                  />

                  <div>
                    {/* Club Header & Avatar */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="h-12 w-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-neo-sm transition-transform group-hover:scale-105"
                        style={{ backgroundColor: color }}
                      >
                        {club.name.slice(0, 3).toUpperCase()}
                      </div>

                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h2 className="font-display font-extrabold text-xl text-slate-900 group-hover:text-indigo-600 transition-colors mb-2">
                      {club.name}
                    </h2>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-6 font-medium">
                      {club.about || club.whatWeDo}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{club.followersCount || 40}+ Members</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
