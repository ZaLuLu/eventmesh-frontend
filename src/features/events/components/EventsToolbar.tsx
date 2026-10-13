import React, { useState } from 'react'
import {
  MagnifyingGlass,
  X,
  CalendarBlank,
  GridFour,
  ListBullets,
  Check,
} from '@/design-system/Icon'
import { Popover, PopoverTrigger, PopoverContent } from '@/design-system/primitives/Popover'
import { TextMorph } from 'torph/react'
import { cn } from '@/lib/utils'

export interface EventsToolbarProps {
  category: string
  onCategoryChange: (category: string) => void
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  dateFilter: string
  onDateFilterChange: (date: string) => void
  freeOnly: boolean
  onFreeOnlyChange: (free: boolean) => void
  sortBy: string
  onSortByChange: (sort: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  totalCount: number
  className?: string
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'talk', label: 'Talks' },
  { id: 'competition', label: 'Competitions' },
  { id: 'club_events', label: 'Club events' },
]

const DATE_OPTIONS = [
  { id: 'all', label: 'Any date' },
  { id: 'today', label: 'Today' },
  { id: 'this-weekend', label: 'This weekend' },
  { id: 'this-month', label: 'This month' },
]

export const EventsToolbar: React.FC<EventsToolbarProps> = ({
  category,
  onCategoryChange,
  searchQuery,
  onSearchQueryChange,
  dateFilter,
  onDateFilterChange,
  freeOnly,
  onFreeOnlyChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  totalCount,
  className,
}) => {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)

  const selectedDateLabel =
    DATE_OPTIONS.find((d) => d.id === dateFilter)?.label || 'Any date'

  return (
    <div
      className={cn(
        'sticky top-16 z-30 bg-paper/95 backdrop-blur-md border-b border-ink/10 py-3.5 select-none transition-all',
        className
      )}
    >
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Search, Date Filter, Free Toggle, View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <MagnifyingGlass size={16} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search catalog by title, venue, or host club..."
              className="w-full h-10 pl-9 pr-9 bg-card border border-ink/15 rounded-full focus:border-cobalt focus:ring-1 focus:ring-cobalt focus:outline-none text-xs sm:text-sm text-ink placeholder:text-ink-soft/70 shadow-sm transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-ink-soft hover:text-ink"
                aria-label="Clear search input"
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>

          {/* Controls: Date, Free Only, View Switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Popover */}
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'h-9 px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm',
                    dateFilter !== 'all'
                      ? 'bg-cobalt text-white border-cobalt'
                      : 'bg-card text-ink border-ink/20 hover:bg-paper-2'
                  )}
                  aria-label="Filter events by date"
                >
                  <CalendarBlank size={14} weight="bold" />
                  <span>{selectedDateLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-1 bg-card border border-ink/15 rounded-2xl shadow-offset text-xs z-50">
                <div className="space-y-0.5">
                  {DATE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        onDateFilterChange(opt.id)
                        setDatePopoverOpen(false)
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-xl text-left font-medium transition-colors',
                        dateFilter === opt.id
                          ? 'bg-paper-2 text-cobalt font-bold'
                          : 'text-ink hover:bg-paper-2'
                      )}
                    >
                      <span>{opt.label}</span>
                      {dateFilter === opt.id && <Check size={14} weight="bold" className="text-cobalt" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Free Events Pill Toggle */}
            <button
              type="button"
              onClick={() => onFreeOnlyChange(!freeOnly)}
              className={cn(
                'h-9 px-3 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm',
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
              onChange={(e) => onSortByChange(e.target.value)}
              className="h-9 px-3 bg-card border border-ink/20 rounded-full text-xs font-semibold text-ink focus:outline-none focus:border-cobalt transition-colors shadow-sm cursor-pointer"
              aria-label="Sort events by"
            >
              <option value="date-asc">Soonest</option>
              <option value="date-desc">Latest</option>
              <option value="popular">Most popular</option>
            </select>

            {/* View Mode Toggle: Grid / List */}
            <div className="flex items-center p-0.5 bg-paper-2 border border-ink/15 rounded-full shadow-inner">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
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
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  viewMode === 'list'
                    ? 'bg-ink text-paper shadow-offset'
                    : 'text-ink-soft hover:text-ink'
                )}
                aria-label="List view"
              >
                <ListBullets size={16} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Chips & Results Counter */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-ink/10 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 flex-nowrap py-0.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all',
                    isSelected
                      ? 'bg-ink text-paper shadow-offset'
                      : 'bg-card text-ink-soft hover:text-ink hover:bg-paper-2 border border-ink/10'
                  )}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="text-xs font-mono text-ink-soft whitespace-nowrap hidden sm:flex items-center gap-1 flex-shrink-0">
            <span>Showing</span>
            <span className="font-bold text-ink">
              <TextMorph>{String(totalCount)}</TextMorph>
            </span>
            <span>events</span>
          </div>
        </div>
      </div>
    </div>
  )
}
