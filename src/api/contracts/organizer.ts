import { z } from 'zod'
import { PersonReferenceSchema } from './organization'

export const OrganizerGalleryItemSchema = z.object({
  id: z.string(),
  url: z.string(),
  caption: z.string().optional(),
  eventId: z.string().optional(),
})

export type OrganizerGalleryItem = z.infer<typeof OrganizerGalleryItemSchema>

export const OrganizerSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color'),
  logo: z.string().optional(),
  about: z.string(),
  whatWeDo: z.string(),
  coordinators: z.array(PersonReferenceSchema).default([]),
  studentCoordinators: z.array(PersonReferenceSchema).default([]),
  achievements: z.array(z.string()).default([]),
  gallery: z.array(OrganizerGalleryItemSchema).default([]),
  joinMode: z.enum(['open', 'application', 'invite_only']).default('open'),
  followersCount: z.number().default(0),
  isFollowed: z.boolean().optional(),
})

export type Organizer = z.infer<typeof OrganizerSchema>
export type Club = Organizer

export function normalizeBackendOrganization(org: any): Organizer {
  const defaultColors = ['#0047FF', '#C66A4A', '#2F4BD6', '#7B63A8', '#0070F3', '#FF6B35']
  const slugStr = org.slug || 'club'
  const hash = slugStr.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0)
  const color = defaultColors[Math.abs(hash) % defaultColors.length]
  const parentNote = org.parent_name ? ` · Part of ${org.parent_name}` : ''

  return {
    id: org.id,
    orgId: org.parent_slug || org.slug,
    name: org.name,
    slug: org.slug,
    color,
    logo: org.avatar_url || undefined,
    about: org.description || `Autonomous student collective${parentNote}.`,
    whatWeDo: org.description || `Hands-on collegiate engineering and creative building${parentNote}.`,
    coordinators: [],
    studentCoordinators: [],
    achievements: [],
    gallery: [],
    joinMode: 'open',
    followersCount: 140,
    isFollowed: false,
  }
}

