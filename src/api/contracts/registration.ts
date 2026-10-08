import { z } from 'zod'

export const RegistrationStatusSchema = z.enum([
  'registered',
  'waitlisted',
  'cancelled',
  'checked_in',
])

export type RegistrationStatus = z.infer<typeof RegistrationStatusSchema>

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
  answers: z.record(z.any()), // dynamic answers from formSchema
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

export const AttendanceSchema = z.object({
  registrationId: z.string(),
  eventId: z.string(),
  ticketCode: z.string(),
  checkedInAt: z.string(),
  checkedInBy: z.string(),
})

export type Attendance = z.infer<typeof AttendanceSchema>
