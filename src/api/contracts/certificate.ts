import { z } from 'zod'

export const CertificateTemplateSchema = z.enum([
  'standard_editorial',
  'merit_distinction',
  'contributor_lead',
])

export type CertificateTemplate = z.infer<typeof CertificateTemplateSchema>

export const CertificateSchema = z.object({
  id: z.string(),
  certificateId: z.string(), // e.g. "TA-2026-001245"
  eventId: z.string(),
  registrationId: z.string(),
  recipientName: z.string(),
  recipientEmail: z.string(),
  eventTitle: z.string(),
  organizerName: z.string(),
  templateId: CertificateTemplateSchema.default('standard_editorial'),
  issuedAt: z.string(),
  verifyUrl: z.string(),
  status: z.enum(['valid', 'revoked']).default('valid'),
  metadata: z
    .object({
      role: z.string().optional(),
      meritLevel: z.string().optional(),
    })
    .optional(),
})

export type Certificate = z.infer<typeof CertificateSchema>

export const CertificateVerificationResultSchema = z.object({
  certificateId: z.string(),
  isValid: z.boolean(),
  recipientName: stringOrNull(),
  eventTitle: stringOrNull(),
  organizerName: stringOrNull(),
  issuedAt: stringOrNull(),
  verifiedAt: z.string(),
  templateId: z.string().optional(),
  message: z.string().optional(),
})

function stringOrNull() {
  return z.string().nullable().optional()
}

export type CertificateVerificationResult = z.infer<
  typeof CertificateVerificationResultSchema
>
