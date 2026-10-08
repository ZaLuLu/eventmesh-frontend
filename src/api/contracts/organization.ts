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
