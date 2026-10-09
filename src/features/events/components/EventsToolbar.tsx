import React, { useState } from 'react'
import {
  Search,
  X,
  Calendar,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
} from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/design-system/primitives/ToggleGroup'
import { Popover, PopoverTrigger, PopoverContent } from '@/design-system/primitives/Popover'
import { Select } from '@/design-system/primitives/Select'
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
    DATE_OPTIONS.find((d) => d.id === dateFilter)?.label || 'Date'

  return (
    <div
      className={cn(
        'sticky top-16 z-30 bg-surface/95 backdrop-blur-md border-b border-line py-3.5 select-none transition-all',
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Search Input, Quick Filters, View Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Filter by title, topic, or collective..."
              className="w-full h-10 pl-9 pr-8 rounded-full bg-surface-sunken border border-line focus:outline-none focus:border-champion focus:ring-1 focus:ring-champion text-[13px] text-ink placeholder:text-ink-muted transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-line text-ink-muted"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Date Popover, Free Toggle, Sort, Grid/List */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Date Popover */}
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'h-10 px-3.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-colors',
                    dateFilter !== 'all'
                      ? 'bg-lavender text-champion border-lavender-300 font-semibold'
                      : 'bg-surface text-ink-muted hover:text-ink border-line'
                  )}
                  aria-label="Filter events by date"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedDateLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1.5 rounded-[18px] bg-surface border border-line shadow-card z-50">
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
                        'w-full text-left px-3 py-2 rounded-[12px] text-[13px] flex items-center justify-between transition-colors',
                        dateFilter === opt.id
                          ? 'bg-lavender/40 text-champion font-semibold'
                          : 'text-ink hover:bg-surface-sunken'
                      )}
                    >
                      <span>{opt.label}</span>
                      {dateFilter === opt.id && <Check className="w-3.5 h-3.5 text-champion" />}
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
                'h-10 px-3.5 rounded-full border text-[13px] font-medium flex items-center gap-1.5 transition-all',
                freeOnly
                  ? 'bg-champion text-white border-champion shadow-xs'
                  : 'bg-surface text-ink-muted hover:text-ink border-line'
              )}
              aria-pressed={freeOnly}
            >
              <span>Free only</span>
              {freeOnly && <Check className="w-3.5 h-3.5" />}
            </button>

            {/* Sort Select */}
            <div className="w-40 hidden sm:block">
              <Select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                options={[
                  { value: 'date-asc', label: 'Soonest' },
                  { value: 'newest', label: 'Newest' },
                  { value: 'popularity', label: 'Popularity' },
                ]}
                className="h-10 text-[13px]"
              />
            </div>

            {/* Segmented Grid / List View Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(val) => val && onViewModeChange(val as 'grid' | 'list')}
              className="border border-line rounded-full p-0.5 bg-surface-sunken"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="w-8 h-8 rounded-full data-[state=on]:bg-white data-[state=on]:text-champion data-[state=on]:shadow-xs"
              >
                <LayoutGrid className="w-4 h-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="w-8 h-8 rounded-full data-[state=on]:bg-white data-[state=on]:text-champion data-[state=on]:shadow-xs"
              >
                <List className="w-4 h-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Row 2: Category Chips & Animated Result Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-line/60">
          {/* Category Chips Bar */}
          <div
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 -mx-2 px-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onCategoryChange(cat.id)}
                  className={cn(
                    'h-8 px-3.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all duration-200 select-none flex-shrink-0',
                    isSelected
                      ? 'bg-champion text-white shadow-xs'
                      : 'bg-surface text-ink-muted hover:text-ink hover:bg-surface-sunken border border-line/70'
                  )}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          {/* Morphing Result Counter */}
          <div className="flex items-center gap-1 text-[13px] text-ink-muted font-medium flex-shrink-0">
            <span>Showing</span>
            <span className="font-semibold text-ink px-1 min-w-[20px] inline-flex justify-center">
              <TextMorph>{String(totalCount)}</TextMorph>
            </span>
            <span>{totalCount === 1 ? 'event' : 'events'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
