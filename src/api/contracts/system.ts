import { z } from 'zod'

export const SyncRunSchema = z.object({
  id: z.string(),
  status: z.enum(['running', 'success', 'failed']),
  mode: z.enum(['full', 'incremental']).default('incremental'),
  citiesCount: z.number().int().nonnegative().default(23),
  eventsIngested: z.number().int().nonnegative().default(0),
  startedAt: z.string(),
  completedAt: z.string().nullable().optional(),
  triggeredBy: z.string().default('admin@eventmesh.internal'),
  logExcerpt: z.string().optional(),
})

export type SyncRun = z.infer<typeof SyncRunSchema>

export const TriggerSyncRequestSchema = z.object({
  mode: z.enum(['full', 'incremental']).default('incremental'),
  targetCities: z.array(z.string()).optional(),
})

export type TriggerSyncRequest = z.infer<typeof TriggerSyncRequestSchema>

export const TriggerSyncResponseSchema = z.object({
  status: z.string(),
  runId: z.string(),
  message: z.string(),
})

export type TriggerSyncResponse = z.infer<typeof TriggerSyncResponseSchema>

export const TestEmailRequestSchema = z.object({
  recipient: z.string().email(),
  template: z.enum([
    'event_ticket',
    'organizer_invite',
    'withdrawal_processed',
    'certificate_issued',
    'system_alert',
  ]),
})

export type TestEmailRequest = z.infer<typeof TestEmailRequestSchema>

export const TestEmailResponseSchema = z.object({
  status: z.string(),
  messageId: z.string(),
  recipient: z.string(),
  template: z.string(),
  sentAt: z.string(),
})

export type TestEmailResponse = z.infer<typeof TestEmailResponseSchema>
