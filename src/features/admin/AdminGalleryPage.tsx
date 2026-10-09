import React, { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { usePermission } from '@/hooks/usePermission'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, OrganizerGalleryItem } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminGalleryPage: React.FC = () => {
  const { clubId } = usePermission()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: gallery = [], isLoading } = useQuery({
    queryKey: ['admin-gallery', clubId],
    queryFn: () => api.gallery.getGallery(clubId || undefined),
  })

  const addMutation = useMutation({
    mutationFn: (item: Omit<OrganizerGalleryItem, 'id'>) => api.gallery.addGalleryItem(item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => api.gallery.removeGalleryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
    },
  })

  const [url, setUrl] = useState('')
  const [caption, setCaption] = useState('')

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    try {
      await addMutation.mutateAsync({
        url,
        caption: caption || undefined,
      })
      toast({ title: 'Photo Added to Archive', type: 'success' })
      setUrl('')
      setCaption('')
    } catch {
      toast({ title: 'Upload failed', type: 'error' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await removeMutation.mutateAsync(id)
      toast({ title: 'Photo Removed', type: 'info' })
    } catch {
      toast({ title: 'Removal failed', type: 'error' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="pb-4 border-b border-line">
        <span className="text-caption font-semibold text-accent block mb-0.5">
          Visual Archive Management
        </span>
        <h1 className="text-h2 font-semibold text-text">
          Exhibition Gallery Archive
        </h1>
        <p className="text-small text-text-2 mt-0.5">
          Curate documentary photography, showcase laureate winners, and manage exhibition media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Form */}
        <form onSubmit={handleAddPhoto} className="lg:col-span-5 p-5 bg-surface border border-line rounded-panel space-y-4">
          <h3 className="text-h3 font-semibold text-text">
            Archive New Photograph
          </h3>

          <Field
            surface="admin"
            label="Image URL"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />

          <Field
            surface="admin"
            label="Archival Caption / Laurel Tag"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. First place team receiving Turing grand prize"
          />

          {url && (
            <div className="pt-1">
              <span className="text-caption text-text-3 block mb-1">Preview</span>
              <img src={url} alt="Preview" className="max-h-40 rounded-btn object-cover border border-line" />
            </div>
          )}

          <Button
            type="submit"
            surface="admin"
            size="sm"
            fullWidth
            loading={addMutation.isPending}
            icon={<Plus className="h-4 w-4" />}
          >
            Append to Archive
          </Button>
        </form>

        {/* Gallery Grid */}
        <div className="lg:col-span-7 p-5 bg-surface border border-line rounded-panel space-y-3">
          <h3 className="text-h3 font-semibold text-text pb-2 border-b border-line">
            Archived Photographs ({gallery.length})
          </h3>

          {isLoading ? (
            <p className="text-small text-text-3 py-4 text-center">Reading gallery...</p>
          ) : gallery.length === 0 ? (
            <p className="text-small text-text-3 py-4 text-center">No photography records found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
              {gallery.map((g) => (
                <div key={g.id} className="border border-line rounded-panel bg-subtle overflow-hidden">
                  <img src={g.url} alt={g.caption || 'Photo'} className="w-full aspect-[4/3] object-cover" loading="lazy" />
                  <div className="p-2.5 bg-surface flex items-center justify-between text-small border-t border-line">
                    <p className="truncate max-w-[180px] text-caption text-text-2">
                      {g.caption || 'Untitled photograph'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id)}
                      className="text-text-3 hover:text-danger p-1 rounded-btn transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
