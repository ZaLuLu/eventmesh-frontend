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
  type: string // 'institution' | 'organization' | 'club'
  is_institution: boolean
  description: string | null
  website: string | null
  contact_email: string | null
  phone: string | null
  city: string | null
  region: string | null
  country: string | null
  logo_url: string | null
  avatar_url?: string | null
  is_archived: boolean
  owner_id: string
  status: string
  role?: string | null // Caller's role in this organization
  parent_id?: string | null
  parent_name?: string | null
  institution_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface MemberRead {
  user_id: string
  role: 'owner' | 'manager' | 'member' | string
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
}

