import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Calendar, Users, Megaphone, ArrowUpRight } from 'lucide-react'
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
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Trigger open
        }
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/70"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl bg-paper border-2 border-ink text-ink flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-ink">
              <Search className="h-5 w-5 text-ink-60 flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search symposiums, clubs, hackathons, notices..."
                className="w-full bg-transparent font-body text-base text-ink placeholder:text-ink-60/60 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-ink-60 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="font-mono text-[10px] uppercase text-ink-60 border border-ink-15 px-1.5 py-0.5 hidden sm:inline">
                ESC
              </span>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {isSearching && (
                <p className="font-mono text-xs uppercase tracking-wide text-ink-60 py-4 text-center">
                  Searching index...
                </p>
              )}

              {!query.trim() && (
                <div className="py-8 text-center">
                  <p className="font-mono text-xs uppercase tracking-widecaps text-ink-60 mb-2">
                    Global Exhibition Search
                  </p>
                  <p className="font-body text-sm text-ink max-w-sm mx-auto">
                    Type keywords to locate specific events, participating clubs, or official announcements.
                  </p>
                </div>
              )}

              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widecaps text-ink-60 mb-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Events & Masterclasses ({results.events.length})</span>
                  </h4>
                  <div className="divide-y divide-ink-15 border-t border-b border-ink-15">
                    {results.events.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3 px-2 flex items-center justify-between hover:bg-paper-deep transition-colors group"
                      >
                        <div>
                          <p className="font-display text-base text-ink uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="font-mono text-[11px] text-ink-60 uppercase tracking-wide mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-ink-60 group-hover:text-ink flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs Section */}
              {results.clubs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widecaps text-ink-60 mb-2">
                    <Users className="h-3.5 w-3.5" />
                    <span>Clubs & Collectives ({results.clubs.length})</span>
                  </h4>
                  <div className="divide-y divide-ink-15 border-t border-b border-ink-15">
                    {results.clubs.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3 px-2 flex items-center justify-between hover:bg-paper-deep transition-colors group"
                      >
                        <div>
                          <p className="font-display text-base text-ink uppercase tracking-tight group-hover:translate-x-1 transition-transform">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="font-mono text-[11px] text-ink-60 uppercase tracking-wide mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-ink-60 group-hover:text-ink flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements Section */}
              {results.announcements.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widecaps text-ink-60 mb-2">
                    <Megaphone className="h-3.5 w-3.5" />
                    <span>Announcements ({results.announcements.length})</span>
                  </h4>
                  <div className="divide-y divide-ink-15 border-t border-b border-ink-15">
                    {results.announcements.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3 px-2 flex items-center justify-between hover:bg-paper-deep transition-colors group"
                      >
                        <div>
                          <p className="font-body text-sm font-semibold text-ink">
                            {item.title}
                          </p>
                          <span className="inline-block font-mono text-[10px] uppercase tracking-wide px-1.5 py-0.5 bg-paper-deep text-ink-60 mt-1">
                            {item.subtitle}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-ink-60 group-hover:text-ink flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {query.trim() &&
                !isSearching &&
                results.events.length === 0 &&
                results.clubs.length === 0 &&
                results.announcements.length === 0 && (
                  <div className="py-8 text-center font-mono text-xs text-ink-60 uppercase tracking-wide">
                    No results found for "{query}".
                  </div>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
