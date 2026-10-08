import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useEvents } from '@/hooks/useEvents'
import { useClubs } from '@/hooks/useClubs'
import { CATEGORIES } from '@/config/categories'
import { IndexRow } from '@/design-system/primitives/IndexRow'
import { Chip } from '@/design-system/primitives/Chip'
import { Tabs } from '@/design-system/primitives/Tabs'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { formatDate } from '@/lib/dates'
import { Search, X, SlidersHorizontal } from 'lucide-react'

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
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
    <div className="w-full bg-paper text-ink min-h-screen">
      {/* Editorial Page Header */}
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
          Exhibition Index & Archive
        </span>
        <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
          Catalogue
        </h1>
        <p className="font-body text-base text-ink-60 max-w-xl mt-3">
          Explore all 30 symposiums, hackathons, and laboratory workshops organized across the 9 member clubs.
        </p>
      </div>

      {/* Primary Category Tabs */}
      <div className="px-[4vw] bg-paper border-b border-ink-15">
        <Tabs
          tabs={CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
          activeTab={activeTab}
          onChange={(id) => setParam('tab', id)}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="px-[4vw] py-6 border-b border-ink-15 bg-paper-deep/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setParam('search', e.target.value)}
            placeholder="Filter by keyword or speaker..."
            className="w-full bg-paper text-ink font-body text-sm pl-9 pr-4 py-2 border border-ink-15 focus:border-ink focus:outline-none"
          />
        </div>

        {/* Club Dropdown Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase text-ink-60">Club:</span>
            <select
              value={activeClub}
              onChange={(e) => setParam('club', e.target.value)}
              className="bg-paper border border-ink-15 px-3 py-1.5 font-mono text-xs uppercase focus:outline-none"
            >
              <option value="all">All Clubs (9)</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Date Filters */}
          <div className="flex items-center gap-1.5">
            <Chip
              label="All Dates"
              size="sm"
              active={activeDate === 'all'}
              onClick={() => setParam('date', 'all')}
            />
            <Chip
              label="Today"
              size="sm"
              active={activeDate === 'today'}
              onClick={() => setParam('date', 'today')}
            />
          </div>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="font-mono text-[11px] uppercase tracking-wide text-[#A32828] underline hover:text-black ml-2"
            >
              Clear all ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips Row */}
      {activeFiltersCount > 0 && (
        <div className="px-[4vw] py-3 border-b border-ink-15 flex flex-wrap items-center gap-2 bg-paper">
          <span className="font-mono text-[10px] uppercase text-ink-60 mr-2">Active:</span>
          {activeTab !== 'all' && (
            <Chip
              label={`Category: ${activeTab}`}
              active
              onRemove={() => setParam('tab', 'all')}
            />
          )}
          {activeClub !== 'all' && (
            <Chip
              label={`Club: ${clubs.find((c) => c.id === activeClub)?.name || activeClub}`}
              active
              onRemove={() => setParam('club', 'all')}
            />
          )}
          {activeDate !== 'all' && (
            <Chip
              label={`Date: ${activeDate}`}
              active
              onRemove={() => setParam('date', 'all')}
            />
          )}
          {searchQuery && (
            <Chip
              label={`"${searchQuery}"`}
              active
              onRemove={() => setParam('search', '')}
            />
          )}
        </div>
      )}

      {/* Typographic Event Index Results */}
      <div className="w-full">
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs uppercase tracking-wide text-ink-60">
            Scanning Archival Index...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="px-[4vw] py-16">
            <EmptyState
              title="No Matching Exhibitions"
              description="No events match your current filter parameters. Try clearing filters or altering search keywords."
              actionLabel="Reset Filters"
              onAction={clearAllFilters}
            />
          </div>
        ) : (
          <div>
            {filteredEvents.map((evt, index) => (
              <IndexRow
                key={evt.id}
                id={evt.id}
                slug={evt.slug}
                title={evt.title}
                category={evt.category}
                organizerName={evt.organizerName || 'Technical Association'}
                organizerColor={evt.organizerColor}
                dateDisplay={formatDate(evt.startsAt)}
                venueName={evt.venue.name}
                status={evt.status}
                indexNumber={index + 1}
                isSignature={evt.isSignature}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
