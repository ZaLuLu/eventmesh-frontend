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
    <section className="sticky top-16 z-30 bg-[#EEF2F6]/95 backdrop-blur-md border-b border-white/60 py-3 transition-all shadow-[0_4px_16px_rgba(163,177,198,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
        {/* Category Neomorphic Chips */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs transition-all duration-200 select-none whitespace-nowrap active:scale-[0.98] ${
                  isSelected
                    ? 'neo-gradient-btn font-bold'
                    : 'neo-pill text-slate-700 hover:text-indigo-600 font-semibold'
                }`}
              >
                {isSelected ? <Check className="h-3.5 w-3.5 text-white" /> : cat.icon}
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tactile Divider */}
        <div className="h-6 w-px bg-slate-300/60 shadow-[1px_0_0_#FFF] flex-shrink-0 hidden md:block" />

        {/* Date Filter & Rapid Toggles */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          {dateFilters.map((df) => {
            const isSelected = selectedDateFilter === df.id
            return (
              <button
                key={df.id}
                type="button"
                onClick={() => onSelectDateFilter(df.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all whitespace-nowrap select-none ${
                  isSelected
                    ? 'neo-inset text-indigo-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40 font-semibold'
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
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs transition-all whitespace-nowrap ${
                freeOnly
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-neo-glow-emerald neo-pill font-bold'
                  : 'neo-pill text-slate-700 hover:text-emerald-600 font-semibold'
              }`}
            >
              {freeOnly && <Check className="h-3.5 w-3.5 text-white" />}
              <span>Free Pass</span>
            </button>
          )}

          {/* Online Only Toggle Chip */}
          {onToggleOnline && (
            <button
              type="button"
              onClick={onToggleOnline}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs transition-all whitespace-nowrap ${
                onlineOnly
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-neo-sm neo-pill font-bold'
                  : 'neo-pill text-slate-700 hover:text-cyan-600 font-semibold'
              }`}
            >
              {onlineOnly && <Check className="h-3.5 w-3.5 text-white" />}
              <span>Online</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
