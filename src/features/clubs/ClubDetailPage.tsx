// Hallmark macrostructure: Profile-Club
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Users,
  CaretRight,
  Sparkle,
  CalendarCheck,
  EnvelopeSimple,
  Image as ImageIcon,
  CheckCircle,
} from '@phosphor-icons/react'
import { useClub, useToggleFollowClub } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { PageShell } from '@/design-system/layout/PageShell'
import { Sticker } from '@/design-system/primitives/Sticker'
import { Button } from '@/design-system/primitives/Button'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { BellToggle } from '@/design-system/micro/BellToggle'
import { getClubTheme } from '@/design-system/clubColors'
import { useToast } from '@/design-system/primitives/Toast'

export const ClubDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  const { data: club, isLoading } = useClub(slug || '')
  const { data: clubEventsData } = useEvents({ clubId: club?.id })
  const toggleFollowMutation = useToggleFollowClub()

  const [activeTab, setActiveTab] = useState<'events' | 'team' | 'gallery'>('events')

  if (isLoading || !club) {
    return (
      <PageShell className="py-12">
        <div className="h-64 rounded-[20px] bg-paper-2 border-2 border-ink animate-pulse shadow-[4px_4px_0_#151130]" />
      </PageShell>
    )
  }

  const events = clubEventsData?.items || []
  const upcomingEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'archived')
  const pastEvents = events.filter((e) => e.status === 'completed')

  const theme = getClubTheme(club.name)

  const fallbackLeads = [
    {
      name: 'Aditya Narayan',
      role: 'President & System Architect',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      badge: 'Club Lead',
    },
    {
      name: 'Rohan Sharma',
      role: 'VP Engineering & Infrastructure',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      badge: 'Tech Director',
    },
    {
      name: 'Dr. Sunita Rao',
      role: 'Faculty Coordinator & Mentor',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      badge: 'Faculty Advisor',
    },
  ]

  const existingCoordinators = [
    ...(club.studentCoordinators || []),
    ...(club.coordinators || []),
  ]

  const leadMembers = existingCoordinators.length > 0
    ? existingCoordinators.map((c, i) => ({
        name: c.name,
        role: c.role || (i === 0 ? 'Lead Organizer' : 'Core Coordinator'),
        photo: c.photo || fallbackLeads[i % fallbackLeads.length].photo,
        badge: i === 0 ? 'Lead Organizer' : i === 1 ? 'Technical VP' : 'Core Committee',
      }))
    : fallbackLeads

  const handleToggleFollow = async () => {
    try {
      const isNowFollowed = await toggleFollowMutation.mutateAsync(club.id)
      toast({
        title: isNowFollowed ? `Subscribed to ${club.name}` : `Unfollowed ${club.name}`,
        message: isNowFollowed
          ? 'You will receive updates for newly announced events and workshops.'
          : 'You will no longer receive priority notifications.',
        type: 'info',
      })
    } catch {
      toast({ title: 'Action failed', type: 'error' })
    }
  }

  return (
    <PageShell className="py-6 sm:py-10 space-y-8">
      {/* Short Sentence-Case Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-ink-soft">
        <Link to="/" className="hover:text-ink transition-colors">Home</Link>
        <CaretRight className="w-3.5 h-3.5 text-ink-soft/60" weight="bold" />
        <Link to="/clubs" className="hover:text-ink transition-colors">Clubs</Link>
        <CaretRight className="w-3.5 h-3.5 text-ink-soft/60" weight="bold" />
        <span className="text-ink truncate">{club.name}</span>
      </nav>

      {/* Header Band in Club Theme Color */}
      <header className="relative rounded-[24px] border-2 border-ink bg-card shadow-[6px_6px_0_#151130] overflow-hidden">
        {/* Top Header Theme Color Strip */}
        <div
          className="h-16 sm:h-24 border-b-2 border-ink w-full relative"
          style={{ backgroundColor: theme.hex }}
        >
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Sticker color={theme.token} size="sm" className="font-bold uppercase tracking-wider text-[11px] bg-card text-ink">
              Official Collective
            </Sticker>
          </div>
        </div>

        {/* Club Details Block */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-ink tracking-tight leading-none">
                {club.name}
              </h1>

              <p className="text-ink-soft text-base sm:text-lg leading-relaxed">
                {club.about || club.whatWeDo || 'Collegiate builder community focused on technical workshops, hackathons, and open projects.'}
              </p>

              {/* Sticker Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                <Sticker color={theme.token} size="md" icon={<Users className="w-4 h-4" weight="bold" />}>
                  {club.followersCount || 42}+ Members
                </Sticker>
                <Sticker color="mustard" size="md" icon={<CalendarCheck className="w-4 h-4" weight="bold" />}>
                  {events.length} Events Total
                </Sticker>
                <Sticker color="mint" size="md">
                  {club.joinMode ? club.joinMode.replace('_', ' ') : 'Open Membership'}
                </Sticker>
              </div>
            </div>

            {/* Subscribe Action */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <BellToggle
                pressed={Boolean(club.isFollowed)}
                onChange={handleToggleFollow}
                onLabel="Subscribed"
                offLabel="Follow Club"
                size="md"
                badge={true}
                count={club.followersCount || 42}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-2 border-b-2 border-ink/15 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === 'events'
              ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
              : 'bg-card border-2 border-ink/20 text-ink-soft hover:text-ink hover:border-ink'
          }`}
        >
          Events ({events.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
            activeTab === 'team'
              ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
              : 'bg-card border-2 border-ink/20 text-ink-soft hover:text-ink hover:border-ink'
          }`}
        >
          Organizers ({leadMembers.length})
        </button>

        {club.gallery && club.gallery.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              activeTab === 'gallery'
                ? 'bg-ink text-paper shadow-[2px_2px_0_#151130]'
                : 'bg-card border-2 border-ink/20 text-ink-soft hover:text-ink hover:border-ink'
            }`}
          >
            Gallery ({club.gallery.length})
          </button>
        )}
      </div>

      {/* Tab Contents */}
      {activeTab === 'events' && (
        <div className="space-y-10">
          {/* Upcoming Events */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3">
              <h2 className="font-display font-extrabold text-2xl text-ink">
                Upcoming Events ({upcomingEvents.length})
              </h2>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-[20px] border-2 border-ink bg-card p-8 sm:p-12 text-center space-y-3 shadow-[4px_4px_0_#151130]">
                <p className="font-display font-bold text-xl text-ink">
                  No upcoming events right now
                </p>
                <p className="text-ink-soft text-sm max-w-md mx-auto">
                  {club.name} is currently planning their next workshop or hackathon. Follow the club above to get notified when seats open.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {upcomingEvents.map((evt) => (
                  <EventTicketCard key={evt.id} event={evt} />
                ))}
              </div>
            )}
          </section>

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b-2 border-ink/10 pb-3">
                <h2 className="font-display font-bold text-xl text-ink-soft">
                  Past Events ({pastEvents.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 opacity-90">
                {pastEvents.map((evt) => (
                  <EventTicketCard key={evt.id} event={evt} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Team / Organizers Tab */}
      {activeTab === 'team' && (
        <section className="space-y-6">
          <div className="border-b-2 border-ink/10 pb-3">
            <h2 className="font-display font-extrabold text-2xl text-ink">
              Core Leadership & Mentors
            </h2>
            <p className="text-ink-soft text-sm mt-1">
              Student coordinators and faculty mentors running {club.name}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {leadMembers.map((lead, idx) => (
              <div
                key={idx}
                className="rounded-[20px] border-2 border-ink bg-card p-6 shadow-[4px_4px_0_#151130] space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={lead.photo}
                    alt={lead.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-ink shadow-[2px_2px_0_#151130] flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="space-y-1">
                    <Sticker color="mint" size="sm" className="font-bold text-[11px] mb-1">
                      {lead.badge}
                    </Sticker>
                    <h3 className="font-display font-bold text-lg text-ink leading-snug">
                      {lead.name}
                    </h3>
                    <p className="text-ink-soft text-xs leading-normal">
                      {lead.role}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-ink/10 flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-ink-soft">
                    {club.name} Lead
                  </span>
                  <Button
                    variant="secondary"
                    size="compact"
                    className="text-xs font-bold gap-1"
                    onClick={() => {
                      toast({
                        title: `Contacting ${lead.name}`,
                        message: `Connection channel opened with ${lead.name}.`,
                        type: 'info',
                      })
                    }}
                  >
                    <EnvelopeSimple className="w-3.5 h-3.5" weight="bold" />
                    <span>Connect</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && club.gallery && (
        <section className="space-y-6">
          <div className="border-b-2 border-ink/10 pb-3">
            <h2 className="font-display font-extrabold text-2xl text-ink">
              Photo Moments
            </h2>
            <p className="text-ink-soft text-sm mt-1">
              Snapshots captured across hackathons and workshops
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {club.gallery.map((photo, i) => (
              <div
                key={photo.id || i}
                className="rounded-[16px] border-2 border-ink bg-card p-3 shadow-[4px_4px_0_#151130] space-y-2"
              >
                <div className="aspect-[4/3] rounded-[10px] overflow-hidden border border-ink/20 bg-paper-2">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Club photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {photo.caption && (
                  <p className="text-xs font-medium text-ink-soft px-1 line-clamp-2">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
