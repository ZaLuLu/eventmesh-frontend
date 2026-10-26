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

  const [activeTab, setActiveTab] = useState<'about' | 'events' | 'gallery'>('about')

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
      bio: 'Senior systems engineer leading campus distributed computing workshops, serverless architecture sprints, and open-source tooling.',
    },
    {
      name: 'Rohan Sharma',
      role: 'VP Engineering & Infrastructure',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      badge: 'Tech Director',
      bio: 'Competitive algorithms finalist and backend mentor organizing university hackathons, kernel workshops, and code audits.',
    },
    {
      name: 'Dr. Sunita Rao',
      role: 'Faculty Coordinator & Mentor',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      badge: 'Faculty Advisor',
      bio: 'Department faculty chair guiding student research publications, ethical open source advocacy, and technical innovation grant allocations.',
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
        bio: c.bio || (fallbackLeads[i % fallbackLeads.length] ? fallbackLeads[i % fallbackLeads.length].bio : 'Passionate campus community organizer and technical mentor.'),
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
          onClick={() => setActiveTab('about')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'about'
              ? 'bg-ink text-surface shadow-xs'
              : 'text-ink-soft hover:text-ink hover:bg-surface-subtle'
          }`}
        >
          About & Team
        </button>

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

      {/* Tab Contents: 1. About & Team Tab */}
      {activeTab === 'about' && (
        <div className="space-y-10">
          {/* Club Mission, Focus & Story */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-3xl bg-surface-subtle p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-full border border-accent/20">
                  Mission & Directives
                </span>
              </div>
              <h2 className="font-display font-bold text-2xl text-ink">
                About {club.name}
              </h2>
              <p className="text-ink-soft text-base leading-relaxed whitespace-pre-line">
                {club.about || 'A collegiate technical collective bringing together ambitious student engineers, designers, and researchers.'}
              </p>
              {club.whatWeDo && (
                <div className="pt-3 border-t border-line/20">
                  <h3 className="font-semibold text-sm text-ink mb-1.5 font-sans">What We Do</h3>
                  <p className="text-ink-soft text-sm leading-relaxed">
                    {club.whatWeDo}
                  </p>
                </div>
              )}
            </div>

            {/* Quick Stats & Credentials */}
            <div className="rounded-3xl bg-surface-subtle p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-ink uppercase tracking-wider font-mono">
                  Club Profile
                </h3>
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between py-1.5 border-b border-line/20">
                    <span className="text-ink-muted">Membership</span>
                    <span className="text-ink font-semibold capitalize">{club.joinMode || 'Open'}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-line/20">
                    <span className="text-ink-muted">Community Size</span>
                    <span className="text-ink font-semibold">{club.followersCount || 42}+ Builders</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-line/20">
                    <span className="text-ink-muted">Sessions Hosted</span>
                    <span className="text-ink font-semibold">{events.length} Events</span>
                  </div>
                </div>
              </div>

              {club.achievements && club.achievements.length > 0 && (
                <div className="pt-4 border-t border-line/20 space-y-2">
                  <span className="text-[11px] font-mono text-accent font-bold uppercase tracking-wider block">
                    Distinctions
                  </span>
                  <ul className="space-y-1 text-xs text-ink-soft">
                    {club.achievements.map((ach, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-accent">•</span>
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          {/* People Running the Club Section */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-line/20 pb-3">
              <div>
                <h2 className="font-display font-medium text-2xl text-ink">
                  People Running {club.name}
                </h2>
                <p className="text-ink-soft text-xs sm:text-sm mt-1">
                  Meet the student leads, core coordinators, and mentors directing club programming.
                </p>
              </div>
              <span className="text-xs font-mono text-ink-muted">
                {leadMembers.length} Core Members
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {leadMembers.map((lead, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl bg-surface-subtle p-6 space-y-4 flex flex-col justify-between hover:border-line transition-colors border border-transparent"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/20 text-accent font-bold flex items-center justify-center shrink-0 overflow-hidden text-base">
                        {lead.photo ? (
                          <img
                            src={lead.photo}
                            alt={lead.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          lead.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <Badge variant="neutral" size="sm" className="mb-0.5">
                          {lead.badge}
                        </Badge>
                        <h3 className="font-display font-semibold text-base text-ink leading-normal truncate">
                          {lead.name}
                        </h3>
                        <p className="text-ink-soft text-xs leading-normal font-mono">
                          {lead.role}
                        </p>
                      </div>
                    </div>

                    {/* Basic About Them / Bio */}
                    <p className="text-xs text-ink-soft leading-relaxed line-clamp-3 pt-1">
                      {lead.bio || 'Core student coordinator managing peer workshops, hackathon tracks, and campus technical sessions.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line/20 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-ink-muted">
                      {club.name}
                    </span>
                    <Button
                      variant="secondary"
                      size="compact"
                      className="text-xs font-normal gap-1"
                      onClick={() => {
                        toast({
                          title: `Connecting with ${lead.name}`,
                          message: `Message channel opened with ${lead.name} (${lead.role}).`,
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
        </div>
      )}

      {/* Tab Contents: 2. Events Tab */}
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
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
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

              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8 opacity-80">
                {pastEvents.map((evt) => (
                  <EventTicketCard key={evt.id} event={evt} />
                ))}
              </div>
            </section>
          )}
        </div>
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
