import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api'

export function useCertificates(filter: { eventId?: string; clubId?: string }) {
  return useQuery({
    queryKey: ['certificates', filter],
    queryFn: () => api.certificates.getCertificates(filter),
  })
}

export function useMyCertificates() {
  return useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => api.certificates.getMyCertificates(),
  })
}

export function useGenerateCertificates() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      eventId,
      recipientIds,
      templateId,
    }: {
      eventId: string
      recipientIds: string[]
      templateId?: string
    }) => api.certificates.generateCertificates(eventId, recipientIds, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
    },
  })
}

export function useVerifyCertificate(certificateId: string) {
  return useQuery({
    queryKey: ['verify-certificate', certificateId],
    queryFn: () => api.certificates.verifyCertificate(certificateId),
    enabled: Boolean(certificateId),
  })
}
