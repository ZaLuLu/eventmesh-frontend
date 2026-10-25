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
  registration_id?: string | null
  status: string
  qr_ticket_code?: string | null
  checked_in_at?: string | null
  created_at: string
  email?: string | null
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  handle?: string | null
  institution_name?: string | null
  student_id?: string | null
}

export interface TeamLookupResult {
  team_code: string
  team_name: string
  leader_name: string
  leader_id: string
  members: Array<{
    user_id: string
    name: string
    email?: string | null
    role: string
    status: string
  }>
  min_size: number
  max_size: number
  is_full: boolean
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
  tierName: z.string().optional(),
  waitlistPosition: z.number().optional(),
  eventTitle: z.string().optional(),
  eventSlug: z.string().optional(),
  organizerName: z.string().optional(),
  organizerColor: z.string().optional(),
  eventStartsAt: z.string().optional(),
  venueName: z.string().optional(),
  orderId: z.string().optional(),
  paidAmountCents: z.number().optional(),
  isPaid: z.boolean().optional(),
  refundStatus: z.enum(['not_refunded', 'pending', 'refunded', 'failed']).optional(),
  qrCodeDataUrl: z.string().optional(),
})

export type Registration = z.infer<typeof RegistrationSchema>

export function normalizeBackendRegistration(raw: RegistrationRead | any): Registration {
  const ticketCode =
    raw.ticketCode ||
    raw.qr_ticket_code ||
    raw.ticket_code ||
    raw.ticketId ||
    `PASS-${(raw.id || raw.registration_id || '').slice(0, 8).toUpperCase() || 'EM-01'}`
  const checkedInAt = raw.checkedInAt || raw.checked_in_at
  const status: RegistrationStatus =
    checkedInAt || raw.status === 'checked_in'
      ? 'checked_in'
      : ((raw.status as RegistrationStatus) || 'registered')

  return {
    id: raw.id || raw.registration_id || '',
    eventId: raw.native_event_id || raw.eventId || '',
    userId: raw.user_id || raw.userId || '',
    userEmail: raw.userEmail || raw.email || '',
    userName:
      raw.user_display_name ||
      raw.userName ||
      raw.display_name ||
      (raw.first_name ? `${raw.first_name} ${raw.last_name || ''}`.trim() : 'Passholder'),
    userPhone: raw.userPhone || raw.phone,
    answers: raw.answers || {},
    team: raw.team,
    status,
    ticketCode,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    checkedInAt,
    checkedInBy: raw.checkedInBy || raw.checked_by_user_id,
    tierName: raw.tierName || raw.tier_name || (raw.event_type ? raw.event_type.toUpperCase() : undefined),
    waitlistPosition: raw.waitlistPosition || raw.waitlist_position,
    eventTitle: raw.event_title || raw.event?.title || raw.eventTitle || raw.title || 'Event Pass',
    eventSlug: raw.event_slug || raw.event?.slug || raw.eventSlug || raw.slug || '',
    organizerName:
      raw.organization_name ||
      raw.event?.organization?.name ||
      raw.organizerName ||
      raw.clubName ||
      'Campus Host',
    organizerColor: raw.organizerColor || '#1A73E8',
    eventStartsAt: raw.start_time || raw.event?.start_time || raw.eventStartsAt,
    venueName: raw.venue_name || raw.event?.venue_name || raw.venueName || 'Main Campus Venue',
    orderId: raw.orderId || raw.order_id,
    paidAmountCents: raw.paidAmountCents || raw.amount_cents,
    isPaid: raw.isPaid ?? raw.is_paid ?? Boolean(raw.orderId || raw.order_id || raw.paidAmountCents),
    refundStatus: raw.refundStatus || raw.refund_status,
    qrCodeDataUrl: raw.qr_code_data_url || raw.qrCodeDataUrl,
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

