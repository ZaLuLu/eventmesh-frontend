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
        'bg-paper border-t border-line py-3 select-none transition-colors',
        className
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-3">
        {/* Row 1: Search, Date Filter, Free Toggle, View Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <MagnifyingGlass size={15} weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Filter by keyword..."
              className="w-full h-9 pl-9 pr-8 bg-card border border-line rounded-full focus:border-accent focus:outline-none text-xs text-ink placeholder:text-ink-muted transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-ink-muted hover:text-ink"
                aria-label="Clear search input"
              >
                <X size={12} weight="bold" />
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
                    'h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border',
                    dateFilter !== 'all'
                      ? 'bg-accent text-white border-accent'
                      : 'bg-card text-ink border-line hover:bg-surface-subtle'
                  )}
                  aria-label="Filter events by date"
                >
                  <CalendarBlank size={13} weight="bold" />
                  <span>{selectedDateLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44 p-1 bg-card border border-line rounded-xl shadow-xl text-xs z-50">
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
                        'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors',
                        dateFilter === opt.id
                          ? 'bg-accent/10 text-accent font-semibold'
                          : 'text-ink hover:bg-surface-subtle'
                      )}
                    >
                      <span>{opt.label}</span>
                      {dateFilter === opt.id && <Check size={12} weight="bold" className="text-accent" />}
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
                'h-8 px-3 rounded-full border text-xs font-medium flex items-center gap-1.5 transition-colors',
                freeOnly
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-card text-ink border-line hover:bg-surface-subtle'
              )}
              aria-pressed={freeOnly}
            >
              <span>Free only</span>
              {freeOnly && <Check size={11} weight="bold" />}
            </button>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="h-8 px-3 bg-card border border-line rounded-full text-xs font-medium text-ink focus:outline-none focus:border-accent transition-colors cursor-pointer"
              aria-label="Sort events by"
            >
              <option value="date-asc">Soonest</option>
              <option value="date-desc">Latest</option>
              <option value="popular">Most popular</option>
            </select>

            {/* View Mode Toggle: Grid / List */}
            <div className="flex items-center p-0.5 bg-surface-subtle rounded-full border border-line">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                  viewMode === 'grid'
                    ? 'bg-card text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                )}
                aria-label="Grid view"
              >
                <GridFour size={14} weight="bold" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center transition-colors',
                  viewMode === 'list'
                    ? 'bg-card text-ink shadow-sm'
                    : 'text-ink-muted hover:text-ink'
                )}
                aria-label="List view"
              >
                <ListBullets size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Chips & Results Counter */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-line/60 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 flex-nowrap py-0.5">
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                    isSelected
                      ? 'bg-ink text-paper'
                      : 'bg-card text-ink-soft hover:text-ink hover:bg-surface-subtle border border-line/80'
                  )}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <div className="text-xs font-mono text-ink-muted whitespace-nowrap hidden sm:flex items-center gap-1 flex-shrink-0">
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
