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
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export type Event = z.infer<typeof EventSchema>
