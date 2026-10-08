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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl bg-white border border-[#DADCE0] rounded-3xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#DADCE0]">
              <Search className="h-5 w-5 text-md-primary flex-shrink-0" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, clubs, hackathons, notices..."
                className="w-full bg-transparent font-body text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400 border border-slate-200 bg-slate-50 px-2 py-0.5 rounded-md hidden sm:inline">
                ESC
              </span>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {isSearching && (
                <p className="text-xs text-slate-500 py-4 text-center">
                  Searching index...
                </p>
              )}

              {!query.trim() && (
                <div className="py-8 text-center">
                  <p className="text-xs font-semibold text-md-primary mb-1">
                    Instant Search
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Type keywords to locate specific events, participating clubs, or official announcements.
                  </p>
                </div>
              )}

              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <Calendar className="h-3.5 w-3.5 text-md-primary" />
                    <span>Events & Masterclasses ({results.events.length})</span>
                  </h4>
                  <div className="divide-y divide-[#DADCE0] rounded-xl border border-[#DADCE0] overflow-hidden">
                    {results.events.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3 px-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 group-hover:text-md-primary transition-colors">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-md-primary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs Section */}
              {results.clubs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <Users className="h-3.5 w-3.5 text-md-primary" />
                    <span>Clubs & Collectives ({results.clubs.length})</span>
                  </h4>
                  <div className="divide-y divide-[#DADCE0] rounded-xl border border-[#DADCE0] overflow-hidden">
                    {results.clubs.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3 px-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-900 group-hover:text-md-primary transition-colors">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-md-primary flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements Section */}
              {results.announcements.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                    <Megaphone className="h-3.5 w-3.5 text-md-primary" />
                    <span>Announcements ({results.announcements.length})</span>
                  </h4>
                  <div className="divide-y divide-[#DADCE0] rounded-xl border border-[#DADCE0] overflow-hidden">
                    {results.announcements.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3 px-3.5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors group"
                      >
                        <div>
                          <p className="font-semibold text-sm text-slate-900 group-hover:text-md-primary transition-colors">
                            {item.title}
                          </p>
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F1F3F4] text-slate-600 mt-1">
                            {item.subtitle}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-md-primary flex-shrink-0" />
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
                  <div className="py-8 text-center text-xs text-slate-500">
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
