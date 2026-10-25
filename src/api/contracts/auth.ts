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
  phone: z.string().optional(),
  studentId: z.string().optional(),
  registrationNumber: z.string().optional(),
  institutionName: z.string().optional(),
  campus: z.string().optional(),
  branch: z.string().optional(),
  degreeBranch: z.string().optional(),
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

/**
 * Official FastAPI backend profile schema:
 * GET /api/v1/users/me & PATCH /api/v1/users/me
 */
export interface ProfileRead {
  id: string
  email: string
  handle: string | null
  display_name: string | null
  avatar_url: string | null
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  date_of_birth: string | null
  phone: string | null
  location: string | null
  college_email: string | null
  college_id: string | null
  student_id: string | null
  institution_name: string | null
  onboarding_completed: boolean
  institution_verified: boolean
  institution_verified_at: string | null
  role: string
  is_organizer: boolean
  created_at?: string
  updated_at?: string
}

export interface ProfileUpdatePayload {
  handle?: string
  display_name?: string
  avatar_url?: string | null
  first_name?: string
  middle_name?: string | null
  last_name?: string
  date_of_birth?: string | null
  phone?: string | null
  location?: string | null
  student_id?: string | null
  institution_name?: string | null
  college_name?: string | null
  branch?: string | null
  graduation_year?: number | null
  college_email?: string | null
  college_id?: string | null
}

export function profileToSession(profile: ProfileRead): UserSession {
  const regNumber = profile.student_id || undefined
  const branch = profile.location || (profile as any).branch || undefined
  const campus = profile.institution_name || (profile as any).college_name || undefined
  const phone = profile.phone || undefined

  return {
    id: profile.id,
    name:
      profile.display_name ||
      (profile.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : '') ||
      profile.handle ||
      profile.email,
    email: profile.email,
    role: profile.is_organizer ? 'org_admin' : 'attendee',
    orgId: profile.institution_name || 'campus',
    avatar: profile.avatar_url || undefined,
    phone,
    studentId: regNumber,
    registrationNumber: regNumber,
    institutionName: campus,
    campus,
    branch,
    degreeBranch: branch,
  }
}

