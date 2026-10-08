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
            className="relative z-10 w-full max-w-2xl bg-[#EEF2F6] border border-white/80 rounded-3xl shadow-neo-card flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Search Input Bar (Debossed Capsule) */}
            <div className="p-4 sm:p-5 border-b border-slate-200/60">
              <div className="flex items-center gap-3 px-4 py-3 bg-[#EEF2F6] shadow-neo-inset rounded-2xl border border-white/50">
                <Search className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search events, collectives, masterclasses, notices..."
                  className="w-full bg-transparent font-body text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <span className="text-[10px] uppercase font-mono font-bold text-slate-500 bg-[#EEF2F6] shadow-neo-sm px-2.5 py-1 rounded-lg border border-white/60 hidden sm:inline">
                  ESC
                </span>
              </div>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {isSearching && (
                <p className="text-xs text-slate-500 py-4 text-center animate-pulse">
                  Searching index...
                </p>
              )}

              {!query.trim() && (
                <div className="py-8 text-center">
                  <p className="text-xs font-bold text-gradient-feral uppercase tracking-wider mb-1">
                    Instant Search
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Type keywords to locate live happenings, community collectives, or official announcements.
                  </p>
                </div>
              )}

              {/* Events Section */}
              {results.events.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
                    <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Events & Masterclasses ({results.events.length})</span>
                  </h4>
                  <div className="divide-y divide-slate-200/50 rounded-2xl border border-white/80 bg-[#EEF2F6] shadow-neo-sm overflow-hidden">
                    {results.events.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3.5 px-4 flex items-center justify-between hover:bg-white/40 transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clubs Section */}
              {results.clubs.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
                    <Users className="h-3.5 w-3.5 text-purple-500" />
                    <span>Collectives & Studios ({results.clubs.length})</span>
                  </h4>
                  <div className="divide-y divide-slate-200/50 rounded-2xl border border-white/80 bg-[#EEF2F6] shadow-neo-sm overflow-hidden">
                    {results.clubs.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3.5 px-4 flex items-center justify-between hover:bg-white/40 transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-800 group-hover:text-purple-600 transition-colors">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements Section */}
              {results.announcements.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 px-1">
                    <Megaphone className="h-3.5 w-3.5 text-pink-500" />
                    <span>Bulletins & Notices ({results.announcements.length})</span>
                  </h4>
                  <div className="divide-y divide-slate-200/50 rounded-2xl border border-white/80 bg-[#EEF2F6] shadow-neo-sm overflow-hidden">
                    {results.announcements.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.url)}
                        className="w-full text-left py-3.5 px-4 flex items-center justify-between hover:bg-white/40 transition-colors group"
                      >
                        <div>
                          <p className="font-bold text-sm text-slate-800 group-hover:text-pink-600 transition-colors">
                            {item.title}
                          </p>
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF2F6] shadow-neo-inset text-slate-600 mt-1">
                            {item.subtitle}
                          </span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-pink-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
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
