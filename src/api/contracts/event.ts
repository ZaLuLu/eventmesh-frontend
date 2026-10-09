import { z } from 'zod'
import { FormFieldSchema } from './formSchema'

export const EventStatusSchema = z.enum([
  'draft',
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
  capacity: z.number().int().positive(),
  seatsLeft: z.number().int().nonnegative(),
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
  slug: string
  title: string
  description: string
  image_url: string | null
  start_time: string // ISO-8601
  end_time: string // ISO-8601
  timezone: string
  city: string | null
  venue: string | null
  is_online: boolean
  is_free: boolean
  price_cents: number | null
  currency: string | null
  category: string
  url: string | null // Click-through URL for imported events
  provider: string | null
  sources: string[]
  organization: {
    id: string
    name: string
    slug: string
    logo_url: string | null
  } | null
  institution: {
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
  description: string
  event_type: string
  visibility: 'draft' | 'preview' | 'published' | 'hidden' | 'archived'
  audience_type: 'open' | 'institution_only'
  start_time: string
  end_time: string
  timezone: string
  venue_name: string | null
  venue_address: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  is_online: boolean
  is_free: boolean
  price_cents: number | null
  currency: string | null
  capacity: number | null
  registration_required: boolean
  registration_closes_at: string | null
  cover_image_url: string | null
  refund_policy: string | null
  organization: {
    id: string
    name: string
    slug: string
    logo_url?: string | null
  }
  institution: {
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
  const isDetail = 'registration_state' in item
  const imageUrl = isDetail
    ? (item as EventRead).cover_image_url
    : (item as VisibleEventRead).image_url

  const venueName = isDetail
    ? (item as EventRead).venue_name
    : (item as VisibleEventRead).venue

  const spotsLeft = isDetail
    ? (item as EventRead).spots_remaining ?? 50
    : 50

  const capacityVal = isDetail
    ? (item as EventRead).capacity ?? 100
    : 100

  return {
    id: item.id,
    slug: item.slug,
    orgId: item.organization?.id || 'org-1',
    organizerId: item.organization?.id || 'org-1',
    title: item.title,
    subtitle: item.organization?.name,
    category: ('category' in item ? item.category : (item as EventRead).event_type) || 'General',
    type: 'workshop',
    tags: [item.city || 'Live', item.is_online ? 'Online' : 'In-Person'],
    description: item.description,
    poster: imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    banner: imageUrl || undefined,
    venue: {
      name: venueName || item.city || 'Main Hall',
      address: isDetail ? (item as EventRead).venue_address || undefined : undefined,
    },
    startsAt: item.start_time,
    endsAt: item.end_time,
    eligibility: item.audience_type === 'institution_only' ? 'Institution Members Only' : 'Open to All',
    capacity: capacityVal,
    seatsLeft: spotsLeft,
    waitlistEnabled: false,
    registrationOpensAt: item.start_time,
    registrationClosesAt: isDetail ? (item as EventRead).registration_closes_at || item.start_time : item.start_time,
    schedule: [],
    people: [],
    rules: [],
    contact: {
      name: item.organization?.name || 'Organizer',
      email: 'events@eventmesh.org',
    },
    features: {
      certificate: false,
      checkin: true,
      paid: !item.is_free,
      team: false,
    },
    formSchema: [],
    status: isDetail ? ((item as EventRead).visibility as any) : 'published',
    results: [],
    photos: [],
    organizerName: item.organization?.name,
    organizerColor: '#1A73E8',
    isSignature: false,
    isFree: item.is_free,
    price: (item.price_cents || 0) / 100,
    isOnline: item.is_online,
    registrationsCount: 0,
    club: {
      id: item.organization?.id || 'org-1',
      name: item.organization?.name || 'Organizer',
      color: '#1A73E8',
      verified: true,
    },
  }
}

