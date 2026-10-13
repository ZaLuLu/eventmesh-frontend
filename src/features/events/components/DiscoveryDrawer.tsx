import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  X,
  MagnifyingGlass,
  Funnel,
  Check,
  CalendarBlank,
  ArrowRight,
  Sparkle,
  Compass,
} from '@/design-system/Icon'
import { EventType } from '@/api/contracts'
import { cn } from '@/lib/utils'

interface DiscoveryDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const CATEGORIES: { id: EventType | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All Sessions', icon: '✦' },
  { id: 'hackathon', label: 'Hackathons', icon: '⚡' },
  { id: 'workshop', label: 'Workshops', icon: '🛠️' },
  { id: 'competition', label: 'Competitions', icon: '🏆' },
  { id: 'talk', label: 'Keynotes & Talks', icon: '🎙️' },
  { id: 'other', label: 'Salons & Meetups', icon: '☕' },
]

const CLUBS = [
  { id: 'club-cp', name: 'CP Club', color: '#2F4BD6', domain: 'Algorithms & Systems' },
  { id: 'club-ai', name: 'AIONAI', color: '#7B63A8', domain: 'Neural Networks' },
  { id: 'club-birds', name: 'BIRDS', color: '#6F8468', domain: 'Robotics & Swarms' },
  { id: 'club-devcraft', name: 'DevCraft', color: '#C66A4A', domain: 'Full-Stack Architecture' },
]

export const DiscoveryDrawer: React.FC<DiscoveryDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const drawerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeCategory = searchParams.get('category') || 'all'
  const activeClub = searchParams.get('club') || 'all'
  const isFreeOnly = searchParams.get('free') === 'true'
  const currentSearch = searchParams.get('q') || ''

  const [query, setQuery] = useState(currentSearch)

  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

  // Accessibility: Focus trap & Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    const timeout = setTimeout(() => {
      inputRef.current?.focus()
    }, 150)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      clearTimeout(timeout)
    }
  }, [isOpen, onClose])

  const applyFilter = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams)
    if (value === 'all' || value === false || value === '') {
      params.delete(key)
    } else {
      params.set(key, String(value))
    }
    navigate(`/explore?${params.toString()}`)
    onClose()
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilter('q', query.trim())
  }

  const handleReset = () => {
    setQuery('')
    navigate('/explore')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Event Discovery Navigation">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 max-w-md w-full bg-[var(--paper)] border-r border-[var(--line)] shadow-2xl flex flex-col z-50 text-[var(--ink)] select-none"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-[var(--line)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold text-xs">
                  <Funnel size={16} weight="bold" />
                </div>
                <div>
                  <h2 className="font-sans font-bold text-base tracking-tight text-ink">Discover Events</h2>
                  <p className="text-[11px] font-mono text-ink-soft">Filter by domain, collective, and format</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-[var(--surface-subtle)] text-ink-soft hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close navigation"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <MagnifyingGlass
                  size={15}
                  weight="bold"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search keywords, topics..."
                  className="w-full h-10 pl-9.5 pr-4 rounded-xl bg-card border border-line text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors font-sans"
                />
              </form>

              {/* Event Genres / Categories */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-ink-soft uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkle size={13} weight="bold" />
                    Categories
                  </span>
                  {activeCategory !== 'all' && (
                    <button
                      type="button"
                      onClick={() => applyFilter('category', 'all')}
                      className="text-[11px] font-mono text-accent hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = activeCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => applyFilter('category', cat.id)}
                        className={cn(
                          'p-3 rounded-xl text-left border transition-all flex items-center gap-2.5',
                          isSelected
                            ? 'bg-ink text-paper border-ink font-semibold shadow-xs'
                            : 'bg-card border-line/70 hover:bg-surface-subtle text-ink font-normal'
                        )}
                      >
                        <span className="text-sm">{cat.icon}</span>
                        <span className="text-xs truncate">{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Organizing Clubs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-ink-soft uppercase tracking-wider flex items-center gap-1.5">
                    <Compass size={13} weight="bold" />
                    Student Collectives
                  </span>
                  {activeClub !== 'all' && (
                    <button
                      type="button"
                      onClick={() => applyFilter('club', 'all')}
                      className="text-[11px] font-mono text-accent hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  {CLUBS.map((club) => {
                    const isSelected = activeClub === club.id
                    return (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => applyFilter('club', isSelected ? 'all' : club.id)}
                        className={cn(
                          'w-full p-2.5 rounded-xl text-left border transition-all flex items-center justify-between',
                          isSelected
                            ? 'bg-card border-accent shadow-xs'
                            : 'bg-card/50 border-line/60 hover:bg-card text-ink'
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: club.color }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-ink truncate">{club.name}</p>
                            <p className="text-[10px] text-ink-soft font-mono truncate">{club.domain}</p>
                          </div>
                        </div>

                        {isSelected && (
                          <Check size={14} weight="bold" className="text-accent flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Quick Pricing Toggle */}
              <div className="p-3.5 rounded-xl bg-card border border-line flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-ink block">Free Entry Only</span>
                  <span className="text-[10px] text-ink-soft font-mono">Filter sessions with zero fee</span>
                </div>
                <button
                  type="button"
                  onClick={() => applyFilter('free', !isFreeOnly)}
                  className={cn(
                    'w-11 h-6 rounded-full transition-colors relative p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    isFreeOnly ? 'bg-accent' : 'bg-line'
                  )}
                  aria-pressed={isFreeOnly}
                  aria-label="Toggle free entry only"
                >
                  <span
                    className={cn(
                      'block w-5 h-5 rounded-full bg-white shadow-xs transition-transform',
                      isFreeOnly ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
            </div>

            {/* Footer with Reset and Action */}
            <div className="px-6 py-4 border-t border-[var(--line)] bg-[var(--paper-2)]/50 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-mono text-ink-soft hover:text-ink transition-colors"
              >
                Reset all
              </button>

              <button
                type="button"
                onClick={() => {
                  navigate(`/explore?${searchParams.toString()}`)
                  onClose()
                }}
                className="btn-minimal-primary px-5 py-2 text-xs gap-1.5"
              >
                <span>View Results</span>
                <ArrowRight size={12} weight="bold" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default DiscoveryDrawer
