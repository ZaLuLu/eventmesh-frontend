import React, { useState } from 'react'
import { motion } from 'framer-motion'
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
    DATE_OPTIONS.find((d) => d.id === dateFilter)?.label || 'ANY DATE'

  return (
    <div
      className={cn(
        'sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] py-3.5 select-none transition-all',
        className
      )}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        {/* Row 1: Blueprint Kicker, Search, Quick Filters & Layout Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box (Delicate Hairline Input) */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search catalog by title, venue, or host club..."
              className="w-full h-9 pl-8 pr-8 bg-[#F8FAFC] border border-[#E2E8F0] focus:border-[#0047FF] focus:outline-none text-xs font-mono text-[#0A0A0A] placeholder:text-slate-400 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchQueryChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-[#0A0A0A]"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Controls: Date Filter, Free Only, Sort, Grid/List */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Date Popover */}
            <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'h-9 px-3 border text-xs font-mono flex items-center gap-1.5 transition-colors',
                    dateFilter !== 'all'
                      ? 'bg-[#0047FF]/10 text-[#0047FF] border-[#0047FF] font-semibold'
                      : 'bg-[#F8FAFC] text-slate-700 hover:text-[#0047FF] border-[#E2E8F0] hover:border-[#0047FF]'
                  )}
                  aria-label="Filter events by date"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#0047FF]" />
                  <span className="uppercase">{selectedDateLabel}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-1.5 bg-white border border-[#E2E8F0] text-xs font-mono shadow-xl z-50">
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
                        'w-full text-left px-2.5 py-1.5 text-xs font-mono flex items-center justify-between transition-colors',
                        dateFilter === opt.id
                          ? 'bg-[#0047FF]/10 text-[#0047FF] font-semibold border-l-2 border-[#0047FF]'
                          : 'text-slate-700 hover:bg-[#F8FAFC] hover:text-[#0A0A0A]'
                      )}
                    >
                      <span className="uppercase">{opt.label}</span>
                      {dateFilter === opt.id && <Check className="w-3 h-3 text-[#0047FF]" />}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Free Events Toggle */}
            <button
              type="button"
              onClick={() => onFreeOnlyChange(!freeOnly)}
              className={cn(
                'h-9 px-3 border text-xs font-mono flex items-center gap-1.5 transition-all',
                freeOnly
                  ? 'bg-[#0047FF]/10 text-[#0047FF] border-[#0047FF] font-semibold'
                  : 'bg-[#F8FAFC] text-slate-700 hover:text-[#0A0A0A] border-[#E2E8F0] hover:border-[#0047FF]'
              )}
              aria-pressed={freeOnly}
            >
              <span>FREE ONLY</span>
              {freeOnly && <Check className="w-3 h-3 text-[#0047FF]" />}
            </button>

            {/* Sort Select */}
            <div className="w-36 hidden sm:block">
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                className="w-full h-9 px-2.5 bg-[#F8FAFC] text-slate-800 border border-[#E2E8F0] hover:border-[#0047FF] text-xs font-mono focus:outline-none focus:border-[#0047FF] transition-colors uppercase cursor-pointer"
              >
                <option value="date-asc" className="bg-white text-slate-900">SOONEST</option>
                <option value="newest" className="bg-white text-slate-900">NEWEST</option>
                <option value="popularity" className="bg-white text-slate-900">POPULARITY</option>
              </select>
            </div>

            {/* Segmented Grid / List View Toggle */}
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(val) => val && onViewModeChange(val as 'grid' | 'list')}
              className="border border-[#E2E8F0] p-0.5 bg-[#F8FAFC]"
            >
              <ToggleGroupItem
                value="grid"
                aria-label="Grid view"
                className="w-7 h-7 data-[state=on]:bg-[#0047FF] data-[state=on]:text-white text-slate-500"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="list"
                aria-label="List view"
                className="w-7 h-7 data-[state=on]:bg-[#0047FF] data-[state=on]:text-white text-slate-500"
              >
                <List className="w-3.5 h-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {/* Row 2: Category Drafting Tabs & Index Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
          {/* Category Tabs with Architectural Underlines */}
          <div
            className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 -mx-2 px-2"
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
                    'relative h-8 px-3 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors duration-150 select-none flex-shrink-0 flex items-center',
                    isSelected
                      ? 'text-[#0047FF] font-semibold'
                      : 'text-slate-500 hover:text-[#0A0A0A]'
                  )}
                >
                  <span className="relative z-10">{cat.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0047FF] z-0"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {/* Morphing Result Counter */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 flex-shrink-0">
            <span className="text-slate-500">INDEXED:</span>
            <span className="text-[#0047FF] font-semibold min-w-[20px] inline-flex justify-center">
              <TextMorph>{String(totalCount)}</TextMorph>
            </span>
            <span>{totalCount === 1 ? 'EVENT' : 'EVENTS'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
