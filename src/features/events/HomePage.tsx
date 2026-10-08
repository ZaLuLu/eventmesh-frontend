import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Flame,
  Trophy,
  GraduationCap,
  Sparkles,
  Calendar,
  Users,
  Award,
  ArrowRight,
  Zap,
} from 'lucide-react'
import { useEvents, useFeaturedEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { Event } from '@/api'
import { HeroBillboard } from './components/HeroBillboard'
import { FilterBar } from './components/FilterBar'
import { NetflixShelf } from './components/NetflixShelf'
import { ClubSpotlightRow } from './components/ClubSpotlightRow'
import { EventCardModern } from './components/EventCardModern'
import { Button } from '@/design-system/primitives/Button'
import { AmbientSilkCanvas } from '@/design-system/AmbientSilkCanvas'

export const HomePage: React.FC = () => {
  const { data: eventsData } = useEvents()
  const { data: featured = [] } = useFeaturedEvents()
  const { data: clubs = [] } = useClubs()
  const { data: announcements = [] } = useAnnouncements()

  const allEvents: Event[] = eventsData?.items || []

  // Filter state for BookMyShow quick filters
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL')
  const [onlyWithCertificates, setOnlyWithCertificates] = useState(false)

  // Top 10 ranked events for Netflix Top 10 shelf
  const top10Events = useMemo(() => {
    return [...allEvents]
      .sort((a, b) => (b.capacity - b.seatsLeft) - (a.capacity - a.seatsLeft))
      .slice(0, 10)
  }, [allEvents])

  // Hackathons shelf
  const hackathons = useMemo(() => {
    return allEvents.filter(
      (e) => e.category === 'HACKATHON' || e.category === 'COMPETITION'
    )
  }, [allEvents])

  // Workshops shelf
  const workshops = useMemo(() => {
    return allEvents.filter(
      (e) => e.category === 'WORKSHOP' || Boolean(e.certificateInfo)
    )
  }, [allEvents])

  // Weekend / Upcoming shelf
  const upcomingEvents = useMemo(() => {
    return allEvents.slice(0, 8)
  }, [allEvents])

  // Active filtered events if user selects filter chips
  const isFilteringActive =
    selectedCategory !== 'ALL' ||
    selectedDateFilter !== 'ALL' ||
    onlyWithCertificates

  const filteredEvents = useMemo(() => {
    return allEvents.filter((evt: Event) => {
      if (selectedCategory !== 'ALL' && evt.category !== selectedCategory) {
        return false
      }
      if (onlyWithCertificates && !evt.certificateInfo) {
        return false
      }
      return true
    })
  }, [allEvents, selectedCategory, onlyWithCertificates])

  return (
    <div className="w-full flex flex-col bg-canvas text-ink min-h-screen relative overflow-hidden">
      {/* Subtle Living Ambient Silk Shader in Google M3 Tones */}
      <AmbientSilkCanvas
        opacity={0.45}
        speed={0.06}
        className="h-[520px] sm:h-[620px] pointer-events-none"
      />

      {/* ==============================================================
          1. CINEMATIC AMBIENT LIGHT HERO BILLBOARD (Netflix / BookMyShow)
          ============================================================== */}
      <HeroBillboard events={featured.length > 0 ? featured : allEvents.slice(0, 4)} />

      {/* ==============================================================
          2. STICKY QUICK FILTER BAR (BookMyShow / District)
          ============================================================== */}
      <FilterBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedDateFilter={selectedDateFilter}
        onSelectDateFilter={setSelectedDateFilter}
        onlyWithCertificates={onlyWithCertificates}
        onToggleCertificates={() => setOnlyWithCertificates(!onlyWithCertificates)}
      />

      {/* ==============================================================
          3. DYNAMIC DISCOVERY CONTENT
          ============================================================== */}
      {isFilteringActive ? (
        /* Filtered Grid View when User Interacts with Quick Filters */
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900 tracking-tight">
                Matching Events ({filteredEvents.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Filtered by your active preferences
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory('ALL')
                setSelectedDateFilter('ALL')
                setOnlyWithCertificates(false)
              }}
              className="text-xs font-semibold text-md-primary hover:underline"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((evt: Event) => (
              <EventCardModern key={evt.id} event={evt} />
            ))}
          </div>
        </section>
      ) : (
        /* Default Thematic Shelves Experience */
        <div className="space-y-4 sm:space-y-8 pb-16">
          {/* Shelf 1: 🔥 TOP 10 TRENDING IN YOUR COMMUNITY */}
          <NetflixShelf
            title="Top 10 Trending This Week"
            subtitle="Most registered hackathons, talks & summits across all clubs"
            icon={<Flame className="h-5 w-5 text-md-primary" />}
            events={top10Events}
            isRanked={true}
            exploreLink="/explore?sort=-registeredCount"
          />

          {/* Shelf 2: 🎟️ HAPPENING THIS WEEKEND */}
          <NetflixShelf
            title="Happening This Weekend"
            subtitle="Live hands-on sessions and meetups ready for booking"
            icon={<Calendar className="h-5 w-5 text-md-primary" />}
            events={upcomingEvents}
            exploreLink="/explore?status=PUBLISHED"
          />

          {/* Shelf 3: 🎪 EXPLORE BY TECHNICAL COLLECTIVE (9 Clubs) */}
          <ClubSpotlightRow clubs={clubs} />

          {/* Shelf 4: 🏆 FLAGSHIP HACKATHONS & COMPETITIONS */}
          <NetflixShelf
            title="Major Hackathons & Competitions"
            subtitle="36-hour buildathons with mentorship and prize pools"
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
            events={hackathons}
            exploreLink="/explore?category=HACKATHON"
          />

          {/* Shelf 5: 🎓 CERTIFIED MASTERCLASSES & WORKSHOPS */}
          <NetflixShelf
            title="Certified Masterclasses & Workshops"
            subtitle="Acquire verifiable digital credentials upon completion"
            icon={<GraduationCap className="h-5 w-5 text-emerald-600" />}
            events={workshops}
            exploreLink="/explore?category=WORKSHOP"
          />

          {/* M3 Community Announcement Banner */}
          {announcements.length > 0 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-8">
              <div className="rounded-3xl p-6 sm:p-8 bg-md-primary-container border border-[#D3E3FD] shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 text-md-primary border border-[#D3E3FD] text-xs font-semibold mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-md-primary" />
                    Latest Broadcast
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-slate-900 mb-2">
                    {announcements[0].title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 max-w-2xl leading-relaxed">
                    {announcements[0].body}
                  </p>
                </div>

                <Link to="/announcements" className="flex-shrink-0">
                  <Button variant="primary" size="md" arrow>
                    View All Updates
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
