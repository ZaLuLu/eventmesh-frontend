import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

export function useCheckinTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketCode, eventId }: { ticketCode: string; eventId?: string }) =>
      api.checkin.checkinTicket(ticketCode, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['checkin-stats'] })
    },
  })
}

export function useUndoCheckin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) => api.checkin.undoCheckin(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['checkin-stats'] })
    },
  })
}

export function useCheckinStats(eventId: string) {
  return useQuery({
    queryKey: ['checkin-stats', eventId],
    queryFn: () => api.checkin.getCheckinStats(eventId),
    enabled: Boolean(eventId),
    refetchInterval: 5000,
  })
}
