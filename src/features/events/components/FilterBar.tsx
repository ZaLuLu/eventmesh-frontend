import React from 'react'
import {
  Sparkles,
  Trophy,
  GraduationCap,
  Mic,
  Flame,
  Award,
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
    { id: 'ALL', label: 'All Events', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'HACKATHON', label: 'Hackathons', icon: <Trophy className="h-3.5 w-3.5" /> },
    { id: 'WORKSHOP', label: 'Workshops', icon: <GraduationCap className="h-3.5 w-3.5" /> },
    { id: 'TALK', label: 'Tech Talks', icon: <Mic className="h-3.5 w-3.5" /> },
    { id: 'COMPETITION', label: 'Competitions', icon: <Flame className="h-3.5 w-3.5" /> },
  ]

  const dateFilters = [
    { id: 'ALL', label: 'Any Date' },
    { id: 'TODAY', label: 'Today' },
    { id: 'WEEKEND', label: 'This Weekend' },
    { id: 'MONTH', label: 'This Month' },
  ]

  return (
    <section className="sticky top-16 z-30 bg-white border-b border-md-outline/60 py-2.5 transition-all shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
        {/* Category M3 Filter Chips */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none whitespace-nowrap active:scale-[0.98] ${
                  isSelected
                    ? 'bg-md-primary-container text-md-on-primary-container border-[#D3E3FD] font-semibold'
                    : 'bg-white text-md-on-surface-variant border-md-outline hover:bg-black/[0.04]'
                }`}
              >
                {isSelected ? <Check className="h-3.5 w-3.5 text-md-primary" /> : cat.icon}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Vertical Divider */}
        <div className="h-5 w-px bg-md-outline/80 flex-shrink-0 hidden md:block" />

        {/* Date Filter Chips & Verification Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {dateFilters.map((df) => {
            const isSelected = selectedDateFilter === df.id
            return (
              <button
                key={df.id}
                type="button"
                onClick={() => onSelectDateFilter(df.id)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap font-medium ${
                  isSelected
                    ? 'bg-md-primary-container text-md-on-primary-container font-semibold border border-[#D3E3FD]'
                    : 'text-md-on-surface-variant hover:text-md-on-surface hover:bg-black/[0.04]'
                }`}
              >
                {df.label}
              </button>
            )
          })}

          {/* Free Only Toggle Chip */}
          {onToggleFree && (
            <button
              type="button"
              onClick={onToggleFree}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all whitespace-nowrap ${
                freeOnly
                  ? 'bg-[#E6F4EA] text-[#137333] border-[#CEEAD6] font-semibold'
                  : 'text-md-on-surface-variant border-md-outline hover:bg-black/[0.04]'
              }`}
            >
              {freeOnly && <Check className="h-3.5 w-3.5 text-[#137333]" />}
              <span>Free Pass</span>
            </button>
          )}

          {/* Online Only Toggle Chip */}
          {onToggleOnline && (
            <button
              type="button"
              onClick={onToggleOnline}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all whitespace-nowrap ${
                onlineOnly
                  ? 'bg-md-primary-container text-md-on-primary-container border-[#D3E3FD] font-semibold'
                  : 'text-md-on-surface-variant border-md-outline hover:bg-black/[0.04]'
              }`}
            >
              {onlineOnly && <Check className="h-3.5 w-3.5 text-md-primary" />}
              <span>Online</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
