// Hallmark macrostructure: Club Stage & Member Vault
import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Users,
  CaretRight,
  CalendarCheck,
  EnvelopeSimple,
} from '@phosphor-icons/react'
import { useClub, useToggleFollowClub } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { PageShell } from '@/design-system/layout/PageShell'
import { Badge } from '@/design-system/primitives/Badge'
import { Button } from '@/design-system/primitives/Button'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { BellToggle } from '@/design-system/micro/BellToggle'
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
        <div className="h-64 rounded-3xl bg-surface-subtle animate-pulse" />
      </PageShell>
    )
  }

  const events = clubEventsData?.items || []
  const upcomingEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'archived')
  const pastEvents = events.filter((e) => e.status === 'completed')

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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm font-normal text-ink-soft">
        <Link to="/" className="hover:text-ink transition-colors">Home</Link>
        <CaretRight className="w-3.5 h-3.5 text-ink-soft/40" />
        <Link to="/clubs" className="hover:text-ink transition-colors">Clubs</Link>
        <CaretRight className="w-3.5 h-3.5 text-ink-soft/40" />
        <span className="text-ink font-medium truncate">{club.name}</span>
      </nav>

      {/* Header Band */}
      <header className="relative rounded-3xl bg-surface-subtle p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm" className="uppercase tracking-wider text-[10px]">
                Official Collective
              </Badge>
              <Badge variant="iris" size="sm">
                {club.joinMode ? club.joinMode.replace('_', ' ') : 'Open Membership'}
              </Badge>
            </div>

            <h1 className="font-display font-semibold text-3xl sm:text-5xl text-ink tracking-tight leading-none">
              {club.name}
            </h1>

            <p className="text-ink-soft text-base leading-relaxed font-normal">
              {club.about || club.whatWeDo || 'Collegiate builder community focused on technical workshops, hackathons, and open projects.'}
            </p>

            {/* Details Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono text-ink-soft">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" weight="bold" />
                {club.followersCount || 42}+ Members
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CalendarCheck className="w-3.5 h-3.5 text-primary" weight="bold" />
                {events.length} Events Total
              </span>
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
      </header>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-line/30 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('events')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'events'
              ? 'bg-ink text-surface shadow-xs'
              : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
          }`}
        >
          Events ({events.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'team'
              ? 'bg-ink text-surface shadow-xs'
              : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
          }`}
        >
          Organizers ({leadMembers.length})
        </button>

        {club.gallery && club.gallery.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-ink text-surface shadow-xs'
                : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
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
              <div className="rounded-3xl bg-surface-subtle p-8 sm:p-12 text-center space-y-3">
                <p className="font-display font-medium text-lg text-ink">
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
              <div className="flex items-center justify-between border-b border-line/20 pb-3">
                <h2 className="font-display font-medium text-lg text-ink-soft">
                  Past Events ({pastEvents.length})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 opacity-80">
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
          <div className="border-b border-line/20 pb-3">
            <h2 className="font-display font-medium text-xl text-ink">
              Core Leadership & Mentors
            </h2>
            <p className="text-ink-soft text-xs mt-1">
              Student coordinators and faculty mentors running {club.name}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {leadMembers.map((lead, idx) => (
              <div
                key={idx}
                className="rounded-3xl bg-surface-subtle p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={lead.photo}
                    alt={lead.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="space-y-1">
                    <Badge variant="neutral" size="sm" className="mb-1">
                      {lead.badge}
                    </Badge>
                    <h3 className="font-display font-medium text-base text-ink leading-snug">
                      {lead.name}
                    </h3>
                    <p className="text-ink-soft text-xs leading-normal">
                      {lead.role}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-line/20 flex items-center justify-between">
                  <span className="text-xs font-mono text-ink-soft">
                    {club.name} Lead
                  </span>
                  <Button
                    variant="secondary"
                    size="compact"
                    className="text-xs font-normal gap-1"
                    onClick={() => {
                      toast({
                        title: `Contacting ${lead.name}`,
                        message: `Connection channel opened with ${lead.name}.`,
                        type: 'info',
                      })
                    }}
                  >
                    <EnvelopeSimple className="w-3.5 h-3.5" />
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
          <div className="border-b border-line/20 pb-3">
            <h2 className="font-display font-medium text-xl text-ink">
              Photo Moments
            </h2>
            <p className="text-ink-soft text-xs mt-1">
              Snapshots captured across hackathons and workshops
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {club.gallery.map((photo, i) => (
              <div
                key={photo.id || i}
                className="rounded-2xl bg-surface-subtle p-3 space-y-2"
              >
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-subtle">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Club photo'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {photo.caption && (
                  <p className="text-xs text-ink-soft px-1 line-clamp-2">
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
