import { useQuery } from '@tanstack/react-query'
import { api, Organization } from '@/api'
import { LABELS } from '@/config/labels'

export function useOrg() {
  const { data: organization, isLoading } = useQuery<Organization>({
    queryKey: ['organization'],
    queryFn: () => api.organizations.getOrganization(),
    staleTime: 1000 * 60 * 30,
  })

  return {
    organization,
    labels: organization?.labels || LABELS,
    settings: organization?.settings,
    isLoading,
  }
}
