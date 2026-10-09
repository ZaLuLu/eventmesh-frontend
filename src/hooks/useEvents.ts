import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, Event, EventsFilter } from '@/api'

export function useEvents(filter?: EventsFilter) {
  return useQuery({
    queryKey: ['events', filter],
    queryFn: () => api.events.getEvents(filter),
  })
}

export function useEvent(slugOrId: string) {
  return useQuery({
    queryKey: ['event', slugOrId],
    queryFn: async () => {
      // First try slug, then fallback to id
      const bySlug = await api.events.getEventBySlug(slugOrId)
      if (bySlug) return bySlug
      return api.events.getEventById(slugOrId)
    },
    enabled: Boolean(slugOrId),
  })
}

export function useUpcomingRail() {
  return useQuery({
    queryKey: ['events', 'upcoming-rail'],
    queryFn: () => api.events.getUpcomingRail(),
  })
}

export function useFeaturedEvents() {
  return useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => api.events.getFeaturedEvents(),
  })
}

export function usePromotedEvents() {
  return useQuery({
    queryKey: ['events', 'promoted'],
    queryFn: () => (api.events.listPromoted ? api.events.listPromoted() : api.events.getFeaturedEvents()),
  })
}

export function useNewestEvents(params?: { limit?: number; cursor?: string }) {
  return useQuery({
    queryKey: ['events', 'newest', params],
    queryFn: () => (api.events.listNewest ? api.events.listNewest(params) : api.events.getEvents()),
  })
}

export function useAdminEvents(scope: { orgId: string; clubId?: string }) {
  return useQuery({
    queryKey: ['admin', 'events', scope],
    queryFn: () => api.eventsAdmin.getAdminEvents(scope),
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventData: Partial<Event>) => api.eventsAdmin.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Event> }) =>
      api.eventsAdmin.updateEvent(id, updates),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(['event', updatedEvent.slug], updatedEvent)
      queryClient.setQueryData(['event', updatedEvent.id], updatedEvent)
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}

export function usePublishEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.eventsAdmin.publishEvent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
    },
  })
}
