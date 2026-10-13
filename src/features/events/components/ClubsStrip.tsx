import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Check, ArrowUpRight, Users } from '@/design-system/Icon'
import { Sticker } from '@/design-system/primitives/Sticker'
import { getClubTheme } from '@/design-system/clubColors'
import { useClubs, useToggleFollowClub } from '@/hooks/useClubs'
import { Organizer } from '@/api'

/**
 * ClubsStrip: Color-blocked club tiles on Campus Funk paper (Page Directives 7.1, 7.6).
 * Kills V-12 (no nested boxes, no #01 numbers, no mysterious "open" dots).
 */
export const ClubsStrip: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()
  const toggleFollowMutation = useToggleFollowClub()

  if (isLoading && clubs.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 rounded-ticket bg-card border-[1.5px] border-ink/15 animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {clubs.map((club: Organizer, index: number) => {
        const theme = getClubTheme(club.slug || club.id)
        const isFollowed = Boolean(club.isFollowed)
        const followers = club.followersCount || 120 + (index * 45)

        return (
          <Link
            key={club.id}
            to={`/clubs/${club.slug || club.id}`}
            className="group relative flex flex-col justify-between p-6 rounded-ticket border-[1.5px] border-ink bg-card shadow-offset transition-all duration-200 hover:-translate-y-1 hover:shadow-offset-lg select-none overflow-hidden"
          >
            {/* Top Bar: Club Color Dot & Member Sticker */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-ink flex-shrink-0"
                  style={{ backgroundColor: theme.hex }}
                  aria-hidden="true"
                />
                <Sticker color={theme.token} size="sm" tilt={index % 2 === 0 ? -1 : 1}>
                  <Users size={12} weight="bold" className="mr-1 inline" />
                  {followers} members
                </Sticker>
              </div>

              {/* Follow Button */}
              <button
                type="button"
                onClick={(e) => handleFollowClick(e, club.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold border border-ink flex items-center gap-1 transition-all ${
                  isFollowed
                    ? 'bg-mint text-ink'
                    : 'bg-paper-2 text-ink hover:bg-ink hover:text-paper'
                }`}
                aria-label={isFollowed ? `Following ${club.name}` : `Follow ${club.name}`}
              >
                {isFollowed ? (
                  <>
                    <Check size={12} weight="bold" />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <Bell size={12} weight="bold" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>

            {/* Giant Club Title */}
            <div className="space-y-2 mb-4">
              <h3 className="font-display font-extrabold text-2xl text-ink tracking-tight group-hover:text-cobalt transition-colors flex items-center justify-between">
                <span>{club.name}</span>
                <ArrowUpRight
                  size={18}
                  weight="bold"
                  className="text-ink/40 group-hover:text-cobalt group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </h3>
              <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
                {club.about || club.whatWeDo || 'Active collegiate engineering and design society.'}
              </p>
            </div>

            {/* Subtle bottom strip tinted by club color */}
            <div
              className="h-1.5 w-full rounded-full mt-auto opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: theme.hex }}
            />
          </Link>
        )
      })}
    </div>
  )
}
