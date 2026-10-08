import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { CATEGORIES } from '@/config/categories'
import { EventCardModern } from './components/EventCardModern'
import { IndexRow } from '@/design-system/primitives/IndexRow'
import { Chip } from '@/design-system/primitives/Chip'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { formatDate } from '@/lib/dates'
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Award,
  Sparkles,
} from 'lucide-react'

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const activeTab = searchParams.get('tab') || 'all'
  const activeClub = searchParams.get('club') || 'all'
  const activeDate = searchParams.get('date') || 'all'
  const searchQuery = searchParams.get('search') || ''

  const { data: clubs = [] } = useClubs()
  const { data: eventsData, isLoading } = useEvents({
    category: activeTab !== 'all' ? activeTab : undefined,
    clubId: activeClub !== 'all' ? activeClub : undefined,
    search: searchQuery || undefined,
  })

  const events = eventsData?.items || []

  // Filter dates locally if requested
  const filteredEvents = useMemo(() => {
    let result = [...events]
    if (activeDate === 'today') {
      const todayStr = new Date().toISOString().split('T')[0]
      result = result.filter((e) => e.startsAt.startsWith(todayStr))
    }
    return result
  }, [events, activeDate])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const activeFiltersCount =
    (activeTab !== 'all' ? 1 : 0) +
    (activeClub !== 'all' ? 1 : 0) +
    (activeDate !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0)

  return (
    <div className="w-full bg-canvas text-slate-900 min-h-screen">
      {/* Header Banner */}
      <div className="bg-[#EEF2F6] border-b border-white/70 shadow-neo-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 tracking-normal block mb-1">
                Discovery & Live Feed
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                Explore All Live Events
              </h1>
              <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
                Browse 30 flagship hackathons, certification workshops, and tech talks across 9 clubs
              </p>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-full neo-card border border-white/80 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-neo-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-neo-sm font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search by title, speaker, or keyword..."
            className="w-full bg-[#EEF2F6] text-slate-900 font-body text-xs sm:text-sm pl-11 pr-10 py-2.5 rounded-full neo-inset focus:ring-2 focus:ring-indigo-500/30 focus:outline-none placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setParam('search', '')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills & Club Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Chips */}
          <Chip
            label="All"
            active={activeTab === 'all'}
            onClick={() => setParam('tab', 'all')}
          />
          <Chip
            label="Hackathons"
            active={activeTab === 'HACKATHON'}
            onClick={() => setParam('tab', 'HACKATHON')}
          />
          <Chip
            label="Workshops"
            active={activeTab === 'WORKSHOP'}
            onClick={() => setParam('tab', 'WORKSHOP')}
          />
          <Chip
            label="Tech Talks"
            active={activeTab === 'TALK'}
            onClick={() => setParam('tab', 'TALK')}
          />

          {/* Club Dropdown */}
          <select
            value={activeClub}
            onChange={(e) => setParam('club', e.target.value)}
            className="rounded-full neo-pill border border-white/80 px-4 py-2 text-xs font-bold text-slate-700 shadow-neo-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All 9 Clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-indigo-600 hover:underline ml-1"
            >
              Clear All ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Main Results Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-72 rounded-3xl neo-card animate-pulse border border-white/60"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No events found"
            description="Try modifying your category filters, search terms, or club selection."
            actionLabel="Reset All Filters"
            onAction={clearAllFilters}
          />
        ) : viewMode === 'grid' ? (
          /* Modern Card Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEvents.map((event) => (
              <EventCardModern key={event.id} event={event} />
            ))}
          </div>
        ) : (
          /* Clean Index List View */
          <div className="divide-y divide-slate-200/60 rounded-3xl neo-card border border-white/80 overflow-hidden shadow-neo-card">
            {filteredEvents.map((event, idx) => (
              <IndexRow
                key={event.id}
                id={event.id}
                slug={event.slug}
                title={event.title}
                category={event.category}
                organizerName={event.organizerName || 'Technical Collective'}
                organizerColor={event.organizerColor}
                dateDisplay={formatDate(event.startsAt)}
                venueName={event.venue.name}
                status={event.status}
                indexNumber={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
