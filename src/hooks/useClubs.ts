import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Organizer } from '@/api'

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: () => api.clubs.getClubs(),
  })
}

export function useClub(slugOrId: string) {
  return useQuery({
    queryKey: ['club', slugOrId],
    queryFn: async () => {
      const bySlug = await api.clubs.getClubBySlug(slugOrId)
      if (bySlug) return bySlug
      return api.clubs.getClubById(slugOrId)
    },
    enabled: Boolean(slugOrId),
  })
}

export function useUpdateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Organizer> }) =>
      api.clubs.updateClub(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(['club', updated.slug], updated)
      queryClient.setQueryData(['club', updated.id], updated)
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
    },
  })
}

export function useToggleFollowClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clubId: string) => api.clubs.toggleFollow(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
    },
  })
}
