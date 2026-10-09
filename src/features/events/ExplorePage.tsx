import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { EventCardModern } from './components/EventCardModern'
import { IndexRow } from '@/design-system/primitives/IndexRow'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { Sheet } from '@/design-system/primitives/Sheet'
import { Button } from '@/design-system/primitives/Button'
import { Skeleton } from '@/design-system/primitives/Skeleton'
import { formatDate } from '@/lib/dates'
import {
  Search,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Check,
} from 'lucide-react'

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'popular' | 'title'>('date')

  const activeCategory = searchParams.get('category') || 'ALL'
  const activeClub = searchParams.get('club') || 'ALL'
  const activeDate = searchParams.get('date') || 'ALL'
  const searchQuery = searchParams.get('search') || ''
  const freeOnly = searchParams.get('free') === 'true'

  const { data: clubs = [] } = useClubs()
  const { data: eventsData, isLoading } = useEvents({
    category: activeCategory !== 'ALL' ? activeCategory : undefined,
    clubId: activeClub !== 'ALL' ? activeClub : undefined,
    search: searchQuery || undefined,
  })

  const rawEvents = useMemo(() => eventsData?.items || [], [eventsData?.items])

  // Filter & sort events
  const filteredEvents = useMemo(() => {
    let result = [...rawEvents]

    if (freeOnly) {
      result = result.filter((e) => e.isFree || !e.features?.paid)
    }

    if (activeDate === 'today') {
      const todayStr = new Date().toISOString().slice(0, 10)
      result = result.filter((e) => e.startsAt.startsWith(todayStr))
    }

    if (sortBy === 'popular') {
      result.sort((a, b) => (b.capacity - b.seatsLeft) - (a.capacity - a.seatsLeft))
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      // Prioritize upcoming active published events so they appear first
      result.sort((a, b) => {
        const aActive = a.status === 'published' ? 1 : 0
        const bActive = b.status === 'published' ? 1 : 0
        if (aActive !== bActive) return bActive - aActive
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      })
    }

    return result
  }, [rawEvents, freeOnly, activeDate, sortBy])

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value && value !== 'ALL') {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const categories = [
    { id: 'ALL', label: 'All categories' },
    { id: 'HACKATHON', label: 'Hackathons' },
    { id: 'WORKSHOP', label: 'Workshops' },
    { id: 'TALK', label: 'Tech talks' },
    { id: 'COMPETITION', label: 'Competitions' },
  ]

  const activeFiltersCount =
    (activeCategory !== 'ALL' ? 1 : 0) +
    (activeClub !== 'ALL' ? 1 : 0) +
    (activeDate !== 'ALL' ? 1 : 0) +
    (freeOnly ? 1 : 0) +
    (searchQuery ? 1 : 0)

  // Filter column content reusable between desktop and mobile sheet
  const filterControls = (
    <div className="space-y-5 text-small">
      {/* Category Filter */}
      <div>
        <h4 className="font-semibold text-small text-text mb-2.5">Category</h4>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setParam('category', cat.id)}
              className={`w-full text-left px-3 py-2 rounded-[8px] flex items-center justify-between transition-colors ${
                activeCategory === cat.id
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'text-text-2 hover:bg-subtle hover:text-text'
              }`}
            >
              <span>{cat.label}</span>
              {activeCategory === cat.id && <Check className="h-4 w-4 text-accent" />}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs Filter */}
      <div>
        <h4 className="font-semibold text-small text-text mb-2.5">Collective</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <button
            type="button"
            onClick={() => setParam('club', 'ALL')}
            className={`w-full text-left px-3 py-2 rounded-[8px] flex items-center justify-between transition-colors ${
              activeClub === 'ALL'
                ? 'bg-accent-soft text-accent font-semibold'
                : 'text-text-2 hover:bg-subtle hover:text-text'
            }`}
          >
            <span>All clubs</span>
            {activeClub === 'ALL' && <Check className="h-4 w-4 text-accent" />}
          </button>
          {clubs.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setParam('club', c.id)}
              className={`w-full text-left px-3 py-2 rounded-[8px] flex items-center justify-between transition-colors ${
                activeClub === c.id
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'text-text-2 hover:bg-subtle hover:text-text'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: c.color || '#C93E27' }}
                  aria-hidden="true"
                />
                <span className="truncate">{c.name}</span>
              </div>
              {activeClub === c.id && <Check className="h-4 w-4 text-accent flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Toggles */}
      <div className="pt-2 border-t border-line space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer py-1 text-text select-none">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setParam('free', e.target.checked ? 'true' : '')}
            className="h-4 w-4 rounded text-accent border-line focus:ring-accent"
          />
          <span>Free passes only</span>
        </label>
      </div>

      {activeFiltersCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full text-center py-2 text-small font-semibold text-accent hover:underline pt-3 border-t border-line"
        >
          Reset all filters ({activeFiltersCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full bg-bg text-text">
      <div className="app-container py-6 sm:py-8 space-y-6">
        {/* Header Block: Title & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-text tracking-tight">
              Explore events
            </h1>
            <p className="text-small text-text-2 mt-0.5">
              Discover and register for technical events across collegiate clubs
            </p>
          </div>

          {/* Search Input (48px height, 10px radius) */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setParam('search', e.target.value)}
              placeholder="Search by title, speaker, keyword..."
              className="w-full h-12 pl-10 pr-9 rounded-[10px] bg-surface border border-line text-small text-text placeholder:text-text-3 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setParam('search', '')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-3 hover:text-text p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Result Count and Sort on One Line */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4 py-2 border-y border-line">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Filters Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] bg-surface border border-line text-small font-medium text-text"
            >
              <SlidersHorizontal className="h-4 w-4 text-accent" />
              <span>Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}</span>
            </button>

            <span className="text-small text-text-2 font-medium">
              Showing <strong className="text-text font-semibold">{filteredEvents.length}</strong> events
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-small">
              <span className="text-text-3 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'popular' | 'title')}
                className="h-9 px-2 rounded-[8px] bg-surface border border-line text-small text-text focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
              >
                <option value="date">Date</option>
                <option value="popular">Popular</option>
                <option value="title">A-Z</option>
              </select>
            </div>

            {/* Grid / List View Toggle */}
            <div className="hidden sm:flex items-center border border-line rounded-[8px] overflow-hidden bg-surface">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-accent text-on-accent' : 'text-text-2 hover:text-text'
                }`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' ? 'bg-accent text-on-accent' : 'text-text-2 hover:text-text'
                }`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Left Filter Column (Desktop) + Results Grid */}
        <div className="flex items-start gap-6 lg:gap-8">
          {/* Left Filter Column (Desktop) */}
          <aside className="w-60 lg:w-64 flex-shrink-0 hidden md:block bg-surface border border-line rounded-panel p-4">
            <h3 className="text-h3 font-semibold text-text mb-3">Filters</h3>
            {filterControls}
          </aside>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} height="h-64" rounded="rounded-panel" />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                title="No events found"
                description="No scheduled events match your current filter parameters."
                actionLabel="Reset all filters"
                onAction={clearAllFilters}
              />
            ) : viewMode === 'grid' ? (
              /* Grids fill the row: 4 cols at 1280+, 3 at 1024, 2 at 640, 1 under 640 */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredEvents.map((evt) => (
                  <EventCardModern key={evt.id} event={evt} />
                ))}
              </div>
            ) : (
              /* Clean Flat List View */
              <div className="divide-y divide-line border border-line rounded-panel overflow-hidden bg-surface">
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
                    venueName={event.venue?.name}
                    status={event.status}
                    indexNumber={idx + 1}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Bottom Sheet */}
        <Sheet
          isOpen={isMobileFiltersOpen}
          onClose={() => setIsMobileFiltersOpen(false)}
          title="Filter events"
        >
          {filterControls}
          <div className="pt-4 mt-4 border-t border-line">
            <Button
              variant="primary"
              size="default"
              fullWidth
              onClick={() => setIsMobileFiltersOpen(false)}
            >
              Apply filters
            </Button>
          </div>
        </Sheet>
      </div>
    </div>
  )
}
