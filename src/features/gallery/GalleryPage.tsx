import React, { useState } from 'react'
import { useClubs } from '@/hooks/useClubs'
import { EmptyState } from '@/design-system/primitives/EmptyState'
import { X, ZoomIn } from 'lucide-react'

export const GalleryPage: React.FC = () => {
  const { data: clubs = [], isLoading } = useClubs()
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption?: string; clubName?: string } | null>(null)

  const allPhotos = clubs.flatMap((c) =>
    c.gallery.map((g) => ({ ...g, clubName: c.name, clubColor: c.color }))
  )

  return (
    <div className="w-full bg-[#EEF2F6] text-slate-800 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="border-b border-slate-200/60 pb-8 pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <span className="text-xs font-bold text-gradient-feral uppercase tracking-wider block mb-1">
            Community Moments
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Event Gallery
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl font-medium">
            Moments captured from hackathons, robotic arenas, build sprints, and tech talks across clubs.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-slate-500 animate-pulse">
            Loading photo gallery...
          </div>
        ) : allPhotos.length === 0 ? (
          <EmptyState title="No Photography Available" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPhotos.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="group rounded-3xl border border-white/80 bg-[#EEF2F6] shadow-neo-card hover:shadow-neo-card-hover transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] m-3 rounded-2xl overflow-hidden bg-slate-200/60 shadow-neo-inset">
                  <img
                    src={item.url}
                    alt={item.caption || 'Event image'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[2px]">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>

                <div className="px-5 pb-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">
                    {item.clubName}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-[#EEF2F6] shadow-neo-sm px-2 py-0.5 rounded-full border border-white/60">
                    #{idx + 1}
                  </span>
                </div>

                {item.caption && (
                  <p className="px-5 pb-5 text-xs text-slate-500 line-clamp-2">
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 p-4 sm:p-8 flex flex-col items-center justify-center cursor-pointer"
        >
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close photo"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={activePhoto.url}
            alt={activePhoto.caption || 'Expanded photograph'}
            className="max-w-5xl max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {activePhoto.caption && (
            <p className="mt-4 text-xs font-medium text-white/90 max-w-xl text-center bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm">
              {activePhoto.clubName} · {activePhoto.caption}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
