import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, ArrowUpRight, Users } from '@/design-system/Icon'
import { getClubTheme } from '@/design-system/clubColors'
import { useClubs, useToggleFollowClub } from '@/hooks/useClubs'
import { Organizer } from '@/api'
import { FALLBACK_CLUBS } from '@/data/heroFallbacks'

/**
 * ClubsStrip: Modern-Minimal Campus Collective Directory
 * Borderless, serene, and typographic-first.
 */
export const ClubsStrip: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()
  const toggleFollowMutation = useToggleFollowClub()

  const displayClubs = clubs.length > 0 ? clubs : FALLBACK_CLUBS

  if (isLoading && clubs.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-surface-subtle animate-pulse" />
        ))}
      </div>
    )
  }

  const handleFollowClick = (e: React.MouseEvent, clubId: string) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFollowMutation.mutate(clubId)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayClubs.map((club: Organizer, index: number) => {
        const theme = getClubTheme(club.slug || club.id)
        const isFollowed = Boolean(club.isFollowed)
        const followers = club.followersCount || 120 + (index * 45)

        return (
          <Link
            key={club.id}
            to={`/clubs/${club.slug || club.id}`}
            className="group relative flex flex-col justify-between p-5 rounded-2xl bg-card border border-purple-200/60 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700 hover:shadow-lg hover:shadow-purple-950/5 transition-all duration-200 select-none"
          >
            {/* Top Bar: Club Icon, Member Count & Follow Pill */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: theme.hex || 'var(--accent)' }}
                >
                  {club.name[0]}
                </div>
                <span className="font-mono text-xs text-ink-muted">
                  {followers} members
                </span>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={(e) => handleFollowClick(e, club.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors ${
                  isFollowed
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-surface-subtle text-ink-soft hover:bg-accent-soft hover:text-accent'
                }`}
                aria-label={isFollowed ? `Following ${club.name}` : `Follow ${club.name}`}
              >
                {isFollowed ? (
                  <>
                    <Check size={11} weight="bold" />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <Bell size={11} weight="bold" />
                    <span>Join</span>
                  </>
                )}
              </button>
            </div>

            {/* Club Name & Description */}
            <div className="space-y-1 mb-2">
              <h3 className="font-sans font-semibold text-base text-ink group-hover:text-accent transition-colors flex items-center justify-between">
                <span>{club.name}</span>
                <ArrowUpRight
                  size={15}
                  weight="bold"
                  className="text-ink-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </h3>
              <p className="text-xs text-ink-soft line-clamp-2 leading-relaxed">
                {club.about || club.whatWeDo || 'Active collegiate engineering and design society.'}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
