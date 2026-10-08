import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, Calendar, Award, Image as ImageIcon, ChevronRight, Check } from 'lucide-react'
import { useClub, useToggleFollowClub } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { EventCardModern } from '@/features/events/components/EventCardModern'
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
      <div className="min-h-screen bg-canvas flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-md-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Loading Club Information...
          </span>
        </div>
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
          ? 'You will receive notifications for newly announced events and workshops.'
          : 'You will no longer receive priority updates from this collective.',
        type: 'info',
      })
    } catch {
      toast({ title: 'Action Failed', type: 'error' })
    }
  }

  return (
    <div className="w-full bg-canvas text-md-on-surface min-h-screen pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-md-primary">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/clubs" className="hover:text-md-primary">
              Clubs
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-800 font-semibold">{club.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-white border-b border-[#DADCE0] py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <div
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-xs flex-shrink-0"
              style={{ backgroundColor: club.color || '#1A73E8' }}
            >
              {club.name.slice(0, 3).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-md-primary-container text-md-primary">
                  {club.followersCount} Community Members
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F3F4] text-slate-600">
                  Join: {club.joinMode}
                </span>
              </div>

              <h1 className="font-display font-bold text-2xl sm:text-4xl text-slate-900 tracking-tight">
                {club.name}
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                {club.whatWeDo}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Button
              variant={club.isFollowed ? 'secondary' : 'primary'}
              size="md"
              onClick={handleToggleFollow}
              loading={toggleFollowMutation.isPending}
            >
              {club.isFollowed ? '✓ Following Club' : '+ Follow Club'}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Left 8 Cols: About, Events, Gallery */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Card */}
            <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-4">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                About the Collective
              </h2>
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-body">
                {club.about}
              </p>
            </div>

            {/* Upcoming Events */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Upcoming Events ({upcomingEvents.length})
                </h2>
              </div>

              {upcomingEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {upcomingEvents.map((evt) => (
                    <EventCardModern key={evt.id} event={evt} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-[#DADCE0] bg-white text-center text-slate-500 text-xs">
                  No upcoming events scheduled at this moment. Follow this club to receive announcements!
                </div>
              )}
            </div>

            {/* Completed Events */}
            {completedEvents.length > 0 && (
              <div className="space-y-4 pt-4">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Past Events & Highlights ({completedEvents.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {completedEvents.map((evt) => (
                    <EventCardModern key={evt.id} event={evt} />
                  ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {club.gallery && club.gallery.length > 0 && (
              <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle space-y-4">
                <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
                  Activities Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {club.gallery.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setActivePhoto(g.url)}
                      className="group rounded-xl overflow-hidden cursor-pointer border border-[#DADCE0] bg-slate-100"
                    >
                      <img
                        src={g.url}
                        alt={g.caption || 'Club photo'}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 4 Cols: Leadership, Achievements */}
          <div className="lg:col-span-4 space-y-6">
            {/* Leadership Box */}
            <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-subtle space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-900">
                Organizing Leads & Mentors
              </h3>

              <div className="space-y-4">
                {club.coordinators && club.coordinators.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-normal block mb-2">
                      Advisors & Mentors
                    </span>
                    {club.coordinators.map((c, i) => (
                      <div key={i} className="py-2 border-b border-[#DADCE0] last:border-b-0">
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.role}</p>
                      </div>
                    ))}
                  </div>
                )}

                {club.studentCoordinators && club.studentCoordinators.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-normal block mb-2">
                      Lead Coordinators
                    </span>
                    {club.studentCoordinators.map((c, i) => (
                      <div key={i} className="py-2 border-b border-[#DADCE0] last:border-b-0">
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-500">{c.role}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Achievements Box */}
            {club.achievements && club.achievements.length > 0 && (
              <div className="rounded-2xl border border-[#DADCE0] bg-white p-6 shadow-subtle space-y-3">
                <h3 className="font-display font-bold text-lg text-slate-900">
                  Key Milestones & Awards
                </h3>
                <ul className="space-y-2.5">
                  {club.achievements.map((ach, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                      <Award className="h-4 w-4 text-md-primary flex-shrink-0 mt-0.5" />
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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <img
            src={activePhoto}
            alt="Expanded photo"
            className="max-w-4xl max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  )
}
