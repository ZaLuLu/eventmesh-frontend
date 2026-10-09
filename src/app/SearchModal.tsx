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
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-text/40"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-2xl bg-surface border border-line rounded-panel shadow-floating flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Search Input Bar (48px input, 10px radius) */}
            <div className="p-4 border-b border-line">
              <div className="flex items-center gap-3 px-3.5 h-12 bg-subtle rounded-[10px] border border-line">
                <Search className="h-5 w-5 text-accent flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, clubs, announcements..."
                  className="w-full bg-transparent text-small text-text placeholder:text-text-3 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 text-text-3 hover:text-text transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <span className="text-caption font-mono text-text-3 px-2 py-0.5 rounded-[6px] bg-surface border border-line hidden sm:inline">
                  ESC
                </span>
              </div>
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isSearching && (
                <div className="py-8 text-center text-small text-text-3">
                  Searching catalog...
                </div>
              )}

              {!isSearching && query && !hasResults && (
                <div className="py-8 text-center text-small text-text-2">
                  No matching results for "{query}". Try a different keyword.
                </div>
              )}

              {!isSearching && !query && (
                <div className="py-6 text-center text-small text-text-3">
                  Type a keyword to discover events, technical clubs, or announcements.
                </div>
              )}

              {/* Events Section */}
              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-caption font-semibold text-text-2">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>Events ({results.events.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.events.map((evt) => (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => handleSelect(evt.url)}
                        className="w-full text-left p-3 rounded-[8px] hover:bg-subtle transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-small font-semibold text-text group-hover:text-accent truncate">
                            {evt.title}
                          </p>
                          {evt.subtitle && (
                            <p className="text-caption text-text-2 truncate">
                              {evt.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-text-3 group-hover:text-accent flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs Section */}
              {results.clubs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-caption font-semibold text-text-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span>Clubs & Collectives ({results.clubs.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.clubs.map((club) => (
                      <button
                        key={club.id}
                        type="button"
                        onClick={() => handleSelect(club.url)}
                        className="w-full text-left p-3 rounded-[8px] hover:bg-subtle transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-4">
                          <span
                            className="h-2.5 w-2.5 rounded-full flex-shrink-0 bg-accent"
                            aria-hidden="true"
                          />
                          <div className="truncate">
                            <p className="text-small font-semibold text-text group-hover:text-accent truncate">
                              {club.title}
                            </p>
                            {club.subtitle && (
                              <p className="text-caption text-text-2 truncate">
                                {club.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-text-3 group-hover:text-accent flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements Section */}
              {results.announcements.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2 text-caption font-semibold text-text-2">
                    <Megaphone className="h-4 w-4 text-accent" />
                    <span>Announcements ({results.announcements.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.announcements.map((ann) => (
                      <button
                        key={ann.id}
                        type="button"
                        onClick={() => handleSelect(ann.url || '/announcements')}
                        className="w-full text-left p-3 rounded-[8px] hover:bg-subtle transition-colors flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-small font-semibold text-text group-hover:text-accent truncate">
                            {ann.title}
                          </p>
                          {ann.subtitle && (
                            <p className="text-caption text-text-2 truncate">
                              {ann.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-text-3 group-hover:text-accent flex-shrink-0" />
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
