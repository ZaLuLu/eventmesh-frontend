import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, RegisterPayload, RegistrationStatus } from '@/api'

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: RegisterPayload) => api.registrations.register(payload),
    onSuccess: (newReg) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['event', newReg.eventId] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
    },
  })
}

export function useRegisterPass() {
  const queryClient = useQueryClient()
  return useMutation<any, Error, string>({
    mutationFn: (eventSlug: string) => {
      if (api.registrations.registerPass) {
        return api.registrations.registerPass(eventSlug)
      }
      return api.registrations.register({ eventId: eventSlug, answers: {} })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useCancelRegistration() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (eventSlug: string) => {
      if (api.registrations.cancelRegistration) {
        return api.registrations.cancelRegistration(eventSlug)
      }
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useRegistrations(filter: {
  eventId?: string
  clubId?: string
  status?: RegistrationStatus
  search?: string
}) {
  return useQuery({
    queryKey: ['registrations', filter],
    queryFn: () => api.registrations.getRegistrations(filter),
  })
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.registrations.getMyRegistrations(),
  })
}

export function useUpdateRegistrationStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RegistrationStatus }) =>
      api.registrations.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
    },
  })
}

export function useCancelMyRegistration() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (registrationId: string) => {
      if (api.registrations.cancelMyRegistration) {
        return api.registrations.cancelMyRegistration(registrationId)
      }
      return Promise.resolve(true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventId, answers = {} }: { eventId: string; answers?: Record<string, any> }) => {
      if (api.registrations.joinWaitlist) {
        return api.registrations.joinWaitlist(eventId, answers)
      }
      return api.registrations.register({ eventId, answers })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['event', res.eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
