import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users } from 'lucide-react'
import { useClubs } from '@/hooks/useClubs'
import { Skeleton } from '@/design-system/primitives/Skeleton'

export const ClubsPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()

  return (
    <div className="w-full bg-bg text-text pb-16">
      {/* Header Block */}
      <div className="border-b border-line bg-surface">
        <div className="app-container py-6 sm:py-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
            Clubs & Collectives
          </h1>
          <p className="text-small text-text-2 mt-0.5 max-w-xl">
            Autonomous engineering guilds, technical societies, and creative collectives across campus
          </p>
        </div>
      </div>

      {/* Grid of Flat Club Cards */}
      <div className="app-container py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} height="h-52" rounded="rounded-panel" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {clubs.map((club, index) => {
              const color = club.color || '#C93E27'
              return (
                <Link
                  key={club.id}
                  to={`/clubs/${club.slug}`}
                  className="group flex flex-col justify-between p-6 rounded-panel bg-surface border border-line hover:border-text-3 transition-colors select-none"
                >
                  <div>
                    {/* Club Header & 10px Dot */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        {/* 10px Club Dot */}
                        <span
                          className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                          aria-hidden="true"
                        />
                        <span className="text-caption font-semibold text-text-2">
                          {club.joinMode ? club.joinMode.replace('_', ' ') : 'Collective'}
                        </span>
                      </div>

                      <span className="text-caption font-mono text-text-3">
                        #{String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold text-text group-hover:underline mb-2">
                      {club.name}
                    </h2>

                    <p className="text-small text-text-2 line-clamp-3 leading-relaxed mb-6">
                      {club.about || club.whatWeDo || 'Specialized collegiate engineering collective focused on collaborative projects and workshops.'}
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-line flex items-center justify-between text-small">
                    <div className="flex items-center gap-1.5 text-text-2">
                      <Users className="h-4 w-4 text-text-3" />
                      <span>{club.followersCount || 40}+ members</span>
                    </div>

                    <div className="flex items-center gap-1 font-semibold text-accent">
                      <span>View club</span>
                      <ArrowRight className="h-4 w-4" />
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
