import { z } from 'zod'

export const RegistrationStatusSchema = z.enum([
  'registered',
  'waitlisted',
  'cancelled',
  'checked_in',
])

export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>

/**
 * Official FastAPI backend registration response schema:
 * POST /api/v1/events/{slug}/register & GET /api/v1/registrations
 */
export interface RegistrationRead {
  id: string
  native_event_id: string
  user_id: string
  status: 'registered' | 'cancelled' | 'checked_in' | 'waitlisted'
  created_at: string
  event?: {
    id: string
    slug: string
    title: string
    start_time?: string
    venue_name?: string | null
    cover_image_url?: string | null
    organization?: {
      name: string
    } | null
  }
}

/**
 * Official FastAPI backend attendee roster item schema:
 * GET /api/v1/events/{slug}/registrations
 */
export interface AttendeeRead {
  user_id: string
  email: string
  display_name: string
  handle: string
  institution_name: string | null
  student_id: string | null
  status: string
  created_at: string
}

export const TeamInfoSchema = z.object({
  teamName: z.string().min(1, 'Team name is required'),
  leaderName: z.string(),
  leaderEmail: z.string().email(),
  members: z.array(
    z.object({
      name: z.string(),
      email: z.string().email(),
      role: z.string().optional(),
    })
  ),
})

export type TeamInfo = z.infer<typeof TeamInfoSchema>

export const RegistrationSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  userName: z.string(),
  userPhone: z.string().optional(),
  answers: z.record(z.any()).default({}),
  team: TeamInfoSchema.optional(),
  status: RegistrationStatusSchema.default('registered'),
  ticketCode: z.string(), // e.g. "TKT-884192"
  createdAt: z.string(),
  checkedInAt: z.string().optional(),
  checkedInBy: z.string().optional(),
  eventTitle: z.string().optional(),
  eventSlug: z.string().optional(),
  organizerName: z.string().optional(),
  organizerColor: z.string().optional(),
  eventStartsAt: z.string().optional(),
})

export type Registration = z.infer<typeof RegistrationSchema>

export function normalizeBackendRegistration(raw: RegistrationRead | any): Registration {
  const ticketCode = raw.ticketCode || `PASS-${(raw.id || '').slice(0, 8).toUpperCase() || 'EM-01'}`
  return {
    id: raw.id || '',
    eventId: raw.native_event_id || raw.eventId || '',
    userId: raw.user_id || raw.userId || '',
    userEmail: raw.userEmail || raw.email || '',
    userName: raw.userName || raw.display_name || 'Passholder',
    answers: raw.answers || {},
    team: raw.team,
    status: (raw.status as RegistrationStatus) || 'registered',
    ticketCode,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    checkedInAt: raw.checkedInAt,
    checkedInBy: raw.checkedInBy,
    eventTitle: raw.event?.title || raw.eventTitle || 'Event Pass',
    eventSlug: raw.event?.slug || raw.eventSlug || '',
    organizerName: raw.event?.organization?.name || raw.organizerName || 'Event Host',
    organizerColor: raw.organizerColor || '#1A73E8',
    eventStartsAt: raw.event?.start_time || raw.eventStartsAt,
  }
}

export const AttendanceSchema = z.object({
  registrationId: z.string(),
  eventId: z.string(),
  ticketCode: z.string(),
  checkedInAt: z.string(),
  checkedInBy: z.string(),
})

export type Attendance = z.infer<typeof AttendanceSchema>

