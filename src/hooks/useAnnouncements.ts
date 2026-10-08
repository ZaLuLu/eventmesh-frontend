import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Announcement } from '@/api'

export function useAnnouncements(filter?: {
  orgId?: string
  organizerId?: string
  kind?: string
}) {
  return useQuery({
    queryKey: ['announcements', filter],
    queryFn: () => api.announcements.getAnnouncements(filter),
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ann: Partial<Announcement>) => api.announcements.createAnnouncement(ann),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.announcements.deleteAnnouncement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}
