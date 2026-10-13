// Hallmark macrostructure: Overlay-CommandPalette / Modern-Minimal
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { MagnifyingGlass, X, CalendarBlank, Users, Megaphone, ArrowUpRight } from '@/design-system/Icon'
import { api, SearchResults } from '@/api'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ events: [], clubs: [], announcements: [] })
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) {
      setResults({ events: [], clubs: [], announcements: [] })
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await api.search.search(query)
        setResults(res)
      } finally {
        setIsSearching(false)
      }
    }, 180)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleSelect = (url: string) => {
    onClose()
    navigate(url)
  }

  const hasResults =
    results.events.length > 0 ||
    results.clubs.length > 0 ||
    results.announcements.length > 0

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -6 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-xl bg-card border border-line rounded-2xl shadow-2xl flex flex-col max-h-[75vh] overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="p-3 border-b border-line bg-surface-subtle/50">
              <div className="flex items-center gap-3 px-3.5 h-11 bg-card rounded-xl border border-line/80 focus-within:border-accent">
                <MagnifyingGlass size={16} weight="bold" className="text-accent flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, clubs, collectives..."
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 text-ink-muted hover:text-ink transition-colors"
                  >
                    <X size={14} weight="bold" />
                  </button>
                )}
                <span className="text-[10px] font-mono text-ink-muted px-1.5 py-0.5 rounded bg-surface-subtle border border-line hidden sm:inline">
                  ESC
                </span>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {isSearching && (
                <div className="py-8 text-center text-xs text-ink-muted font-mono">
                  Searching index...
                </div>
              )}

              {!isSearching && query && !hasResults && (
                <div className="py-8 text-center text-xs text-ink-soft">
                  No matching results for "{query}".
                </div>
              )}

              {!isSearching && !query && (
                <div className="py-6 text-center text-xs text-ink-muted">
                  Type a keyword to discover events, hackathons, or campus clubs.
                </div>
              )}

              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-2 text-[11px] font-mono uppercase tracking-wider text-accent">
                    <CalendarBlank size={12} weight="bold" />
                    <span>Events ({results.events.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.events.map((evt) => (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => handleSelect(evt.url)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-semibold text-ink group-hover:text-accent truncate">
                            {evt.title}
                          </p>
                          {evt.subtitle && (
                            <p className="text-[11px] text-ink-muted truncate mt-0.5">
                              {evt.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight size={13} weight="bold" className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs Section */}
              {results.clubs.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2 px-2 text-[11px] font-mono uppercase tracking-wider text-accent">
                    <Users size={12} weight="bold" />
                    <span>Clubs ({results.clubs.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.clubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => handleSelect(club.url)}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-surface-subtle transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-accent/10 text-accent font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {club.title[0]}
                          </div>
                          <span className="text-xs font-semibold text-ink group-hover:text-accent truncate">
                            {club.title}
                          </span>
                        </div>
                        <ArrowUpRight size={13} weight="bold" className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
