import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, RegisterPayload, Registration, RegistrationStatus } from '@/api'

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
  return useMutation<any, Error, string>({
    mutationFn: async (eventSlugOrId: string) => {
      if (api.registrations.cancelRegistration) {
        return api.registrations.cancelRegistration(eventSlugOrId)
      }
      if (api.registrations.cancelMyRegistration) {
        return api.registrations.cancelMyRegistration(eventSlugOrId)
      }
      return Promise.resolve()
    },
    onSuccess: (_, eventSlugOrId) => {
      queryClient.setQueriesData<Registration[]>({ queryKey: ['my-registrations'] }, (old) => {
        if (!old) return []
        return old.map((r) =>
          r.id === eventSlugOrId || r.eventSlug === eventSlugOrId || r.eventId === eventSlugOrId
            ? { ...r, status: 'cancelled' as RegistrationStatus }
            : r
        )
      })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
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
    mutationFn: async (param: string | { registrationId?: string; eventSlug?: string }) => {
      const regId = typeof param === 'string' ? param : (param.registrationId || param.eventSlug)
      const eventSlug = typeof param === 'object' ? param.eventSlug : undefined

      if (api.registrations.cancelMyRegistration && regId) {
        return api.registrations.cancelMyRegistration(regId)
      }
      if (api.registrations.cancelRegistration && (eventSlug || regId)) {
        return api.registrations.cancelRegistration(eventSlug || regId!)
      }
      return Promise.resolve(true)
    },
    onSuccess: (_, variables) => {
      const targetId = typeof variables === 'string' ? variables : (variables.registrationId || variables.eventSlug)
      queryClient.setQueriesData<Registration[]>({ queryKey: ['my-registrations'] }, (old) => {
        if (!old) return []
        return old.map((r) =>
          r.id === targetId || r.eventSlug === targetId || r.eventId === targetId
            ? { ...r, status: 'cancelled' as RegistrationStatus }
            : r
        )
      })
      queryClient.invalidateQueries({ queryKey: ['registrations'] })
      queryClient.invalidateQueries({ queryKey: ['my-registrations'] })
      queryClient.invalidateQueries({ queryKey: ['event'] })
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
