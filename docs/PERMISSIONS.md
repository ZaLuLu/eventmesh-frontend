# EventMesh Permissions & Role-Based Access Control (RBAC)

EventMesh employs a strict hierarchical and scope-isolated permission engine (`src/lib/permissions.ts`). The platform strictly enforces **Multi-Club Data Isolation**: Club Leads and Club Admins can manage resources belonging only to their designated club. They cannot read private drafts, modify configurations, or alter registrations of other clubs.

---

## 1. Persona Hierarchy & Definitions

| Role | Scope | Description |
|---|---|---|
| `ANONYMOUS` | Public | Unauthenticated visitors. Can view published events, clubs, gallery, announcements, and verify certificates. |
| `ATTENDEE` | User | Authenticated visitor or participant. Can register for events, view personal tickets, and submit feedback. |
| `VOLUNTEER` | Club | Operational member. Has access to the check-in gate terminal and live attendee lookup for their club's events. |
| `CLUB_LEAD` | Club | Event manager for a specific club. Can draft, edit, and coordinate their club's events and registration forms. |
| `CLUB_ADMIN` | Club | Full operational authority over their specific club. Can publish events, approve registrations, issue certificates, and customize club profiles. |
| `ORG_ADMIN` | Organization | Executive officer for the entire association. Has oversight over all 9 clubs, can assign club admins, and access aggregated analytics. |
| `SYSTEM_ADMIN`| Platform | Root platform owner. Full access across all organizations, audit logs, system configurations, and security policies. |

---

## 2. Granular Permissions Matrix

| Resource / Action | ANONYMOUS | ATTENDEE | VOLUNTEER | CLUB_LEAD | CLUB_ADMIN | ORG_ADMIN | SYSTEM_ADMIN |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Events** | | | | | | | |
| View Published Events | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Club Drafts | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Create Event Draft | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Edit Event | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Publish / Unpublish Event | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Delete Event | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| **Registration & Attendees** | | | | | | | |
| Register for Event | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Own Ticket / QR | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Club Registrations List | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Approve / Reject Registrations | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Export Attendee CSV | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| **Check-in Terminal** | | | | | | | |
| Scan QR & Mark Check-in | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Manual Ticket Code Override | ❌ | ❌ | ✅ *(own)* | ✅ *(own)* | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| **Certificates** | | | | | | | |
| Verify Certificate (/verify/:id)| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Download Own Certificate | ❌ | ✅ *(recipient)* | ✅ *(recipient)* | ✅ *(recipient)* | ✅ *(recipient)* | ✅ | ✅ |
| Batch Generate Certificates | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Revoke Certificate | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| **Club Management** | | | | | | | |
| View Public Club Page | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Update Theme Color & Bio | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Manage Club Members / Leads | ❌ | ❌ | ❌ | ❌ | ✅ *(own)* | ✅ *(all)* | ✅ *(all)* |
| Create New Club | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Platform Administration** | | | | | | | |
| View Organization Analytics | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View System Audit Logs | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Modify Organization Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

*(own) = Restricted exclusively to resources belonging to the user's assigned club.*  
*(all) = Unrestricted across all clubs in the organization.*

---

## 3. Implementation in Code

The RBAC rule engine is implemented in `src/lib/permissions.ts`:

```typescript
import { User, PermissionAction, Resource } from '@/api'

export function can(
  user: User | null | undefined,
  action: PermissionAction,
  resource: Resource
): boolean {
  if (!user) {
    return action === 'read:public'
  }

  // System Admin and Org Admin bypass club scoping
  if (user.role === 'SYSTEM_ADMIN') return true
  if (user.role === 'ORG_ADMIN' && resource.orgId === user.orgId) return true

  // Club Scoping Check
  if (resource.clubId && resource.clubId !== user.clubId) {
    return false // Multi-club isolation strictly enforced
  }

  // Role action evaluation...
}
```

The hook `usePermission()` exposes helpers throughout the UI:
- `canCreateEvent`: `boolean`
- `canPublishEvent`: `boolean`
- `canCheckin`: `boolean`
- `isClubAdmin`: `boolean`
- `isOrgAdmin`: `boolean`
- `clubId`: Assigned club UUID
