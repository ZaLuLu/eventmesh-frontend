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
    <div className="w-full bg-paper text-ink min-h-screen">
      <div className="px-[4vw] pt-12 pb-8 border-b border-ink-15">
        <span className="font-mono text-[11px] uppercase tracking-widecaps text-ink-60 block mb-2">
          Archival Photography & Artifacts
        </span>
        <h1 className="font-display text-5xl sm:text-7xl uppercase text-ink">
          Exhibition Gallery
        </h1>
        <p className="font-body text-base text-ink-60 max-w-xl mt-3">
          Documentary records from autonomous robot arenas, algorithmic coding sprints, hardware fabrication labs, and symposiums.
        </p>
      </div>

      <div className="px-[4vw] py-12">
        {isLoading ? (
          <div className="py-20 text-center font-mono text-xs uppercase text-ink-60">
            Developing Archival Negatives...
          </div>
        ) : allPhotos.length === 0 ? (
          <EmptyState title="No Photography Archived" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPhotos.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActivePhoto(item)}
                className="group border border-ink-15 bg-paper-deep/30 cursor-pointer overflow-hidden flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                  <img
                    src={item.url}
                    alt={item.caption || 'Exhibition documentary image'}
                    className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-paper">
                    <ZoomIn className="h-6 w-6" />
                  </div>
                </div>

                <div className="p-4 border-t border-ink-15 bg-paper flex items-center justify-between font-mono text-[11px] uppercase">
                  <span className="font-semibold text-ink truncate max-w-[200px]">
                    {item.clubName}
                  </span>
                  <span className="text-ink-60">FIG. 0{idx + 1}</span>
                </div>

                {item.caption && (
                  <p className="px-4 pb-4 font-body text-xs text-ink-60 line-clamp-2">
                    {item.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Dialog with Keyboard Support */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 bg-ink/90 p-4 sm:p-8 flex flex-col items-center justify-center"
        >
          <button
            type="button"
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2 text-paper hover:text-white"
            aria-label="Close photo"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={activePhoto.url}
            alt={activePhoto.caption || 'Expanded photograph'}
            className="max-w-5xl max-h-[80vh] object-contain border-2 border-paper"
            onClick={(e) => e.stopPropagation()}
          />

          {activePhoto.caption && (
            <p className="mt-4 font-mono text-xs uppercase tracking-wide text-paper max-w-xl text-center">
              {activePhoto.clubName} · {activePhoto.caption}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
