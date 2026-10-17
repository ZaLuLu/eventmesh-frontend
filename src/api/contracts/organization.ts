import { z } from 'zod'

export const PersonReferenceSchema = z.object({
  name: z.string(),
  role: z.string(),
  photo: z.string().optional(),
  bio: z.string().optional(),
})

export type PersonReference = z.infer<typeof PersonReferenceSchema>

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().optional(),
  tagline: z.string().optional(),
  vision: z.string(),
  mission: z.string(),
  objectives: z.array(z.string()),
  coordinators: z.array(PersonReferenceSchema),
  officeBearers: z.array(PersonReferenceSchema),
  achievements: z.array(z.string()),
  stats: z.object({
    events: z.number(),
    registrations: z.number(),
    certificates: z.number(),
    clubs: z.number(),
  }),
  labels: z.object({
    organizer: z.string(),
    member: z.string(),
    audienceSegments: z.array(z.string()),
  }),
  settings: z.object({
    requireEventApproval: z.boolean().default(false),
    defaultCurrency: z.string().default('INR'),
    allowPaidEvents: z.boolean().default(false),
  }),
})

export type Organization = z.infer<typeof OrganizationSchema>

/* =========================================================================
   FASTAPI BACKEND CANONICAL ORGANIZATION SCHEMAS (API v1)
   ========================================================================= */

export interface OrganizationRead {
  id: string
  slug: string
  name: string
  type: string
  is_institution: boolean
  description: string | null
  website: string | null
  contact_email?: string | null
  phone?: string | null
  city?: string | null
  region?: string | null
  country?: string | null
  logo_url?: string | null
  avatar_url?: string | null
  is_archived?: boolean
  owner_id: string
  status: string
  role?: string | null
  parent_organization_id?: string | null
  parent_id?: string | null
  parent_slug?: string | null
  parent_name?: string | null
  institution_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface MemberRead {
  user_id: string
  role: 'owner' | 'admin' | 'manager' | 'member' | string
  email?: string
  display_name?: string
}

export interface CreateOrgPayload {
  name: string
  type?: string
  contact_email?: string
  slug?: string
  description?: string
  website?: string
  phone?: string
  city?: string
  region?: string
  country?: string
  logo_url?: string
}

export interface CreateSubOrgPayload extends CreateOrgPayload {
  admin_email: string
}

export interface CreateClubPayload {
  name: string
  slug?: string
  description?: string
  website?: string
  contact_email?: string
}

/* =========================================================================
   INVITATION & PROPOSAL SCHEMAS
   ========================================================================= */

export type OrgRoleType = 'head_admin' | 'main_admin' | 'co_admin' | 'manager' | 'member' | string

export interface InvitationCreate {
  role?: OrgRoleType
  recipient_email?: string | null
  expires_in_days?: number
}

export interface InvitationRead {
  id: string
  organization_id: string
  organization_name?: string | null
  organization_slug?: string | null
  role: OrgRoleType
  recipient_email?: string | null
  invited_by_id: string
  invited_by_name?: string | null
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | string
  expires_at: string
  created_at: string
}

export interface InvitationCreatedResponse extends InvitationRead {
  token: string
  invite_url: string
}

export interface InvitationAccept {
  token: string
}

export interface ProposalCreate {
  name: string
  slug?: string | null
  description?: string | null
  type?: string | null
  contact_email?: string | null
  phone?: string | null
  city?: string | null
  region?: string | null
  country?: string | null
  logo_url?: string | null
  reason?: string | null
}

export interface ProposalRead {
  id: string
  parent_organization_id: string
  parent_organization_name?: string | null
  parent_organization_slug?: string | null
  proposed_organization_id: string
  proposed_organization_name?: string | null
  proposed_organization_slug?: string | null
  proposer_id: string
  proposer_name?: string | null
  status: 'pending' | 'approved' | 'rejected' | string
  reason?: string | null
  reviewed_by_id?: string | null
  reviewed_at?: string | null
  created_at: string
}

export interface ProposalReview {
  action: 'approve' | 'reject'
  reason?: string | null
}

