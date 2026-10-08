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
