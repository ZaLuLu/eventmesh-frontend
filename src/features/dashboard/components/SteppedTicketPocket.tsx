import React from 'react'
import { Ticket, Certificate, ClockCounterClockwise, CheckCircle, ArrowRight, Sparkle } from '@phosphor-icons/react'
import { playTearImpulse } from '@/lib/sound'

export interface SteppedTicketItem {
  id: string
  title: string
  subtitle?: string
  date?: string
  category: 'passes' | 'honors' | 'keepsakes'
  status?: string
  code?: string
  isImminent?: boolean
}

export interface SteppedTicketPocketProps {
  items: SteppedTicketItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  activeCategory: 'passes' | 'honors' | 'keepsakes'
  onCategoryChange: (category: 'passes' | 'honors' | 'keepsakes') => void
  counts: {
    passes: number
    keepsakes: number
    honors: number
  }
  onExploreClick?: () => void
}

/**
 * SteppedTicketPocket:
 * Realistic physical first-class flight / travel jacket with stepped tiered ticket slots.
 * Features physical die-cut thumb notches, perforation perforations, and fluid elevation.
 */
export const SteppedTicketPocket: React.FC<SteppedTicketPocketProps> = ({
  items,
  selectedId,
  onSelect,
  activeCategory,
  onCategoryChange,
  counts,
  onExploreClick,
}) => {
  const handleItemClick = (id: string) => {
    playTearImpulse()
    onSelect(id)
  }

  return (
    <div className="w-full flex flex-col rounded-2xl bg-surface border border-line shadow-sm overflow-hidden">
      {/* 1. Folio Manila/Leather Tab Dividers */}
      <div className="grid grid-cols-3 bg-subtle border-b border-line p-1 gap-1 text-xs font-semibold select-none">
        <button
          type="button"
          onClick={() => onCategoryChange('passes')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'passes'
              ? 'bg-surface text-accent shadow-xs border border-line font-bold'
              : 'text-text-3 hover:text-text hover:bg-surface/50'
          }`}
        >
          <Ticket size={14} weight={activeCategory === 'passes' ? 'fill' : 'regular'} />
          <span>Passes ({counts.passes})</span>
        </button>

        <button
          type="button"
          onClick={() => onCategoryChange('keepsakes')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'keepsakes'
              ? 'bg-surface text-zinc-800 dark:text-zinc-200 shadow-xs border border-line font-bold'
              : 'text-text-3 hover:text-text hover:bg-surface/50'
          }`}
        >
          <ClockCounterClockwise size={14} weight={activeCategory === 'keepsakes' ? 'bold' : 'regular'} />
          <span>Archive ({counts.keepsakes})</span>
        </button>

        <button
          type="button"
          onClick={() => onCategoryChange('honors')}
          className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeCategory === 'honors'
              ? 'bg-surface text-amber-600 dark:text-amber-400 shadow-xs border border-line font-bold'
              : 'text-text-3 hover:text-text hover:bg-surface/50'
          }`}
        >
          <Certificate size={14} weight={activeCategory === 'honors' ? 'fill' : 'regular'} />
          <span>Honors ({counts.honors})</span>
        </button>
      </div>

      {/* 2. Physical Stepped Sleeve Interior */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4 min-h-[340px]">
        {items.length === 0 ? (
          /* Empty Pocket Slot with Leatherette Emboss */
          <div className="my-auto py-8 px-4 rounded-xl border border-dashed border-line text-center flex flex-col items-center justify-center space-y-3 bg-subtle/30">
            <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center text-text-3 shadow-2xs">
              {activeCategory === 'passes' && <Ticket size={20} />}
              {activeCategory === 'keepsakes' && <ClockCounterClockwise size={20} />}
              {activeCategory === 'honors' && <Certificate size={20} />}
            </div>

            <div className="space-y-1 max-w-[240px]">
              <p className="text-xs font-semibold text-text uppercase tracking-wider">
                {activeCategory === 'passes' && 'Pass Sleeve Clear'}
                {activeCategory === 'keepsakes' && 'Archive Empty'}
                {activeCategory === 'honors' && 'No Honors Issued'}
              </p>
              <p className="text-[11px] text-text-3 leading-relaxed">
                {activeCategory === 'passes' && 'No upcoming event passes tucked in your jacket.'}
                {activeCategory === 'keepsakes' && 'Events you attend will be permanently stored here.'}
                {activeCategory === 'honors' && 'Certified workshops & hackathons will confer verified PDFs here.'}
              </p>
            </div>

            {activeCategory === 'passes' && counts.keepsakes > 0 ? (
              <button
                type="button"
                onClick={() => onCategoryChange('keepsakes')}
                className="mt-2 text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <span>View {counts.keepsakes} Past Keepsakes ➔</span>
              </button>
            ) : onExploreClick ? (
              <button
                type="button"
                onClick={onExploreClick}
                className="mt-2 px-3 py-1.5 rounded-lg bg-surface border border-line hover:bg-subtle text-xs font-medium text-text shadow-2xs transition-colors"
              >
                Explore Campus Events
              </button>
            ) : null}
          </div>
        ) : (
          /* Stepped Tiered Pocket Stack */
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-text-3 px-1">
              <span className="uppercase font-semibold tracking-wider">
                {activeCategory === 'passes' && 'Tiered Passes in Sleeve'}
                {activeCategory === 'keepsakes' && 'Archived Event Records'}
                {activeCategory === 'honors' && 'Conferred Credentials'}
              </span>
              <span>Tap to mount</span>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => {
                const isSelected = selectedId === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`relative p-3.5 rounded-xl cursor-pointer transition-all duration-200 select-none overflow-hidden group ${
                      isSelected
                        ? 'bg-surface border-2 border-accent shadow-sm translate-y-[-2px] ring-2 ring-accent/20 z-10'
                        : 'bg-subtle/70 border border-line hover:border-line-strong hover:bg-surface hover:translate-y-[-1px] shadow-2xs'
                    }`}
                  >
                    {/* Stepped Ticket Die-Cut Notches */}
                    <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surface border-r border-line" />
                    <span className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-surface border-l border-line" />

                    <div className="flex items-center justify-between gap-3 pl-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.isImminent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span className="text-[10px] font-mono font-medium text-text-3 uppercase tracking-wide truncate">
                            {item.date || 'Campus Event'}
                          </span>
                          {item.status && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-subtle text-text-2 border border-line">
                              {item.status}
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-xs font-bold truncate mt-0.5 transition-colors ${
                            isSelected ? 'text-accent' : 'text-text group-hover:text-accent'
                          }`}
                        >
                          {item.title}
                        </h4>

                        {item.subtitle && (
                          <p className="text-[11px] text-text-3 truncate mt-0.5">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center">
                        <span
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                            isSelected
                              ? 'bg-accent text-white font-bold shadow-2xs'
                              : 'text-text-3 group-hover:text-text bg-surface/60 border border-line'
                          }`}
                        >
                          {isSelected ? 'In Hand ✓' : 'Pull ➔'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 3. Folio Bottom Debossed Foil Signature */}
        <div className="pt-3 border-t border-line/60 flex items-center justify-between text-[10px] font-mono text-text-3 uppercase tracking-wider">
          <span>EVENTMESH TRAVEL FOLIO</span>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/70" />
            <span>AUTHENTIC SLEEVE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
