import React, { useState } from 'react'
import { Pin, Filter, Megaphone } from 'lucide-react'
import { useAnnouncements } from '@/hooks/useAnnouncements'
import { Chip } from '@/design-system/primitives/Chip'
import { formatDate } from '@/lib/dates'

export const AnnouncementsPage: React.FC = () => {
  const [selectedKind, setSelectedKind] = useState('all')
  const { data: announcements = [], isLoading } = useAnnouncements()

  const kinds = [
    { id: 'all', label: 'All Notices' },
    { id: 'notice', label: 'Notices' },
    { id: 'deadline', label: 'Deadlines' },
    { id: 'event_change', label: 'Schedule Changes' },
    { id: 'result', label: 'Results' },
    { id: 'general', label: 'General' },
  ]

  const filtered = announcements.filter((a) => {
    if (selectedKind !== 'all' && a.kind !== selectedKind) return false
    return true
  })

  return (
    <div className="w-full bg-canvas text-md-on-surface min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-white border-b border-[#DADCE0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <span className="text-xs font-semibold text-md-primary block mb-1">
            Official Broadcasts
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Announcements & Notices
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
            Important communications, application deadlines, room updates, and results from clubs.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 border-t border-[#DADCE0]">
          {kinds.map((k) => (
            <Chip
              key={k.id}
              label={k.label}
              size="sm"
              active={selectedKind === k.id}
              onClick={() => setSelectedKind(k.id)}
            />
          ))}
        </div>
      </div>

      {/* Announcements List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading announcements...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#DADCE0] bg-white p-12 text-center text-xs text-slate-500">
            No notices found under this filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#DADCE0] bg-white p-6 sm:p-8 shadow-subtle hover:shadow-card-hover transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {item.pinned && (
                  <span className="inline-flex items-center gap-1 bg-md-primary-container text-md-primary px-2.5 py-0.5 rounded-full font-bold">
                    <Pin className="h-3 w-3" />
                    <span>PINNED</span>
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-[#F1F3F4] text-slate-700 font-semibold capitalize">
                  {item.kind.replace('_', ' ')}
                </span>
                {item.organizerName && (
                  <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.organizerColor || '#1A73E8' }}
                    />
                    <span>{item.organizerName}</span>
                  </span>
                )}
                <span className="text-slate-300">·</span>
                <span className="text-slate-500">{formatDate(item.publishedAt)}</span>
              </div>

              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900">
                {item.title}
              </h3>

              <p className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line max-w-4xl font-body">
                {item.body}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
