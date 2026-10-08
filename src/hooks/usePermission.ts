import { useAuth } from './useAuth'
import { can, canAccessAdmin, PermissionAction, ResourceContext } from '@/lib/permissions'

export function usePermission() {
  const { session } = useAuth()

  return {
    can: (action: PermissionAction, resource?: ResourceContext) =>
      can(session, action, resource),
    canAccessAdmin: () => canAccessAdmin(session),
    role: session?.role || null,
    clubId: session?.clubId || null,
    user: session,
  }
}
