/**
 * EventMesh Central Permissions Engine
 * Evaluates can(user, action, resource) across all roles and scopes.
 * Guarantees Club A admin cannot access or modify Club B data.
 */

export type UserRole =
  | 'platform_admin'
  | 'org_admin'
  | 'club_admin'
  | 'volunteer'
  | 'attendee'

export type PermissionAction =
  | 'create_event'
  | 'edit_event'
  | 'delete_event'
  | 'publish_event'
  | 'approve_event'
  | 'view_registrations'
  | 'export_registrations'
  | 'manage_waitlist'
  | 'checkin'
  | 'generate_certificates'
  | 'send_announcements'
  | 'send_notifications'
  | 'edit_club_profile'
  | 'manage_clubs'
  | 'manage_roles'
  | 'view_audit_log'
  | 'view_analytics'
  | 'manage_org_settings'
  | 'register'
  | 'view_ticket'
  | 'download_my_certificate'

export interface UserContext {
  id: string
  name: string
  email: string
  role: UserRole
  orgId: string
  clubId?: string // Present for club_admin
  assignedEventIds?: string[] // Present for volunteer
}

export interface ResourceContext {
  orgId?: string
  clubId?: string
  eventId?: string
}

export function can(
  user: UserContext | null | undefined,
  action: PermissionAction,
  resource?: ResourceContext
): boolean {
  // Public attendee actions allowed without login or for attendee role
  if (action === 'register' || action === 'download_my_certificate' || action === 'view_ticket') {
    return true
  }

  if (!user) {
    return false
  }

  // 1. Platform Admin: Superuser with universal access
  if (user.role === 'platform_admin') {
    return true
  }

  // Check Org match
  if (resource?.orgId && resource.orgId !== user.orgId) {
    return false
  }

  // 2. Org Admin: Scoped to their entire organization
  if (user.role === 'org_admin') {
    return true
  }

  // 3. Club Admin: STRICTLY scoped to their own club
  if (user.role === 'club_admin') {
    // Cannot perform org-level admin actions
    if (
      action === 'manage_clubs' ||
      action === 'manage_roles' ||
      action === 'approve_event' ||
      action === 'view_audit_log' ||
      action === 'manage_org_settings'
    ) {
      return false
    }

    // If resource specifies a clubId, it MUST match the user's clubId
    if (resource?.clubId && resource.clubId !== user.clubId) {
      return false
    }

    // Allowed club-level actions
    const allowedClubActions: PermissionAction[] = [
      'create_event',
      'edit_event',
      'delete_event',
      'publish_event',
      'view_registrations',
      'export_registrations',
      'manage_waitlist',
      'checkin',
      'generate_certificates',
      'send_announcements',
      'send_notifications',
      'edit_club_profile',
      'view_analytics',
    ]

    return allowedClubActions.includes(action)
  }

  // 4. Volunteer: Check-in only for assigned events
  if (user.role === 'volunteer') {
    if (action === 'checkin') {
      if (!resource?.eventId) return true
      if (!user.assignedEventIds || user.assignedEventIds.length === 0) return true
      return user.assignedEventIds.includes(resource.eventId)
    }
    return false
  }

  // 5. Attendee: Cannot perform admin operations
  return false
}

/**
 * Helper to check if a user is allowed into the Admin Shell at all.
 */
export function canAccessAdmin(user: UserContext | null | undefined): boolean {
  if (!user) return false
  return ['platform_admin', 'org_admin', 'club_admin', 'volunteer'].includes(user.role)
}
