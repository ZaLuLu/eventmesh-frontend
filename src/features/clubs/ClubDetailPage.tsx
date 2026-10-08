import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Calendar, Award, Image as ImageIcon, Heart, ArrowUpRight } from 'lucide-react'
import { useClub, useToggleFollowClub } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { Band } from '@/design-system/primitives/Band'
import { IndexRow } from '@/design-system/primitives/IndexRow'
import { EventTheme } from '@/design-system/EventTheme'
import { formatDate } from '@/lib/dates'
import { useToast } from '@/design-system/primitives/Toast'

export const ClubDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  const { data: club, isLoading } = useClub(slug || '')
  const { data: clubEventsData } = useEvents({ clubId: club?.id })
  const toggleFollowMutation = useToggleFollowClub()

  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  if (isLoading || !club) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <span className="font-mono text-xs uppercase tracking-widecaps text-ink-60">
          Loading Club Dossier...
        </span>
      </div>
    )
  }

  const events = clubEventsData?.items || []
  const upcomingEvents = events.filter((e) => e.status === 'published' || e.status === 'live')
  const completedEvents = events.filter((e) => e.status === 'completed')

  const handleToggleFollow = async () => {
    try {
      const isNowFollowed = await toggleFollowMutation.mutateAsync(club.id)
      toast({
        title: isNowFollowed ? `Following ${club.name}` : `Unfollowed ${club.name}`,
        message: isNowFollowed
          ? 'You will receive priority dispatches for new symposiums and registrations.'
          : 'You will no longer receive priority updates from this collective.',
        type: 'info',
      })
    } catch {
      toast({ title: 'Action Failed', type: 'error' })
    }
  }

  return (
    <EventTheme color={club.color}>
      <div className="w-full bg-paper text-ink min-h-screen">
        {/* Header Hero */}
        <section className="pt-10 sm:pt-14 border-b border-ink-15">
          <div className="px-[4vw] mb-4 flex items-center justify-between font-mono text-xs uppercase text-ink-60">
            <Link to="/clubs" className="hover:text-ink">
              ← Back to All Clubs
            </Link>
            <span>FEDERATION MEMBER · {club.slug.toUpperCase()}</span>
          </div>

          <div className="px-[4vw] pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase text-ink-60 font-semibold">
                <span
                  className="inline-block h-3 w-3"
                  style={{ backgroundColor: club.color }}
                />
                <span>{club.followersCount} Followers</span>
                <span>·</span>
                <span>Join Mode: {club.joinMode}</span>
              </div>
              <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
                {club.name}
              </h1>
            </div>

            <div>
              <Button
                variant={club.isFollowed ? 'secondary' : 'primary'}
                size="md"
                onClick={handleToggleFollow}
                loading={toggleFollowMutation.isPending}
              >
                {club.isFollowed ? '✓ Following Collective' : '+ Join / Follow Club'}
              </Button>
            </div>
          </div>

          {/* Signature Color Band */}
          <Band
            color={club.color}
            chipLabel={`IDENTITY · ${club.name.toUpperCase()}`}
            tagline={club.whatWeDo}
            metaRight={`${upcomingEvents.length} UPCOMING SYMPOSIUMS`}
            height="h-20 sm:h-24"
          />
        </section>

        {/* Dossier Content Grid */}
        <section className="px-[4vw] py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left 8 Cols: About, What We Do, Upcoming, Previous, Gallery */}
            <div className="lg:col-span-8 space-y-14">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
                  Curatorial Statement & Scope
                </span>
                <p className="font-body text-xl text-ink leading-relaxed">
                  {club.about}
                </p>
              </div>

              <div className="border-t border-ink-15 pt-8">
                <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
                  Activities & Directives
                </span>
                <p className="font-body text-base text-ink leading-relaxed">
                  {club.whatWeDo}
                </p>
              </div>

              {/* Upcoming Events by this club */}
              <div className="border-t border-ink-15 pt-8">
                <div className="flex items-baseline justify-between mb-6">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block">
                      Active Programming
                    </span>
                    <h3 className="font-display text-3xl uppercase text-ink">
                      Upcoming Events ({upcomingEvents.length})
                    </h3>
                  </div>
                </div>

                {upcomingEvents.length === 0 ? (
                  <p className="font-mono text-xs uppercase text-ink-60 py-4 border-t border-b border-ink-15">
                    No active upcoming events scheduled currently.
                  </p>
                ) : (
                  <div className="border-t border-ink-15">
                    {upcomingEvents.map((evt, idx) => (
                      <IndexRow
                        key={evt.id}
                        id={evt.id}
                        slug={evt.slug}
                        title={evt.title}
                        category={evt.category}
                        organizerName={club.name}
                        organizerColor={club.color}
                        dateDisplay={formatDate(evt.startsAt)}
                        venueName={evt.venue.name}
                        status={evt.status}
                        indexNumber={idx + 1}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Previous Completed Events */}
              {completedEvents.length > 0 && (
                <div className="border-t border-ink-15 pt-8">
                  <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
                    Concluded History
                  </span>
                  <h3 className="font-display text-3xl uppercase text-ink mb-6">
                    Previous Exhibitions ({completedEvents.length})
                  </h3>
                  <div className="border-t border-ink-15">
                    {completedEvents.map((evt, idx) => (
                      <IndexRow
                        key={evt.id}
                        id={evt.id}
                        slug={evt.slug}
                        title={evt.title}
                        category={evt.category}
                        organizerName={club.name}
                        organizerColor={club.color}
                        dateDisplay={formatDate(evt.startsAt)}
                        venueName={evt.venue.name}
                        status="completed"
                        indexNumber={idx + 1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Section */}
              {club.gallery.length > 0 && (
                <div className="border-t border-ink-15 pt-8">
                  <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-4">
                    Documentary Photography Archive
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {club.gallery.map((g) => (
                      <div
                        key={g.id}
                        onClick={() => setActivePhoto(g.url)}
                        className="group border border-ink-15 overflow-hidden cursor-pointer bg-paper-deep"
                      >
                        <img
                          src={g.url}
                          alt={g.caption || 'Exhibition photo'}
                          className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {g.caption && (
                          <p className="p-3 bg-paper font-mono text-[10px] uppercase text-ink-60 border-t border-ink-15">
                            {g.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Cols: Leadership, Achievements */}
            <div className="lg:col-span-4 space-y-8">
              {/* Coordinators Box */}
              <div className="bg-paper border-2 border-ink p-6 space-y-6">
                <span className="font-mono text-[10px] uppercase tracking-widecaps text-ink-60 block">
                  Club Directorate
                </span>

                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-[11px] uppercase text-ink-60 font-semibold block mb-2">
                      Faculty / Lead Coordinators
                    </span>
                    {club.coordinators.map((c, i) => (
                      <div key={i} className="py-2 border-b border-ink-15">
                        <p className="font-body text-sm font-bold uppercase text-ink">{c.name}</p>
                        <p className="font-mono text-[11px] text-ink-60 uppercase">{c.role}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <span className="font-mono text-[11px] uppercase text-ink-60 font-semibold block mb-2">
                      Student Organizing Leads
                    </span>
                    {club.studentCoordinators.map((c, i) => (
                      <div key={i} className="py-2 border-b border-ink-15 last:border-b-0">
                        <p className="font-body text-sm font-bold uppercase text-ink">{c.name}</p>
                        <p className="font-mono text-[11px] text-ink-60 uppercase">{c.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Achievements Box */}
              {club.achievements.length > 0 && (
                <div className="bg-paper-deep/30 border border-ink-15 p-6 space-y-4">
                  <span className="font-mono text-[10px] uppercase tracking-widecaps text-ink-60 block">
                    Distinctions & Laurels
                  </span>
                  <ul className="space-y-3">
                    {club.achievements.map((ach, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 font-body text-xs text-ink">
                        <Award className="h-4 w-4 text-ink flex-shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Photo Lightbox */}
        {activePhoto && (
          <div
            onClick={() => setActivePhoto(null)}
            className="fixed inset-0 z-50 bg-ink/90 flex items-center justify-center p-4 cursor-pointer"
          >
            <img
              src={activePhoto}
              alt="Expanded photo"
              className="max-w-4xl max-h-[85vh] object-contain border-2 border-paper"
            />
          </div>
        )}
      </div>
    </EventTheme>
  )
}
