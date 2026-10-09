import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  Calendar,
  ArrowRight,
  Megaphone,
} from 'lucide-react'
import { useEvents, useFeaturedEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { Event } from '@/api'
import { formatDate } from '@/lib/dates'
import { HeroBillboard } from './components/HeroBillboard'
import { FilterBar } from './components/FilterBar'
import { ClubSpotlightRow } from './components/ClubSpotlightRow'
import { EventCardModern } from './components/EventCardModern'

export const HomePage: React.FC = () => {
  const { data: eventsData } = useEvents()
  const { data: featured = [] } = useFeaturedEvents()
  const { data: clubs = [] } = useClubs()
  const { data: announcements = [] } = useAnnouncements()

  const allEvents: Event[] = useMemo(() => eventsData?.items || [], [eventsData?.items])

  // Filter state for quick filters
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL')
  const [freeOnly, setFreeOnly] = useState(false)
  const [onlineOnly, setOnlineOnly] = useState(false)

  // Top trending events (ranked by registrations)
  const trendingEvents = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => (b.capacity - b.seatsLeft) - (a.capacity - a.seatsLeft))
      .slice(0, 4)
  }, [allEvents])

  // Upcoming events
  const upcomingEvents = useMemo(() => {
    return allEvents.slice(0, 8)
  }, [allEvents])

  // Active filtered events if user selects filter chips
  const isFilteringActive =
    selectedCategory !== 'ALL' ||
    selectedDateFilter !== 'ALL' ||
    freeOnly ||
    onlineOnly

  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt: Event) => {
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false
      }
      if (freeOnly && (evt.features?.paid || (evt.isFree === false))) {
        return false
      }
      if (onlineOnly && !evt.isOnline && !evt.venue?.name?.toLowerCase().includes('online')) {
        return false
      }
      if (selectedDateFilter === 'TODAY') {
        const todayStr = new Date().toISOString().slice(0, 10)
        if (!evt.startsAt.startsWith(todayStr)) return false
      }
      return true
    })
  }, [allEvents, selectedCategory, freeOnly, onlineOnly, selectedDateFilter])

  return (
    <div className="w-full bg-bg text-text">
      {/* 1. Hero: max 440px desktop, auto on mobile */}
      <HeroBillboard events={featured.length > 0 ? featured : allEvents.slice(0, 4)} />

      {/* 2. Sticky Filter Row (follows immediately with 16px gap) */}
      <div className="mt-4">
        <FilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedDateFilter={selectedDateFilter}
          onSelectDateFilter={setSelectedDateFilter}
          freeOnly={freeOnly}
          onToggleFree={() => setFreeOnly(!freeOnly)}
          onlineOnly={onlineOnly}
          onToggleOnline={() => setOnlineOnly(!onlineOnly)}
        />
      </div>

      {/* Main Content Area Container: max 1280px, responsive padding */}
      <div className="app-container py-10 sm:py-12 lg:py-14 space-y-10 sm:space-y-12 lg:space-y-14">
        {isFilteringActive ? (
          /* Filtered Results View */
          <section className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
                  Matching events ({filteredEvents.length})
                </h2>
                <p className="text-small text-text-2">
                  Showing events filtered by your selected criteria
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('ALL')
                  setSelectedDateFilter('ALL')
                  setFreeOnly(false)
                  setOnlineOnly(false)
                }}
                className="text-small font-semibold text-accent hover:underline"
              >
                Reset filters
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-12 px-4 rounded-[14px] bg-surface border border-line text-center">
                <p className="text-small text-text-2 mb-3">
                  No events match the selected filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('ALL')
                    setSelectedDateFilter('ALL')
                    setFreeOnly(false)
                    setOnlineOnly(false)
                  }}
                  className="text-small font-semibold text-accent hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredEvents.map((evt: Event) => (
                  <EventCardModern key={evt.id} event={evt} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* 3. Section: Trending this week (4 cols at 1280+, 3 at 1024, 2 at 640, 1 rail <640) */}
            <section className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
                      Trending this week
                    </h2>
                    <p className="text-small text-text-2">
                      Most popular registrations across campus collectives
                    </p>
                  </div>
                </div>

                <Link
                  to="/explore?sort=-registeredCount"
                  className="text-small font-semibold text-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>See all</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {trendingEvents.map((evt, idx) => (
                  <EventCardModern key={evt.id} event={evt} rankNumber={idx + 1} />
                ))}
              </div>
            </section>

            {/* 4. Section: Upcoming events */}
            <section className="w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-text tracking-tight">
                      Upcoming events
                    </h2>
                    <p className="text-small text-text-2">
                      Next sessions, workshops, and competitions on the calendar
                    </p>
                  </div>
                </div>

                <Link
                  to="/explore"
                  className="text-small font-semibold text-accent hover:underline inline-flex items-center gap-1"
                >
                  <span>Explore all</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {upcomingEvents.map((evt) => (
                  <EventCardModern key={evt.id} event={evt} />
                ))}
              </div>
            </section>

            {/* 5. Section: Clubs (compact row of club tiles with dot, name, event count) */}
            <ClubSpotlightRow clubs={clubs} />

            {/* 6. Section: Announcements (compact list) */}
            {announcements.length > 0 && (
              <section className="w-full bg-surface border border-line rounded-panel p-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <h2 className="text-xl font-semibold text-text tracking-tight">
                        Announcements & notices
                      </h2>
                      <p className="text-small text-text-2">
                        Official broadcasts from organizers and academic administration
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/announcements"
                    className="text-small font-semibold text-accent hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                {/* Compact list of announcements */}
                <div className="divide-y divide-line">
                  {announcements.slice(0, 3).map((item) => (
                    <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <div className="min-w-0 pr-4">
                        <Link
                          to="/announcements"
                          className="font-semibold text-small text-text hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="text-caption text-text-2 line-clamp-1 mt-0.5">
                          {item.body}
                        </p>
                      </div>
                      <span className="text-caption text-text-3 flex-shrink-0">
                        {formatDate(item.publishedAt, 'MMM d, yyyy')}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
