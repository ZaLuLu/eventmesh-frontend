import { z } from 'zod'

export const AnnouncementKindSchema = z.enum([
  'notice',
  'deadline',
  'event_change',
  'venue_change',
  'result',
  'club',
  'general',
])

export type AnnouncementKind = z.infer<typeof AnnouncementKindSchema>

export const AnnouncementSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  organizerId: z.string().optional(),
  organizerName: z.string().optional(),
  organizerColor: z.string().optional(),
  kind: AnnouncementKindSchema,
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(5, 'Body is required'),
  pinned: z.boolean().default(false),
  publishedAt: z.string(),
})

export type Announcement = z.infer<typeof AnnouncementSchema>
