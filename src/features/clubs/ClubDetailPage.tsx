import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Users, ChevronRight, Check } from 'lucide-react'
import { useClub, useToggleFollowClub } from '@/hooks/useClubs'
import { useEvents } from '@/hooks/useEvents'
import { Button } from '@/design-system/primitives/Button'
import { EventCardModern } from '@/features/events/components/EventCardModern'
import { useToast } from '@/design-system/primitives/Toast'
import { Skeleton } from '@/design-system/primitives/Skeleton'
import { EmptyState } from '@/design-system/primitives/EmptyState'

export const ClubDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  const { data: club, isLoading } = useClub(slug || '')
  const { data: clubEventsData } = useEvents({ clubId: club?.id })
  const toggleFollowMutation = useToggleFollowClub()

  if (isLoading || !club) {
    return (
      <div className="app-container py-12 max-h-[240px] flex flex-col justify-center gap-4">
        <Skeleton height="h-8" width="w-1/2" />
        <Skeleton height="h-28" />
      </div>
    )
  }

  const events = clubEventsData?.items || []
  const upcomingEvents = events.filter((e) => e.status !== 'completed' && e.status !== 'archived')
  const completedEvents = events.filter((e) => e.status === 'completed')

  const handleToggleFollow = async () => {
    try {
      const isNowFollowed = await toggleFollowMutation.mutateAsync(club.id)
      toast({
        title: isNowFollowed ? `Following ${club.name}` : `Unfollowed ${club.name}`,
        message: isNowFollowed
          ? 'You will receive updates for newly announced events.'
          : 'You will no longer receive priority notifications.',
        type: 'info',
      })
    } catch {
      toast({ title: 'Action failed', type: 'error' })
    }
  }

  const color = club.color || '#C93E27'

  return (
    <div className="w-full bg-bg text-text pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-surface py-3">
        <div className="app-container flex items-center gap-2 text-small text-text-2">
          <Link to="/" className="hover:text-text transition-colors">Home</Link>
          <ChevronRight className="h-3.5 w-3.5 text-text-3" />
          <Link to="/clubs" className="hover:text-text transition-colors">Clubs</Link>
          <ChevronRight className="h-3.5 w-3.5 text-text-3" />
          <span className="text-text font-medium">{club.name}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-line bg-surface py-8">
        <div className="app-container flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* 10px Club Dot */}
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              />
              <span className="text-caption font-semibold text-text-2">
                {club.joinMode ? club.joinMode.replace('_', ' ') : 'Engineering Collective'}
              </span>
              <span className="text-line">·</span>
              <span className="text-caption text-text-3">
                {club.followersCount || 40} members
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-semibold text-text tracking-tight">
              {club.name}
            </h1>

            <p className="text-small text-text-2 max-w-2xl leading-relaxed">
              {club.about || club.whatWeDo || 'Specialized collegiate collective focused on hands-on engineering, open-source building, and competitions.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant={club.isFollowed ? 'secondary' : 'primary'}
              size="default"
              icon={club.isFollowed ? <Check className="h-4 w-4 text-success" /> : undefined}
              onClick={handleToggleFollow}
            >
              {club.isFollowed ? 'Following' : 'Follow club'}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="app-container py-8 space-y-10 sm:space-y-12">
        {/* Upcoming Events Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-xl font-semibold text-text">
              Upcoming events ({upcomingEvents.length})
            </h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <EmptyState
              title="No upcoming events"
              description={`${club.name} currently has no newly scheduled events.`}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {upcomingEvents.map((evt) => (
                <EventCardModern key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </section>

        {/* Past Exhibitions */}
        {completedEvents.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-xl font-semibold text-text">
                Past events & archives ({completedEvents.length})
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {completedEvents.map((evt) => (
                <EventCardModern key={evt.id} event={evt} />
              ))}
            </div>
          </section>
        )}

        {/* Club Gallery Photos */}
        {club.gallery && club.gallery.length > 0 && (
          <section className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-xl font-semibold text-text">
                Collective photo archives
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {club.gallery.map((photo, i) => (
                <div key={photo.id || i} className="aspect-[4/3] rounded-[10px] overflow-hidden bg-subtle border border-line">
                  <img src={photo.url} alt={photo.caption || ''} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
