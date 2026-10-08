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
