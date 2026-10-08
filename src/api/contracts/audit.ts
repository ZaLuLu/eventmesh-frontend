import { z } from 'zod'

export const AuditLogSchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  actorRole: z.string(),
  action: z.string(), // e.g. "event.create", "event.publish", "certificate.generate"
  entity: z.string(), // e.g. "event", "club", "registration"
  entityId: z.string(),
  diff: z.record(z.any()).optional(),
  at: z.string(),
})

export type AuditLog = z.infer<typeof AuditLogSchema>
