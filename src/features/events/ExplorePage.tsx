// Hallmark macrostructure: Catalog-Explore
import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useSearchParams, Link } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { Event } from '@/api'
import { EventTicketCard } from '@/design-system/EventTicketCard'
import { SectionHeader } from '@/design-system/SectionHeader'
import { PageShell } from '@/design-system/layout/PageShell'
import { Sticker } from '@/design-system/primitives/Sticker'
import { Sheet } from '@/design-system/primitives/Sheet'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { formatDate, formatTime, formatCurrency } from '@/lib/format'
import { getClubTheme } from '@/design-system/clubColors'
import {
  MagnifyingGlass,
  X,
  Funnel,
  GridFour,
  ListBullets,
  Check,
  CalendarBlank,
  MapPin,
  Ticket,
} from '@/design-system/Icon'
import { cn } from '@/lib/utils'

/**
 * Dense Luma-style Event Row for List View (Section 7.3)
 */
const DenseExploreRow: React.FC<{ event: Event }> = ({ event }) => {
  const clubId = event.organizerId || (event as any).clubId || 'club-cp'
  const clubTheme = getClubTheme(clubId)
  const isFree = event.isFree ?? (!event.price || event.price === 0)
  const isWaitlist = event.seatsLeft === 0 || (event as any).isWaitlist

  return (
    <article className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border-[1.5px] border-ink/15 hover:border-ink hover:shadow-offset transition-[border-color,box-shadow] duration-150 select-none">
      {/* Left: Date Stamp & Particulars */}
      <div className="flex items-start sm:items-center gap-4 min-w-0">
        <div className="w-14 h-14 rounded-xl bg-paper-2 border border-ink/15 flex flex-col items-center justify-center flex-shrink-0 text-center font-mono">
          <span className="text-xs uppercase font-bold text-cobalt tracking-wider">
            {new Date(event.startsAt).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="font-display font-extrabold text-lg text-ink leading-none">
            {new Date(event.startsAt).getDate()}
          </span>
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: clubTheme.hex }}
              aria-hidden="true"
            />
            <span className="text-xs font-semibold text-ink-soft truncate">
              {event.club?.name || event.organizerName || 'Campus Club'}
            </span>
            <span className="text-xs font-mono text-ink-soft/70">·</span>
            <span className="text-xs font-mono text-ink-soft/70">
              {formatTime(event.startsAt)}
            </span>
          </div>

          <h3 className="font-display font-extrabold text-base sm:text-lg text-ink tracking-tight line-clamp-1 group-hover:text-cobalt transition-colors">
            <Link to={`/events/${event.slug || event.id}`} className="focus:outline-none">
              {event.title}
            </Link>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-ink-soft">
            <MapPin size={12} weight="bold" className="text-cobalt flex-shrink-0" />
            <span className="truncate">{event.venue?.name || 'Campus Main Auditorium'}</span>
          </div>
        </div>
      </div>

      {/* Right: Badges & Action CTA */}
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink/10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sticker color={isFree ? 'mint' : 'mustard'} size="sm">
            {formatCurrency(event.price)}
          </Sticker>
          {isWaitlist && (
            <Sticker color="tangerine" size="sm">
              Waitlist
            </Sticker>
          )}
        </div>

        <Link
          to={`/events/${event.slug || event.id}`}
          className="btn-funk-primary px-4 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Ticket size={14} weight="bold" />
          <span>{isWaitlist ? 'Waitlist' : 'Grab seat'}</span>
        </Link>
      </div>
    </article>
  )
}

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
    { id: 'ALL', label: 'All' },
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

  return (
    <PageShell className="py-8 sm:py-12 space-y-8 select-none">
      {/* Header Block: Section Header & Instant Search Box */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-ink/10">
        <SectionHeader
          title="Explore campus happenings"
          subtitle="Discover and grab seats for hackathons, technical retreats, and design salons across 9 collectives"
          badge="Full Catalog"
          badgeColor="sky"
          accentWord="happenings"
          className="mb-0"
        />

        {/* Prominent Instant Search Input */}
        <div className="relative w-full md:max-w-md">
          <MagnifyingGlass
            size={18}
            weight="bold"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Search by title, club, venue..."
            className="w-full h-12 pl-11 pr-10 rounded-full bg-card border border-ink/15 focus:border-cobalt focus:ring-1 focus:ring-cobalt focus:outline-none text-sm text-ink placeholder:text-ink-soft/70 shadow-sm transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setParam('search', '')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink"
              aria-label="Clear search"
            >
              <X size={15} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Sticky Horizontal Chip & Filter Bar (Replaces legacy left rail, V-08) */}
      <div className="sticky top-16 z-30 bg-paper/95 backdrop-blur-md py-3 border-y border-ink/10 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Category Pill Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setParam('category', cat.id)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-[color,background-color,border-color,box-shadow] shadow-sm',
                  isSelected
                    ? 'bg-ink text-paper shadow-offset'
                    : 'bg-card text-ink hover:bg-paper-2 border border-ink/15'
                )}
              >
                {cat.label}
              </button>
            )
          })}
        </div>

        {/* Right: Club Select, Free Only, Sort, View Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Club Dropdown Filter */}
          <select
            value={activeClub}
            onChange={(e) => setParam('club', e.target.value)}
            className="h-9 px-3 bg-card border border-ink/20 rounded-full text-xs font-semibold text-ink focus:outline-none focus:border-cobalt transition-colors shadow-sm cursor-pointer"
            aria-label="Filter by club"
          >
            <option value="ALL">All clubs</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Free Passes Only Pill */}
          <button
            type="button"
            onClick={() => setParam('free', freeOnly ? '' : 'true')}
            className={cn(
              'h-9 px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-[color,background-color,border-color,box-shadow] shadow-sm',
              freeOnly
                ? 'bg-mint text-ink border-ink shadow-offset'
                : 'bg-card text-ink border-ink/20 hover:bg-paper-2'
            )}
            aria-pressed={freeOnly}
          >
            <span>Free only</span>
            {freeOnly && <Check size={12} weight="bold" />}
          </button>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'popular' | 'title')}
            className="h-9 px-3 bg-card border border-ink/20 rounded-full text-xs font-semibold text-ink focus:outline-none focus:border-cobalt transition-colors shadow-sm cursor-pointer"
            aria-label="Sort events"
          >
            <option value="date">Date</option>
            <option value="popular">Popular</option>
            <option value="title">A-Z</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 bg-paper-2 border border-ink/15 rounded-full shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-[color,background-color,box-shadow]',
                viewMode === 'grid'
                  ? 'bg-ink text-paper shadow-offset'
                  : 'text-ink-soft hover:text-ink'
              )}
              aria-label="Grid view"
            >
              <GridFour size={16} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-[color,background-color,box-shadow]',
                viewMode === 'list'
                  ? 'bg-ink text-paper shadow-offset'
                  : 'text-ink-soft hover:text-ink'
              )}
              aria-label="List view"
            >
              <ListBullets size={16} weight="bold" />
            </button>
          </div>

          {/* Active Filters Clear */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-cobalt hover:underline px-2"
            >
              Reset ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Main Results Container: Full Width, 3-column Grid or Dense Rows (V-01, V-08) */}
      <div className="w-full">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-ticket bg-card border-[1.5px] border-ink/15 animate-pulse"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="Nothing on yet. Try another club."
            description="No scheduled events match your current filter parameters."
            actionLabel="Clear all filters"
            onAction={clearAllFilters}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((evt) => (
                <motion.div
                  key={evt.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <EventTicketCard event={evt} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <DenseExploreRow event={event} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet
        isOpen={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        title="Filter campus events"
      >
        <div className="space-y-5 pt-2">
          {/* Category */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block">
              Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setParam('category', cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-[color,background-color,border-color,box-shadow]',
                    activeCategory === cat.id
                      ? 'bg-ink text-paper shadow-offset'
                      : 'bg-card text-ink border border-ink/15'
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Club */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block">
              Club / Society
            </span>
            <select
              value={activeClub}
              onChange={(e) => setParam('club', e.target.value)}
              className="w-full h-11 px-3 bg-card border border-ink/20 rounded-xl text-sm font-semibold text-ink"
            >
              <option value="ALL">All clubs</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-ink/10 flex items-center gap-3">
            <button
              type="button"
              onClick={clearAllFilters}
              className="btn-funk-secondary w-1/2 py-2.5 text-xs font-bold uppercase"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(false)}
              className="btn-funk-primary w-1/2 py-2.5 text-xs font-bold uppercase"
            >
              Done
            </button>
          </div>
        </div>
      </Sheet>
    </PageShell>
  )
}
