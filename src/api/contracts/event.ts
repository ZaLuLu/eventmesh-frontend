import { z } from 'zod'
import { FormFieldSchema } from './formSchema'

export const EventStatusSchema = z.enum([
  'draft',
  'submitted',
  'preview',
  'pending_review',
  'hidden',
  'in_review',
  'published',
  'registration_closed',
  'live',
  'completed',
  'archived',
  'cancelled',
])

export type EventStatus = z.infer<typeof EventStatusSchema>

export const EventTypeSchema = z.enum([
  'workshop',
  'hackathon',
  'competition',
  'talk',
  'other',
])

export type EventType = z.infer<typeof EventTypeSchema>

export const VenueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  address: z.string().optional(),
  mapUrl: z.string().optional(),
})

export type Venue = z.infer<typeof VenueSchema>

export const ScheduleItemSchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string().optional(),
})

export type ScheduleItem = z.infer<typeof ScheduleItemSchema>

export const PersonRoleSchema = z.enum(['speaker', 'judge', 'instructor', 'mentor', 'guest'])

export const EventPersonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: PersonRoleSchema,
  bio: z.string().optional(),
  photo: z.string().optional(),
})

export type EventPerson = z.infer<typeof EventPersonSchema>

export const ContactSchema = z.object({
  name: z.string().min(1, 'Contact person name is required'),
  phone: z.string().optional(),
  email: z.string().email('Valid contact email is required'),
})

export type Contact = z.infer<typeof ContactSchema>

export const EventResultSchema = z.object({
  position: z.string(), // e.g. "1st Place", "Runner Up"
  winnerName: z.string(),
  projectTitle: z.string().optional(),
  notes: z.string().optional(),
})

export type EventResult = z.infer<typeof EventResultSchema>

export const EventSchema = z.object({
  id: z.string(),
  slug: z.string(),
  orgId: z.string(),
  organizerId: z.string(),
  title: z.string().min(2, 'Event title is required'),
  subtitle: z.string().optional(),
  category: z.string(),
  type: EventTypeSchema,
  tags: z.array(z.string()).default([]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  poster: z.string(),
  banner: z.string().optional(),
  venue: VenueSchema,
  startsAt: z.string(), // ISO string
  endsAt: z.string(), // ISO string
  eligibility: z.string().default('Open to all registered members'),
  capacity: z.number().int().positive().nullable(),
  seatsLeft: z.number().int().nonnegative().nullable(),
  waitlistEnabled: z.boolean().default(true),
  registrationOpensAt: z.string(),
  registrationClosesAt: z.string(),
  schedule: z.array(ScheduleItemSchema).default([]),
  people: z.array(EventPersonSchema).default([]),
  rules: z.array(z.string()).default([]),
  contact: ContactSchema,
  certificateInfo: z.string().optional(),
  features: z.object({
    certificate: z.boolean().default(true),
    checkin: z.boolean().default(true),
    paid: z.boolean().default(false),
    team: z.boolean().default(false),
  }),
  teamConfig: z
    .object({
      minSize: z.number().int().default(1),
      maxSize: z.number().int().default(4),
    })
    .optional(),
  formSchema: z.array(FormFieldSchema).default([]),
  status: EventStatusSchema.default('published'),
  results: z.array(EventResultSchema).default([]),
  photos: z.array(z.string()).default([]),
  organizerColor: z.string().default('#C66A4A'),
  organizerName: z.string().optional(),
  isSignature: z.boolean().default(false),
  isFree: z.boolean().optional(),
  isOnline: z.boolean().optional(),
  price: z.number().optional(),
  kind: z.enum(['native', 'imported']).optional(),
  sourceUrl: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  sources: z.array(z.string()).optional(),
  currency: z.string().nullable().optional(),
  timezone: z.string().nullable().optional(),
  registrationState: z.enum(['open', 'full', 'closed', 'not_required']).optional(),
  promotion: z
    .object({
      label: z.enum(['Promoted', 'Featured']),
      priority: z.number().int().default(1),
      startsAt: z.string(),
      endsAt: z.string(),
    })
    .optional(),
  publishedAt: z.string().optional(),
  registrationsCount: z.number().int().nonnegative().default(0),
  club: z
    .object({
      id: z.string(),
      name: z.string(),
      color: z.string(),
      verified: z.boolean().default(false),
    })
    .optional(),
  institutionName: z.string().optional(),
  institutionSlug: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Event = z.infer<typeof EventSchema>

/* =========================================================================
   FASTAPI BACKEND CANONICAL SCHEMAS (API v1)
   ========================================================================= */

/**
 * Event Discovery Item: VisibleEventRead
 * Returned by GET /api/v1/events
 */
export interface VisibleEventRead {
  kind: 'native' | 'imported'
  id: string
  slug: string | null
  title: string
  description: string | null
  image_url: string | null
  start_time: string // ISO-8601
  end_time: string | null // ISO-8601
  timezone: string | null
  city: string | null
  venue: string | null
  is_online?: boolean
  is_free: boolean
  price_cents: number | null
  currency: string | null
  category: string | null
  url: string | null // Click-through URL for imported events
  provider: string | null
  sources: string[]
  organization_id?: string | null
  organization_name?: string | null
  organization_slug?: string | null
  institution_name?: string | null
  institution_slug?: string | null
  organization?: {
    id: string
    name: string
    slug: string
    logo_url: string | null
  } | null
  institution?: {
    id: string
    name: string
    slug: string
  } | null
  audience_type: string
}

/**
 * Single Event Detail: EventRead
 * Returned by GET /api/v1/events/{slug} and organization event endpoints
 */
export interface EventRead {
  id: string
  slug: string
  title: string
  description: string | null
  status: 'draft' | 'submitted' | 'published' | 'cancelled' | 'archived' | string
  event_type: string
  visibility: string
  audience_type: 'public' | 'open' | 'institution_only'
  start_time: string
  end_time: string | null
  timezone: string | null
  venue_name: string | null
  venue_address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  is_online?: boolean
  is_free: boolean
  price_cents: number | null
  currency: string | null
  capacity: number | null
  registration_required: boolean
  registration_closes_at: string | null
  cover_image_url: string | null
  refund_policy: string | null
  organization_id?: string | null
  organization_name?: string | null
  organization_slug?: string | null
  institution_name?: string | null
  institution_slug?: string | null
  organization?: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
  }
  institution?: {
    id: string
    name: string
    slug: string
  } | null
  registration_state: 'open' | 'full' | 'closed' | 'not_required'
  spots_remaining: number | null
  created_at: string
  updated_at: string
}

export interface EventBrowseParams {
  limit?: number
  offset?: number
  q?: string
  city?: string
  category?: string
  source?: string
  free?: boolean
  online?: boolean
  date_range?: 'all' | 'today' | 'week' | 'month'
}

export interface EventBrowseResponse {
  total: number
  items: VisibleEventRead[]
  next_offset: number | null
}

/**
 * Converts a backend VisibleEventRead or EventRead into the frontend UI Event shape
 */
export function normalizeBackendEvent(item: VisibleEventRead | EventRead): Event {
  const detail = 'registration_state' in item ? item : undefined
  const browse = 'kind' in item ? item : undefined
  const orgId = item.organization_id || item.organization?.id || ''
  const orgName = item.organization_name || item.organization?.name || undefined
  const imageUrl = detail?.cover_image_url || browse?.image_url
  const status = EventStatusSchema.safeParse(detail?.status || 'published')
  const isOnline = item.is_online ?? (detail ? detail.event_type === 'online' : undefined)

  return {
    id: item.id,
    slug: item.slug || '',
    kind: browse?.kind || 'native',
    sourceUrl: browse?.url,
    provider: browse?.provider,
    sources: browse?.sources,
    currency: item.currency,
    timezone: item.timezone,
    registrationState: detail?.registration_state,
    orgId,
    organizerId: orgId,
    title: item.title,
    subtitle: orgName,
    category: browse?.category || detail?.event_type || 'General',
    type: 'other',
    tags: [item.city, isOnline ? 'Online' : undefined].filter((tag): tag is string => Boolean(tag)),
    description: item.description || '',
    poster: imageUrl || '',
    banner: imageUrl || undefined,
    venue: {
      name: detail?.venue_name || browse?.venue || item.city || '',
      address: detail?.venue_address || undefined,
    },
    startsAt: item.start_time || '',
    endsAt: item.end_time || '',
    eligibility: item.audience_type === 'institution_only' ? 'Institution members only' : 'Open to all',
    capacity: detail?.capacity ?? null,
    seatsLeft: detail?.spots_remaining ?? null,
    waitlistEnabled: detail?.registration_state === 'full',
    registrationOpensAt: '',
    registrationClosesAt: detail?.registration_closes_at || '',
    schedule: [], people: [], rules: [],
    contact: { name: orgName || '', email: '' },
    features: { certificate: false, checkin: !browse || browse.kind === 'native', paid: !item.is_free, team: false },
    formSchema: [],
    // Unknown service states must not imply that registration is open.
    status: status.success ? status.data : 'registration_closed',
    results: [], photos: [],
    organizerName: orgName,
    organizerColor: 'var(--color-accent)',
    isSignature: false,
    isFree: item.is_free,
    price: item.price_cents == null ? undefined : item.price_cents / 100,
    isOnline,
    registrationsCount: 0,
    institutionName: item.institution_name || item.institution?.name || undefined,
    institutionSlug: item.institution_slug || item.institution?.slug || undefined,
    club: orgName ? { id: orgId, name: orgName, color: 'var(--color-accent)', verified: false } : undefined,
  }
}
