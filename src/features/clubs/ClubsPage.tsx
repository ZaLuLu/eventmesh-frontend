// Hallmark macrostructure: Vibrant Color-Blocked Tiles
import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowRight } from '@phosphor-icons/react'
import { useClubs, useToggleFollowClub } from '@/hooks/useClubs'
import { FALLBACK_CLUBS } from '@/data/heroFallbacks'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { useToast } from '@/design-system/primitives/Toast'

export const ClubsPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()
  const toggleFollowMutation = useToggleFollowClub()
  const { toast } = useToast()

  const displayClubs = clubs.length > 0 ? clubs : FALLBACK_CLUBS

  const handleToggleFollow = async (clubId: string, clubName: string) => {
    try {
      const isNowFollowed = await toggleFollowMutation.mutateAsync(clubId)
      toast({
        title: isNowFollowed ? `Subscribed to ${clubName}` : `Unfollowed ${clubName}`,
        message: isNowFollowed
          ? 'You will receive priority updates for workshops & hackathons.'
          : 'You will no longer receive notification alerts from this club.',
        type: 'info',
      })
    } catch {
      toast({ title: 'Action failed', type: 'error' })
    }
  }

  return (
    <PageShell className="py-8 sm:py-12 space-y-10">
      {/* Editorial Header */}
      <div className="space-y-4">
        <SectionHeader
          badge="Campus Collectives"
          title="Student Clubs & Creative Studios"
          subtitle="Student-run engineering guilds, open-source collectives, and creative societies. Find your community and build real projects."
        />
      </div>

      {/* Modern Minimal Club Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-surface-subtle animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayClubs.map((club) => {
            const isFollowed = Boolean(club.isFollowed)
            const initials = club.name.slice(0, 2).toUpperCase()

            return (
              <div
                key={club.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-line bg-card hover:border-accent/40 p-6 sm:p-7 transition-all duration-300 hover:-translate-y-0.5 shadow-xs hover:shadow-md select-none overflow-hidden"
              >
                <div className="space-y-4">
                  {/* Top Bar: Society Monogram & Bell Follow Pill */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent font-bold font-mono text-xs flex items-center justify-center border border-accent/20">
                        {initials}
                      </div>
                      <Badge
                        variant="neutral"
                        size="sm"
                        className="tracking-wider uppercase text-[10px] font-mono"
                      >
                        {club.joinMode ? club.joinMode.replace('_', ' ') : 'Open Collective'}
                      </Badge>
                    </div>

                    <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      <BellToggle
                        pressed={isFollowed}
                        onChange={() => handleToggleFollow(club.id, club.name)}
                        size="sm"
                        onLabel="Subscribed"
                        offLabel="Follow"
                        badge={false}
                      />
                    </div>
                  </div>

                  {/* Club Name */}
                  <Link to={`/clubs/${club.slug}`} className="block group-hover:text-accent transition-colors">
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-ink tracking-tight leading-tight">
                      {club.name}
                    </h2>
                  </Link>

                  {/* Shortened description */}
                  <p className="text-ink-soft text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {club.about || club.whatWeDo || 'Hands-on collegiate engineering and creative building collective.'}
                  </p>
                </div>

                {/* Footer Strip: Members & Minimalist Explore Action */}
                <div className="pt-4 mt-6 border-t border-line/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-ink-soft text-xs font-mono">
                    <Users className="w-3.5 h-3.5 text-accent" weight="bold" />
                    <span>{club.followersCount == null ? 'Followers unavailable' : `${club.followersCount} members`}</span>
                  </div>

                  <Link
                    to={`/clubs/${club.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-ink group-hover:text-accent transition-colors"
                  >
                    <span>View collective</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}
