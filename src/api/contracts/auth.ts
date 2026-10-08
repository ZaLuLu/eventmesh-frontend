import { z } from 'zod'

export const UserRoleSchema = z.enum([
  'platform_admin',
  'org_admin',
  'club_admin',
  'volunteer',
  'attendee',
])

export type UserRole = z.infer<typeof UserRoleSchema>

export const UserSessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: UserRoleSchema,
  orgId: z.string(),
  clubId: z.string().optional(),
  clubName: z.string().optional(),
  clubColor: z.string().optional(),
  assignedEventIds: z.array(z.string()).optional(),
  avatar: z.string().optional(),
})

export type UserSession = z.infer<typeof UserSessionSchema>

export const SendOtpRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type SendOtpRequest = z.infer<typeof SendOtpRequestSchema>

export const VerifyOtpRequestSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
})

export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>
