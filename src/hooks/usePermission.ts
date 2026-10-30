import { useAuth } from './useAuth'
import { can, canAccessAdmin, canAccessSuperAdmin, PermissionAction, ResourceContext } from '@/lib/permissions'

export function usePermission() {
  const { session } = useAuth()
  const isSuper =
    session?.role === 'super_admin' ||
    (Boolean(session?.email) && session?.email?.toLowerCase().trim() === 'nayaklabs.ai@gmail.com')

  return {
    can: (action: PermissionAction, resource?: ResourceContext) =>
      can(session, action, resource),
    canAccessAdmin: () => canAccessAdmin(session),
    canAccessSuperAdmin: () => canAccessSuperAdmin(session),
    isSuperAdmin: isSuper,
    role: isSuper ? 'super_admin' : session?.role || null,
    clubId: session?.clubId || null,
    user: session,
  }
}
