import React from 'react'
import {
  Sparkles,
  Trophy,
  GraduationCap,
  Mic,
  Flame,
  Check,
} from 'lucide-react'

export interface FilterBarProps {
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  selectedDateFilter: string
  onSelectDateFilter: (dateFilter: string) => void
  freeOnly?: boolean
  onToggleFree?: () => void
  onlineOnly?: boolean
  onToggleOnline?: () => void
  onlyWithCertificates?: boolean
  onToggleCertificates?: () => void
  activeClubId?: string
  onSelectClub?: (clubId: string) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedDateFilter,
  onSelectDateFilter,
  freeOnly = false,
  onToggleFree,
  onlineOnly = false,
  onToggleOnline,
  onlyWithCertificates = false,
  onToggleCertificates,
}) => {
  const categories = [
    { id: 'ALL', label: 'All events', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'HACKATHON', label: 'Hackathons', icon: <Trophy className="h-4 w-4" /> },
    { id: 'WORKSHOP', label: 'Workshops', icon: <GraduationCap className="h-4 w-4" /> },
    { id: 'TALK', label: 'Tech talks', icon: <Mic className="h-4 w-4" /> },
    { id: 'COMPETITION', label: 'Competitions', icon: <Flame className="h-4 w-4" /> },
  ]

  const dateFilters = [
    { id: 'ALL', label: 'Any date' },
    { id: 'TODAY', label: 'Today' },
    { id: 'WEEKEND', label: 'This weekend' },
    { id: 'MONTH', label: 'This month' },
  ]

  return (
    <section className="sticky top-[64px] z-30 bg-bg border-b border-line py-2 select-none">
      <div className="app-container flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Category Chips: min-h-[44px] mobile, min-h-[40px] desktop */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] sm:min-h-[40px] rounded-full text-small transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-text ${
                  isSelected
                    ? 'bg-accent-soft text-accent font-semibold'
                    : 'bg-subtle text-text hover:text-text-2'
                }`}
              >
                {isSelected ? <Check className="h-3.5 w-3.5 text-accent" /> : cat.icon}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* 1px Hairline Divider */}
        <div className="h-6 w-px bg-line flex-shrink-0 hidden md:block" />

        {/* Date Filter Chips & Toggles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {dateFilters.map((df) => {
            const isSelected = selectedDateFilter === df.id
            return (
              <button
                key={df.id}
                type="button"
                onClick={() => onSelectDateFilter(df.id)}
                className={`px-3 min-h-[44px] sm:min-h-[40px] rounded-full text-small transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-text ${
                  isSelected
                    ? 'bg-accent-soft text-accent font-semibold'
                    : 'bg-subtle text-text-2 hover:text-text'
                }`}
              >
                {df.label}
              </button>
            )
          })}

          {onToggleFree && (
            <button
              type="button"
              onClick={onToggleFree}
              className={`px-3 min-h-[44px] sm:min-h-[40px] rounded-full text-small transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-text ${
                freeOnly
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'bg-subtle text-text-2 hover:text-text'
              }`}
            >
              Free only
            </button>
          )}

          {onToggleOnline && (
            <button
              type="button"
              onClick={onToggleOnline}
              className={`px-3 min-h-[44px] sm:min-h-[40px] rounded-full text-small transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-text ${
                onlineOnly
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'bg-subtle text-text-2 hover:text-text'
              }`}
            >
              Online
            </button>
          )}

          {onToggleCertificates && (
            <button
              type="button"
              onClick={onToggleCertificates}
              className={`px-3 min-h-[44px] sm:min-h-[40px] rounded-full text-small transition-colors duration-150 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-text ${
                onlyWithCertificates
                  ? 'bg-accent-soft text-accent font-semibold'
                  : 'bg-subtle text-text-2 hover:text-text'
              }`}
            >
              Certificates
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
