import React from 'react'
import {
  Sparkles,
  Flame,
  Trophy,
  GraduationCap,
  Mic,
  Users,
  Award,
  Calendar,
  Filter,
} from 'lucide-react'
import { Chip } from '@/design-system/primitives/Chip'

export interface FilterBarProps {
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  selectedDateFilter: string
  onSelectDateFilter: (dateFilter: string) => void
  onlyWithCertificates: boolean
  onToggleCertificates: () => void
  activeClubId?: string
  onSelectClub?: (clubId: string) => void
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedDateFilter,
  onSelectDateFilter,
  onlyWithCertificates,
  onToggleCertificates,
}) => {
  const categories = [
    { id: 'ALL', label: 'All Categories', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'HACKATHON', label: 'Hackathons', icon: <Trophy className="h-3.5 w-3.5 text-brand-red" /> },
    { id: 'WORKSHOP', label: 'Workshops', icon: <GraduationCap className="h-3.5 w-3.5 text-brand-blue" /> },
    { id: 'TALK', label: 'Tech Talks', icon: <Mic className="h-3.5 w-3.5 text-brand-purple" /> },
    { id: 'COMPETITION', label: 'Competitions', icon: <Flame className="h-3.5 w-3.5 text-brand-amber" /> },
  ]

  const dateFilters = [
    { id: 'ALL', label: 'All Dates' },
    { id: 'TODAY', label: 'Today' },
    { id: 'TOMORROW', label: 'Tomorrow' },
    { id: 'WEEKEND', label: 'This Weekend' },
  ]

  return (
    <section className="sticky top-16 z-30 bg-white/80 backdrop-blur-md border-y border-slate-200/80 py-3 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 overflow-x-auto hide-scrollbar">
        {/* Category Pills (BookMyShow style) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {categories.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.label}
              icon={cat.icon}
              active={selectedCategory === cat.id}
              onClick={() => onSelectCategory(cat.id)}
            />
          ))}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 flex-shrink-0 hidden md:block" />

        {/* Date Filter Chips & Toggles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {dateFilters.map((df) => (
            <button
              key={df.id}
              type="button"
              onClick={() => onSelectDateFilter(df.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                selectedDateFilter === df.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {df.label}
            </button>
          ))}

          {/* Certificate Toggle */}
          <button
            type="button"
            onClick={onToggleCertificates}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
              onlyWithCertificates
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold'
                : 'text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-emerald-600" />
            <span>Certified Only</span>
          </button>
        </div>
      </div>
    </section>
  )
}
