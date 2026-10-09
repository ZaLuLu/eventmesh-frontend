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
    <div className="w-full bg-bg text-text min-h-screen pb-16">
      {/* Header Banner */}
      <div className="border-b border-line pb-8 pt-8">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-caption font-semibold text-accent block mb-1">
            Community moments
          </span>
          <h1 className="text-h1 font-semibold text-text">
            Event Gallery
          </h1>
          <p className="text-body text-text-2 mt-1 max-w-xl">
            Moments captured from hackathons, robotic arenas, build sprints, and tech talks across clubs.
          </p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="py-16 text-center text-small text-text-3">
            Loading photo gallery...
          </div>
        ) : allPhotos.length === 0 ? (
          <EmptyState title="No photography available" description="Event photographs will appear here as clubs upload their highlights." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {allPhotos.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="group rounded-panel border border-line bg-surface overflow-hidden flex flex-col justify-between hover:border-text-3 transition-colors cursor-pointer"
              >
                <div className="relative aspect-[4/3] bg-subtle overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.caption || 'Event image'}
                    className="w-full h-full object-cover group-hover:opacity-95 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-text/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-accent">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between text-caption text-text-3">
                    <span className="font-semibold text-text truncate max-w-[200px]">
                      {item.clubName}
                    </span>
                    <span>#{idx + 1}</span>
                  </div>

                  {item.caption && (
                    <p className="text-small text-text-2 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-text/90 p-4 sm:p-8 flex flex-col items-center justify-center cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-btn bg-surface/20 hover:bg-surface/30 text-surface transition-colors"
            aria-label="Close photo"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={activePhoto.url}
            alt={activePhoto.caption || 'Expanded photograph'}
            className="max-w-5xl max-h-[80vh] object-contain rounded-panel"
            onClick={(e) => e.stopPropagation()}
          />

          {activePhoto.caption && (
            <p className="mt-4 text-small text-surface max-w-xl text-center bg-text/80 px-4 py-2 rounded-btn">
              {activePhoto.clubName} · {activePhoto.caption}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
