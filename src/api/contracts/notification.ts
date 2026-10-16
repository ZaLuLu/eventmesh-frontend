import { z } from 'zod'

export const AudienceTypeSchema = z.enum([
  'all',
  'followers',
  'club_members',
  'past_attendees',
  'segment',
  'custom',
])

export type AudienceType = z.infer<typeof AudienceTypeSchema>

export const NotificationAudienceSchema = z.object({
  type: AudienceTypeSchema,
  segmentId: z.string().optional(),
  userIds: z.array(z.string()).optional(),
  description: z.string().optional(),
})

export type NotificationAudience = z.infer<typeof NotificationAudienceSchema>

export const NotificationSchema = z.object({
  id: z.string(),
  orgId: z.string(),
  organizerId: z.string().optional(),
  organizerName: z.string().optional(),
  eventId: z.string().optional(),
  eventTitle: z.string().optional(),
  audience: NotificationAudienceSchema,
  title: z.string().min(2, 'Title is required'),
  body: z.string().min(5, 'Message body is required'),
  includes: z.object({
    poster: z.boolean().default(false),
    registrationLink: z.boolean().default(false),
    contact: z.boolean().default(false),
  }),
  channel: z.enum(['email', 'inapp']).default('email'),
  sentAt: z.string(),
  sentBy: z.string(),
  read: z.boolean().optional(),
  kind: z.enum(['announcement', 'reminder', 'waitlist_promoted', 'certificate_issued', 'general']).optional(),
  stats: z.object({
    recipientsCount: z.number().default(0),
    deliveredCount: z.number().default(0),
    openedCount: z.number().default(0),
  }),
})

export type Notification = z.infer<typeof NotificationSchema>

export const InAppNotificationSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  type: z.string(),
  organization_id: z.string().nullable().optional(),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).nullable().optional(),
  is_read: z.boolean().default(false),
  read_at: z.string().nullable().optional(),
  created_at: z.string(),
})

export type InAppNotification = z.infer<typeof InAppNotificationSchema>

export const InAppNotificationListResponseSchema = z.object({
  total: z.number(),
  unread_count: z.number(),
  total_unread: z.number().default(0),
  items: z.array(InAppNotificationSchema),
})

export type InAppNotificationListResponse = z.infer<typeof InAppNotificationListResponseSchema>
