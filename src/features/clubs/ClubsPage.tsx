// Hallmark macrostructure: Catalog-Clubs
import React from 'react'
import { Link } from 'react-router-dom'
import { Users, ArrowRight, Sparkle } from '@phosphor-icons/react'
import { useClubs, useToggleFollowClub } from '@/hooks/useClubs'
import { PageShell } from '@/design-system/layout/PageShell'
import { SectionHeader } from '@/design-system/SectionHeader'
import { Sticker } from '@/design-system/primitives/Sticker'
import { Button } from '@/design-system/primitives/Button'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { getClubTheme } from '@/design-system/clubColors'
import { useToast } from '@/design-system/primitives/Toast'

export const ClubsPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()
  const toggleFollowMutation = useToggleFollowClub()
  const { toast } = useToast()

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
          badge="STUDENT ORGANISATIONS"
          badgeColor="tangerine"
          title="Campus Clubs & Creative Studios"
          accentWord="Clubs"
          subtitle="9 student-run engineering guilds, open-source collectives, and creative societies. Find your community, build real projects, and join the next hackathon."
        />
      </div>

      {/* Colour-Blocked Club Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-72 rounded-[20px] bg-paper-2 border-2 border-ink animate-pulse shadow-[4px_4px_0_#151130]"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {clubs.map((club) => {
            const theme = getClubTheme(club.name)
            const isFollowed = Boolean(club.isFollowed)

            return (
              <div
                key={club.id}
                className="group relative flex flex-col justify-between rounded-[20px] border-2 border-ink bg-card p-6 sm:p-7 shadow-[4px_4px_0_#151130] hover:shadow-[6px_6px_0_#151130] hover:-translate-y-1 transition-all duration-200 select-none overflow-hidden"
              >
                {/* Top Theme Banner Accent */}
                <div
                  className="absolute top-0 left-0 right-0 h-3 border-b-2 border-ink"
                  style={{ backgroundColor: theme.hex }}
                  aria-hidden="true"
                />

                <div className="pt-2 space-y-4">
                  {/* Top Bar: Category / Join Mode & Bell Follow */}
                  <div className="flex items-center justify-between gap-2">
                    <Sticker
                      color={theme.token}
                      size="sm"
                      className="font-bold tracking-wider uppercase text-[11px]"
                    >
                      {club.joinMode ? club.joinMode.replace('_', ' ') : 'Open Community'}
                    </Sticker>

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

                  {/* Club Name in Giant Bricolage Display */}
                  <Link to={`/clubs/${club.slug}`} className="block group-hover:text-cobalt transition-colors">
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-ink tracking-tight leading-tight">
                      {club.name}
                    </h2>
                  </Link>

                  {/* Shortened description clamped to 2 lines */}
                  <p className="text-ink-soft text-sm sm:text-base leading-relaxed line-clamp-2">
                    {club.about || club.whatWeDo || 'Hands-on collegiate engineering and creative building collective.'}
                  </p>
                </div>

                {/* Footer Strip: Members & CTA */}
                <div className="pt-5 mt-4 border-t-2 border-ink/10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-ink-soft text-xs sm:text-sm font-semibold">
                    <Users className="w-4 h-4 text-ink" weight="bold" />
                    <span>{club.followersCount || 42}+ Builders</span>
                  </div>

                  <Link to={`/clubs/${club.slug}`}>
                    <Button
                      variant="secondary"
                      size="compact"
                      className="text-xs font-bold gap-1 group-hover:bg-ink group-hover:text-paper transition-colors"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                    </Button>
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
