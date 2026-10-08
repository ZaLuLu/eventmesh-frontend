import React, { useState } from 'react'
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePermission } from '@/hooks/usePermission'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, OrganizerGalleryItem } from '@/api'
import { Button } from '@/design-system/primitives/Button'
import { Field } from '@/design-system/primitives/Field'
import { useToast } from '@/design-system/primitives/Toast'

export const AdminGalleryPage: React.FC = () => {
  const { session } = useAuth()
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
    <div className="space-y-8">
      <div className="pb-6 border-b border-[#C9D0D4]">
        <span className="font-mono text-[10px] uppercase tracking-wide text-ink-60 block mb-1">
          Visual Archive Management
        </span>
        <h1 className="font-display text-3xl sm:text-4xl uppercase text-ink">
          Exhibition Gallery Archive
        </h1>
        <p className="font-body text-xs text-ink-60 mt-0.5">
          Curate documentary photography, showcase laureate winners, and manage exhibition media.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Form */}
        <form onSubmit={handleAddPhoto} className="lg:col-span-5 p-6 bg-paper border border-[#C9D0D4] space-y-4">
          <h3 className="font-display text-xl uppercase text-ink">
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
            <div className="pt-2">
              <span className="font-mono text-[10px] uppercase text-ink-60 block mb-1">Preview</span>
              <img src={url} alt="Preview" className="max-h-40 object-cover border border-[#C9D0D4]" />
            </div>
          )}

          <Button
            type="submit"
            surface="admin"
            size="md"
            fullWidth
            loading={addMutation.isPending}
            icon={<Plus className="h-4 w-4" />}
          >
            Append to Archive
          </Button>
        </form>

        {/* Gallery Grid */}
        <div className="lg:col-span-7 p-6 bg-paper border border-[#C9D0D4] space-y-4">
          <h3 className="font-display text-xl uppercase text-ink pb-3 border-b border-[#C9D0D4]">
            Archived Photographs ({gallery.length})
          </h3>

          {isLoading ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-4">Reading gallery...</p>
          ) : gallery.length === 0 ? (
            <p className="font-mono text-xs uppercase text-ink-60 py-4">No photography records found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto">
              {gallery.map((g) => (
                <div key={g.id} className="border border-[#C9D0D4] bg-[#E6EAEC]/20 overflow-hidden group">
                  <img src={g.url} alt={g.caption || 'Photo'} className="w-full aspect-[4/3] object-cover" />
                  <div className="p-3 bg-paper flex items-center justify-between text-xs">
                    <p className="truncate max-w-[180px] font-mono text-[11px] uppercase text-ink-60">
                      {g.caption || 'Untitled figure'}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id)}
                      className="text-ink-60 hover:text-[#A32828] p-1"
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
